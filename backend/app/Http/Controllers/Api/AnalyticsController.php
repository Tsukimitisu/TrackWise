<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\DailyReport;
use App\Models\UserProgram;
use App\Models\WeeklyReport;
use App\Services\AccessScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $assignments = AccessScope::assignments(UserProgram::query(), $request->user());
        $assignmentIds = AccessScope::assignmentIds($request->user());
        $reports = DailyReport::query()->whereIn('user_program_id', clone $assignmentIds);

        $totalAssignments = (clone $assignments)->count();
        $totalReports = (clone $reports)->count();
        $approvedReports = (clone $reports)->where('status', 'approved')->count();
        $requiredHours = (float) (clone $assignments)->sum('required_hours');
        $completedHours = (float) AttendanceLog::query()
            ->whereIn('user_program_id', clone $assignmentIds)
            ->where('approval_status', 'approved')
            ->sum('total_hours');

        return response()->json([
            'assignments' => [
                'total' => $totalAssignments,
                'active' => (clone $assignments)->where('status', 'active')->count(),
                'completed' => (clone $assignments)->where('status', 'completed')->count(),
            ],
            'reports' => [
                'total' => $totalReports,
                'approved' => $approvedReports,
                'submitted' => (clone $reports)->where('status', 'submitted')->count(),
                'needs_revision' => (clone $reports)->where('status', 'needs_revision')->count(),
            ],
            'hours' => [
                'required' => $requiredHours,
                'completed' => $completedHours,
                'remaining' => max(0, $requiredHours - $completedHours),
            ],
            'metrics' => [
                'average_reports_per_student' => $totalAssignments ? round($totalReports / $totalAssignments, 2) : 0,
                'approval_rate' => $totalReports ? round($approvedReports / $totalReports * 100, 2) : 0,
                'completion_rate' => $totalAssignments
                    ? round((clone $assignments)->where('status', 'completed')->count() / $totalAssignments * 100, 2)
                    : 0,
            ],
        ]);
    }

    public function reportStats(Request $request): JsonResponse
    {
        $ids = AccessScope::assignmentIds($request->user());
        $daily = DailyReport::query()->whereIn('user_program_id', clone $ids);
        $weekly = WeeklyReport::query()->whereIn('user_program_id', clone $ids);

        return response()->json([
            'daily_by_status' => (clone $daily)->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')->pluck('count', 'status'),
            'weekly_by_status' => (clone $weekly)->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')->pluck('count', 'status'),
            'last_seven_days' => (clone $daily)->where('created_at', '>=', now()->subDays(7))
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')->orderBy('date')->get(),
        ]);
    }

    public function assignmentStats(Request $request): JsonResponse
    {
        $assignments = AccessScope::assignments(UserProgram::query(), $request->user());
        $hoursByProgram = (clone $assignments)->with('program')
            ->selectRaw('program_id, COUNT(*) as count, SUM(required_hours) as total_hours')
            ->groupBy('program_id')
            ->get()
            ->map(fn ($item) => [
                'program' => $item->program?->name,
                'count' => $item->count,
                'total_hours' => $item->total_hours,
            ]);

        return response()->json([
            'by_program' => $hoursByProgram,
            'total_active_assignments' => (clone $assignments)->where('status', 'active')->count(),
        ]);
    }
}
