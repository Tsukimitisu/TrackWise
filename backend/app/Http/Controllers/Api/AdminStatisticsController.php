<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Organization;
use App\Models\Program;
use App\Models\UserProgram;
use App\Models\DailyReport;
use App\Models\WeeklyReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminStatisticsController extends Controller
{
    public function systemOverview(): JsonResponse
    {
        $totalUsers = User::count();
        $totalOrganizations = Organization::count();
        $totalPrograms = Program::count();
        $totalAssignments = UserProgram::count();

        $usersByRole = User::selectRaw('role, COUNT(*) as count')
            ->groupBy('role')
            ->pluck('count', 'role');

        $activePrograms = Program::where('status', 'active')->count();
        $completedPrograms = Program::where('status', 'completed')->count();

        $activeAssignments = UserProgram::where('status', 'active')->count();
        $completedAssignments = UserProgram::where('status', 'completed')->count();

        return response()->json([
            'users' => [
                'total' => $totalUsers,
                'by_role' => $usersByRole,
            ],
            'organizations' => [
                'total' => $totalOrganizations,
            ],
            'programs' => [
                'total' => $totalPrograms,
                'active' => $activePrograms,
                'completed' => $completedPrograms,
            ],
            'assignments' => [
                'total' => $totalAssignments,
                'active' => $activeAssignments,
                'completed' => $completedAssignments,
            ],
        ]);
    }

    public function userActivityStats(): JsonResponse
    {
        $usersWithAssignments = UserProgram::distinct('user_id')->count('user_id');
        $usersWithReports = DailyReport::join('user_programs', 'daily_reports.user_program_id', '=', 'user_programs.id')
            ->distinct()
            ->count('user_programs.user_id');

        $recentUsers = User::latest('created_at')->take(10)->get(['id', 'name', 'email', 'role', 'created_at']);

        $usersLastActive = User::leftJoin('user_programs', 'users.id', '=', 'user_programs.user_id')
            ->selectRaw('users.id, users.name, MAX(user_programs.updated_at) as last_active')
            ->groupBy('users.id', 'users.name')
            ->orderBy('last_active', 'desc')
            ->take(10)
            ->get();

        return response()->json([
            'total_active_users' => $usersWithAssignments,
            'users_with_reports' => $usersWithReports,
            'recent_users' => $recentUsers,
            'last_active_users' => $usersLastActive,
        ]);
    }

    public function reportingStats(Request $request): JsonResponse
    {
        $days = max(1, (int) $request->integer('days', 7));
        $rangeStart = now()->subDays($days - 1)->startOfDay();

        $totalReports = DailyReport::where('created_at', '>=', $rangeStart)->count() + WeeklyReport::where('created_at', '>=', $rangeStart)->count();
        $submittedReports = DailyReport::where('created_at', '>=', $rangeStart)->where('status', 'submitted')->count() + 
                           WeeklyReport::where('created_at', '>=', $rangeStart)->where('status', 'submitted')->count();
        $approvedReports = DailyReport::where('created_at', '>=', $rangeStart)->where('status', 'approved')->count() + 
                          WeeklyReport::where('created_at', '>=', $rangeStart)->where('status', 'approved')->count();
        $rejectedReports = DailyReport::where('created_at', '>=', $rangeStart)->where('status', 'rejected')->count() + 
                          WeeklyReport::where('created_at', '>=', $rangeStart)->where('status', 'rejected')->count();
        $needsRevisionReports = DailyReport::where('created_at', '>=', $rangeStart)->where('status', 'needs_revision')->count() + 
                               WeeklyReport::where('created_at', '>=', $rangeStart)->where('status', 'needs_revision')->count();

        $avgReportTime = DailyReport::where('created_at', '>=', $rangeStart)->whereNotNull('submitted_at')
            ->selectRaw('AVG(DATEDIFF(submitted_at, created_at)) as avg_days')
            ->first()
            ?->avg_days ?? 0;

        $dailyReportsLastPeriod = DailyReport::where('created_at', '>=', $rangeStart)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $reportsByProgram = DailyReport::where('daily_reports.created_at', '>=', $rangeStart)
            ->join('user_programs', 'daily_reports.user_program_id', '=', 'user_programs.id')
            ->join('programs', 'user_programs.program_id', '=', 'programs.id')
            ->selectRaw('programs.name, COUNT(daily_reports.id) as report_count')
            ->groupBy('programs.id', 'programs.name')
            ->orderBy('report_count', 'desc')
            ->take(10)
            ->get();

        return response()->json([
            'total' => $totalReports,
            'submitted' => $submittedReports,
            'approved' => $approvedReports,
            'rejected' => $rejectedReports,
            'needs_revision' => $needsRevisionReports,
            'avg_submission_time_days' => round($avgReportTime, 2),
            'range_days' => $days,
            'range_label' => "Last {$days} Days",
            'reports_last_period' => $dailyReportsLastPeriod,
            'reports_by_program' => $reportsByProgram,
        ]);
    }

    public function organizationStats(): JsonResponse
    {
        $organizations = Organization::query()
            ->leftJoin('programs', 'organizations.id', '=', 'programs.organization_id')
            ->leftJoin('user_programs', 'programs.id', '=', 'user_programs.program_id')
            ->selectRaw('organizations.id, organizations.name, organizations.type, organizations.status, organizations.created_at, COUNT(DISTINCT programs.id) as programs_count, COUNT(user_programs.id) as assignments_count')
            ->groupBy('organizations.id', 'organizations.name', 'organizations.type', 'organizations.status', 'organizations.created_at')
            ->orderByDesc('programs_count')
            ->get();

        $orgStats = Organization::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return response()->json([
            'organizations' => $organizations,
            'by_status' => $orgStats,
        ]);
    }

    public function programStats(): JsonResponse
    {
        $programs = Program::withCount('assignments')
            ->selectRaw('programs.id, programs.name, programs.required_hours, programs.status, COUNT(user_programs.id) as assignments, AVG(user_programs.required_hours) as avg_hours')
            ->leftJoin('user_programs', 'programs.id', '=', 'user_programs.program_id')
            ->groupBy('programs.id', 'programs.name', 'programs.required_hours', 'programs.status')
            ->orderByDesc('assignments')
            ->take(20)
            ->get();

        $programsByStatus = Program::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $programsByFrequency = Program::selectRaw('report_frequency, COUNT(*) as count')
            ->whereNotNull('report_frequency')
            ->groupBy('report_frequency')
            ->pluck('count', 'report_frequency');

        return response()->json([
            'programs' => $programs,
            'by_status' => $programsByStatus,
            'by_report_frequency' => $programsByFrequency,
        ]);
    }

    public function systemHealth(): JsonResponse
    {
        $now = now();
        $last7Days = $now->copy()->subDays(7);
        $last30Days = $now->copy()->subDays(30);

        $reportsLast7Days = DailyReport::where('created_at', '>=', $last7Days)->count();
        $reportsLast30Days = DailyReport::where('created_at', '>=', $last30Days)->count();
        $pendingReviews = DailyReport::where('status', 'submitted')->count() + 
                         WeeklyReport::where('status', 'submitted')->count();

        $overallHealth = min(100, round((DailyReport::where('status', 'approved')->count() / max(DailyReport::count(), 1)) * 100));

        $dataIntegrity = [
            'users_with_assignments' => UserProgram::distinct('user_id')->count('user_id'),
            'assignments_with_reports' => DailyReport::distinct('user_program_id')->count('user_program_id'),
            'orphaned_reports' => DailyReport::whereNotExists(
                function ($query) {
                    $query->select(1)->from('user_programs')
                        ->whereColumn('user_programs.id', 'daily_reports.user_program_id');
                }
            )->count(),
        ];

        return response()->json([
            'activity' => [
                'reports_last_7_days' => $reportsLast7Days,
                'reports_last_30_days' => $reportsLast30Days,
                'pending_reviews' => $pendingReviews,
            ],
            'health_score' => $overallHealth,
            'data_integrity' => $dataIntegrity,
        ]);
    }
}
