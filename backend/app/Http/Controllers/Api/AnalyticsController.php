<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\DailyReport;
use App\Models\WeeklyReport;
use App\Models\UserProgram;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $totalAssignments = UserProgram::count();
        $activeAssignments = UserProgram::where('status', 'active')->count();
        $completedAssignments = UserProgram::where('status', 'completed')->count();

        $totalReports = DailyReport::count();
        $approvedReports = DailyReport::where('status', 'approved')->count();
        $submittedReports = DailyReport::where('status', 'submitted')->count();
        $needsRevisionReports = DailyReport::where('status', 'needs_revision')->count();

        $totalHours = UserProgram::sum('required_hours') ?? 0;
        $approvedAttendanceHours = AttendanceLog::where('approval_status', 'approved')->sum('total_hours') ?? 0;
        $assignmentCompletedHours = UserProgram::sum('completed_hours') ?? 0;
        $completedHours = max((float) $approvedAttendanceHours, (float) $assignmentCompletedHours);

        $averageReportsPerStudent = $totalAssignments > 0 
            ? round($totalReports / $totalAssignments, 2) 
            : 0;

        $approvalRate = $totalReports > 0 
            ? round(($approvedReports / $totalReports) * 100, 2) 
            : 0;

        $completionRate = $totalAssignments > 0 
            ? round(($completedAssignments / $totalAssignments) * 100, 2) 
            : 0;

        return response()->json([
            'assignments' => [
                'total' => $totalAssignments,
                'active' => $activeAssignments,
                'completed' => $completedAssignments,
            ],
            'reports' => [
                'total' => $totalReports,
                'approved' => $approvedReports,
                'submitted' => $submittedReports,
                'needs_revision' => $needsRevisionReports,
            ],
            'hours' => [
                'required' => $totalHours,
                'completed' => $completedHours,
                'remaining' => $totalHours - $completedHours,
            ],
            'metrics' => [
                'average_reports_per_student' => $averageReportsPerStudent,
                'approval_rate' => $approvalRate,
                'completion_rate' => $completionRate,
            ],
        ]);
    }

    public function reportStats(): JsonResponse
    {
        $dailyReportsByStatus = DailyReport::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $weeklyReportsByStatus = WeeklyReport::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $reportsLastSevenDays = DailyReport::where('created_at', '>=', now()->subDays(7))
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'daily_by_status' => $dailyReportsByStatus,
            'weekly_by_status' => $weeklyReportsByStatus,
            'last_seven_days' => $reportsLastSevenDays,
        ]);
    }

    public function assignmentStats(): JsonResponse
    {
        $hoursByProgram = UserProgram::with('program')
            ->selectRaw('program_id, COUNT(*) as count, SUM(required_hours) as total_hours')
            ->groupBy('program_id')
            ->get()
            ->map(function ($item) {
                return [
                    'program' => $item->program?->name,
                    'count' => $item->count,
                    'total_hours' => $item->total_hours,
                ];
            });

        $activeByRole = UserProgram::with('user')
            ->where('status', 'active')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('user_id')
            ->get();

        return response()->json([
            'by_program' => $hoursByProgram,
            'total_active_assignments' => $activeByRole->count(),
        ]);
    }
}
