<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClockInRequest;
use App\Http\Requests\ClockOutRequest;
use App\Http\Requests\AttendanceRequest;
use App\Models\AttendanceLog;
use App\Models\UserProgram;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class AttendanceController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(AttendanceLog::query()->with(['userProgram.user', 'userProgram.program', 'approver'])->latest()->paginate(15));
    }

    public function store(AttendanceRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $payload['total_hours'] = $this->calculateHours($payload['time_in'] ?? null, $payload['time_out'] ?? null, (int) ($payload['break_minutes'] ?? 0));

        return response()->json(AttendanceLog::create($payload), 201);
    }

    public function clockIn(ClockInRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $attendanceLog = AttendanceLog::query()->firstOrNew([
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
        $attendanceLog = AttendanceLog::query()->where([
            'user_program_id' => $payload['user_program_id'],
            'date' => $payload['date'],
        ])->first();

        if (! $attendanceLog || ! $attendanceLog->time_in) {
            return response()->json(['message' => 'Cannot time out without an existing time in.'], 422);
        }

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
        return response()->json($attendanceLog->load('userProgram'));
    }

    public function update(AttendanceRequest $request, AttendanceLog $attendanceLog): JsonResponse
    {
        if ($attendanceLog->approval_status === 'approved' && ! $request->boolean('allow_correction')) {
            return response()->json(['message' => 'Approved attendance cannot be edited without correction permission.'], 422);
        }

        $payload = $request->validated();
        $payload['total_hours'] = $this->calculateHours($payload['time_in'] ?? null, $payload['time_out'] ?? null, (int) ($payload['break_minutes'] ?? 0));

        $attendanceLog->update($payload);

        return response()->json($attendanceLog->refresh());
    }

    public function destroy(AttendanceLog $attendanceLog): JsonResponse
    {
        $attendanceLog->delete();

        return response()->json(['message' => 'Attendance log deleted.']);
    }

    private function resolveStatus(?string $timeIn, ?string $timeOut): string
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

    private function calculateHours(?string $timeIn, ?string $timeOut, int $breakMinutes): float
    {
        if (! $timeIn || ! $timeOut) {
            return 0.0;
        }

        $start = Carbon::parse($timeIn);
        $end = Carbon::parse($timeOut);
        $workedMinutes = max(0, $start->diffInMinutes($end) - $breakMinutes);

        return round($workedMinutes / 60, 2);
    }
}
