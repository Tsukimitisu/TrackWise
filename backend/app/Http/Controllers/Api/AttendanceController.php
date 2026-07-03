<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClockInRequest;
use App\Http\Requests\ClockOutRequest;
use App\Http\Requests\AttendanceRequest;
use App\Models\AttendanceLog;
use App\Models\UserProgram;
use App\Services\AccessScope;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AttendanceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', AttendanceLog::class);
        return response()->json(AttendanceLog::query()
            ->whereIn('user_program_id', AccessScope::assignmentIds($request->user()))
            ->with(['userProgram.user', 'userProgram.program', 'approver'])
            ->latest('date')
            ->paginate(min(366, max(1, $request->integer('per_page', 30)))));
    }

    public function store(AttendanceRequest $request): JsonResponse
    {
        $this->authorize('create', AttendanceLog::class);
        abort_if($request->user()->hasRole('Student'), 403, 'Students must use the server-timestamped clock-in and clock-out actions.');
        $payload = $request->validated();
        $assignment = UserProgram::query()->findOrFail($payload['user_program_id']);
        abort_unless(AccessScope::canViewAssignment($request->user(), $assignment), 403);
        if ($request->user()->hasRole('Student')) {
            abort_unless((int) $assignment->user_id === (int) $request->user()->id, 403);
        }

        $this->validateTimeOrder($payload['time_in'] ?? null, $payload['time_out'] ?? null);
        $payload['total_hours'] = $this->calculateHours($payload['time_in'] ?? null, $payload['time_out'] ?? null, (int) ($payload['break_minutes'] ?? 0));
        $payload['status'] = $this->resolveStatus($payload['time_in'] ?? null, $payload['time_out'] ?? null);
        $payload['approval_status'] = 'pending';

        return response()->json(AttendanceLog::create($payload), 201);
    }

    public function clockIn(ClockInRequest $request): JsonResponse
    {
        $this->authorize('create', AttendanceLog::class);
        $payload = $request->validated();
        $payload['date'] = now()->toDateString();
        $payload['time_in'] = now()->format('H:i');
        $assignment = UserProgram::query()->findOrFail($payload['user_program_id']);
        abort_unless(
            $request->user()->hasRole('Student')
                && (int) $assignment->user_id === (int) $request->user()->id,
            403
        );
        $attendanceLog = AttendanceLog::query()
            ->where('user_program_id', $payload['user_program_id'])
            ->whereDate('date', $payload['date'])
            ->first() ?? new AttendanceLog([
                'user_program_id' => $payload['user_program_id'],
                'date' => $payload['date'],
            ]);

        if ($attendanceLog->exists && $attendanceLog->time_in) {
            return response()->json(['message' => 'Time in already exists for this date.'], 422);
        }

        $attendanceLog->fill([
            'time_in' => $payload['time_in'],
            'time_in_photo' => $payload['time_in_photo'] ?? null,
            'latitude' => $payload['latitude'] ?? null,
            'longitude' => $payload['longitude'] ?? null,
            'remarks' => $payload['remarks'] ?? null,
            'status' => $this->resolveStatus($payload['time_in'], null),
            'approval_status' => 'pending',
            'break_minutes' => $attendanceLog->break_minutes ?? 0,
            'total_hours' => 0,
        ]);
        $attendanceLog->save();

        return response()->json($attendanceLog->fresh()->load('userProgram'), 201);
    }

    public function clockOut(ClockOutRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $payload['date'] = now()->toDateString();
        $payload['time_out'] = now()->format('H:i');
        $assignment = UserProgram::query()->findOrFail($payload['user_program_id']);
        abort_unless(
            $request->user()->hasRole('Student')
                && (int) $assignment->user_id === (int) $request->user()->id,
            403
        );
        $attendanceLog = AttendanceLog::query()->where([
            'user_program_id' => $payload['user_program_id'],
        ])->whereDate('date', $payload['date'])->first();

        if (! $attendanceLog || ! $attendanceLog->time_in) {
            return response()->json(['message' => 'Cannot time out without an existing time in.'], 422);
        }

        $this->authorize('update', $attendanceLog);
        $this->validateTimeOrder($attendanceLog->time_in, $payload['time_out']);
        $attendanceLog->fill([
            'time_out' => $payload['time_out'],
            'time_out_photo' => $payload['time_out_photo'] ?? null,
            'break_minutes' => (int) ($payload['break_minutes'] ?? $attendanceLog->break_minutes ?? 0),
            'remarks' => $payload['remarks'] ?? $attendanceLog->remarks,
            'status' => $this->resolveStatus($attendanceLog->time_in, $payload['time_out']),
            'total_hours' => $this->calculateHours($attendanceLog->time_in, $payload['time_out'], (int) ($payload['break_minutes'] ?? $attendanceLog->break_minutes ?? 0)),
            'approval_status' => 'pending',
        ]);
        $attendanceLog->save();

        return response()->json($attendanceLog->fresh()->load('userProgram'));
    }

    public function show(AttendanceLog $attendanceLog): JsonResponse
    {
        $this->authorize('view', $attendanceLog);
        return response()->json($attendanceLog->load('userProgram'));
    }

    public function update(AttendanceRequest $request, AttendanceLog $attendanceLog): JsonResponse
    {
        $this->authorize('update', $attendanceLog);
        if ($attendanceLog->approval_status === 'approved' && ! $request->boolean('allow_correction')) {
            return response()->json(['message' => 'Approved attendance cannot be edited without correction permission.'], 422);
        }

        $payload = $request->validated();
        $this->validateTimeOrder($payload['time_in'] ?? null, $payload['time_out'] ?? null);
        $payload['total_hours'] = $this->calculateHours($payload['time_in'] ?? null, $payload['time_out'] ?? null, (int) ($payload['break_minutes'] ?? 0));
        $payload['status'] = $this->resolveStatus($payload['time_in'] ?? null, $payload['time_out'] ?? null);
        $payload['approval_status'] = 'pending';
        $payload['approved_by'] = null;

        $attendanceLog->update($payload);

        return response()->json($attendanceLog->refresh());
    }

    public function destroy(AttendanceLog $attendanceLog): JsonResponse
    {
        $this->authorize('delete', $attendanceLog);
        $attendanceLog->delete();

        return response()->json(['message' => 'Attendance log deleted.']);
    }

    private function resolveStatus(mixed $timeIn, mixed $timeOut): string
    {
        if (! $timeIn) {
            return 'pending';
        }

        $clockIn = Carbon::parse($timeIn);
        $clockInThreshold = Carbon::parse($clockIn->toDateString().' 08:00:00');

        if ($timeOut === null) {
            return $clockIn->greaterThan($clockInThreshold) ? 'late' : 'present';
        }

        $workedHours = $this->calculateHours($timeIn, $timeOut, 0);

        return $workedHours < 8 ? 'undertime' : ($clockIn->greaterThan($clockInThreshold) ? 'late' : 'present');
    }

    private function calculateHours(mixed $timeIn, mixed $timeOut, int $breakMinutes): float
    {
        if (! $timeIn || ! $timeOut) {
            return 0.0;
        }

        $start = Carbon::parse($timeIn);
        $end = Carbon::parse($timeOut);
        $workedMinutes = max(0, $end->diffInMinutes($start) - $breakMinutes);

        return round($workedMinutes / 60, 2);
    }

    private function validateTimeOrder(mixed $timeIn, mixed $timeOut): void
    {
        if (! $timeIn || ! $timeOut) {
            return;
        }

        if (Carbon::parse($timeOut)->lessThanOrEqualTo(Carbon::parse($timeIn))) {
            throw ValidationException::withMessages([
                'time_out' => ['Time out must be later than time in.'],
            ]);
        }
    }
}
