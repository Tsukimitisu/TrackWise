<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AttendanceRequest;
use App\Models\AttendanceLog;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class AttendanceController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(AttendanceLog::query()->with('userProgram')->latest()->paginate(15));
    }

    public function store(AttendanceRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $payload['total_hours'] = $this->calculateHours($payload['time_in'] ?? null, $payload['time_out'] ?? null, (int) ($payload['break_minutes'] ?? 0));

        return response()->json(AttendanceLog::create($payload), 201);
    }

    public function show(AttendanceLog $attendanceLog): JsonResponse
    {
        return response()->json($attendanceLog->load('userProgram'));
    }

    public function update(AttendanceRequest $request, AttendanceLog $attendanceLog): JsonResponse
    {
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
