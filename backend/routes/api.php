<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\ApprovalController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AdminStatisticsController;
use App\Http\Controllers\Api\ExportController;
use App\Http\Controllers\Api\DailyReportController;
use App\Http\Controllers\Api\DocumentationFileController;
use App\Http\Controllers\Api\EvaluationController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\WeeklyReportController;
use App\Http\Controllers\Api\SystemSettingsController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/health', function () {
    try {
        DB::select('select 1');
        return response()->json(['status' => 'ok', 'database' => 'ready']);
    } catch (\Throwable $exception) {
        report($exception);
        return response()->json(['status' => 'unavailable', 'database' => 'unavailable'], 503);
    }
});

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::get('/auth/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->name('verification.verify');
Route::post('/auth/resend-verification', [AuthController::class, 'resendVerification']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

    Route::middleware('role:admin,coordinator')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{user}', [UserController::class, 'show']);
    });
    Route::middleware('role:admin')->group(function () {
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
    });

    // Organizations - admin only for create/update/delete
    Route::get('/organizations', [OrganizationController::class, 'index']);
    Route::get('/organizations/{organization}', [OrganizationController::class, 'show']);
    Route::middleware('role:admin,coordinator')->group(function () {
        Route::post('/organizations', [OrganizationController::class, 'store']);
        Route::put('/organizations/{organization}', [OrganizationController::class, 'update']);
        Route::delete('/organizations/{organization}', [OrganizationController::class, 'destroy']);
        Route::patch('/organizations/{organization}/toggle-status', [OrganizationController::class, 'toggleStatus']);
    });

    // Programs - admin only for create/update/delete
    Route::get('/programs', [ProgramController::class, 'index']);
    Route::get('/programs/{program}', [ProgramController::class, 'show']);
    Route::middleware('role:admin,coordinator')->group(function () {
        Route::post('/programs', [ProgramController::class, 'store']);
        Route::put('/programs/{program}', [ProgramController::class, 'update']);
        Route::delete('/programs/{program}', [ProgramController::class, 'destroy']);
    });

    // Assignments - coordinators/admins can manage
    Route::get('/assignments', [AssignmentController::class, 'index']);
    Route::get('/assignments/{assignment}', [AssignmentController::class, 'show']);
    Route::middleware('role:admin,coordinator')->group(function () {
        Route::post('/assignments', [AssignmentController::class, 'store']);
        Route::put('/assignments/{assignment}', [AssignmentController::class, 'update']);
        Route::delete('/assignments/{assignment}', [AssignmentController::class, 'destroy']);
    });

    // Attendance
    Route::post('/attendance-logs/clock-in', [AttendanceController::class, 'clockIn']);
    Route::post('/attendance-logs/clock-out', [AttendanceController::class, 'clockOut']);
    Route::apiResource('attendance-logs', AttendanceController::class);
    
    // Daily Reports - approval by supervisors/coordinators/admins
    Route::get('/daily-reports', [DailyReportController::class, 'index']);
    Route::post('/daily-reports', [DailyReportController::class, 'store']);
    Route::get('/daily-reports/{dailyReport}', [DailyReportController::class, 'show']);
    Route::put('/daily-reports/{dailyReport}', [DailyReportController::class, 'update']);
    Route::delete('/daily-reports/{dailyReport}', [DailyReportController::class, 'destroy']);
    
    Route::post('/daily-reports/{dailyReport}/submit', [DailyReportController::class, 'submit']);
    Route::middleware('role:supervisor,coordinator,admin')->group(function () {
        Route::post('/daily-reports/{dailyReport}/approve', [DailyReportController::class, 'approve']);
        Route::post('/daily-reports/{dailyReport}/reject', [DailyReportController::class, 'reject']);
        Route::post('/daily-reports/{dailyReport}/request-revision', [DailyReportController::class, 'requestRevision']);
    });
    
    // Weekly Reports - approval by supervisors/coordinators/admins
    Route::get('/weekly-reports', [WeeklyReportController::class, 'index']);
    Route::post('/weekly-reports', [WeeklyReportController::class, 'store']);
    Route::get('/weekly-reports/{weeklyReport}', [WeeklyReportController::class, 'show']);
    Route::put('/weekly-reports/{weeklyReport}', [WeeklyReportController::class, 'update']);
    Route::delete('/weekly-reports/{weeklyReport}', [WeeklyReportController::class, 'destroy']);
    
    Route::post('/weekly-reports/generate-draft', [WeeklyReportController::class, 'generateDraft']);
    Route::post('/weekly-reports/{weeklyReport}/submit', [WeeklyReportController::class, 'submit']);
    Route::middleware('role:supervisor,coordinator,admin')->group(function () {
        Route::post('/weekly-reports/{weeklyReport}/approve', [WeeklyReportController::class, 'approve']);
        Route::post('/weekly-reports/{weeklyReport}/reject', [WeeklyReportController::class, 'reject']);
        Route::post('/weekly-reports/{weeklyReport}/request-revision', [WeeklyReportController::class, 'requestRevision']);
    });
    
    // Documentation Files
    Route::apiResource('documentation-files', DocumentationFileController::class);
    Route::get('/documentation-files/{documentationFile}/download', [DocumentationFileController::class, 'download'])
        ->name('documentation-files.download');
    
    // Evaluations
    Route::apiResource('evaluations', EvaluationController::class);
    Route::get('/evaluations/{evaluation}/average-score', [EvaluationController::class, 'getAverageScore']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Approvals
    Route::middleware('role:supervisor,coordinator,admin')->group(function () {
        Route::post('/approvals/{type}/{id}', [ApprovalController::class, 'review']);
    });
    Route::get('/approvals/{type}/{id}/history', [ApprovalController::class, 'history']);
    
    // Settings - admin/coordinator only
    Route::middleware('role:admin')->group(function () {
        Route::get('/settings', [SystemSettingsController::class, 'index']);
        Route::put('/settings', [SystemSettingsController::class, 'update']);
    });

    // Analytics
    Route::middleware('role:admin,coordinator')->group(function () {
        Route::get('/analytics/dashboard', [AnalyticsController::class, 'dashboard']);
        Route::get('/analytics/reports', [AnalyticsController::class, 'reportStats']);
        Route::get('/analytics/assignments', [AnalyticsController::class, 'assignmentStats']);
    });

    // Admin statistics
    Route::middleware('role:admin,coordinator')->group(function () {
        Route::get('/admin/statistics/overview', [AdminStatisticsController::class, 'systemOverview']);
        Route::get('/admin/statistics/users', [AdminStatisticsController::class, 'userActivityStats']);
        Route::get('/admin/statistics/reports', [AdminStatisticsController::class, 'reportingStats']);
        Route::get('/admin/statistics/organizations', [AdminStatisticsController::class, 'organizationStats']);
        Route::get('/admin/statistics/programs', [AdminStatisticsController::class, 'programStats']);
        Route::get('/admin/statistics/health', [AdminStatisticsController::class, 'systemHealth']);
    });

    // Exports
    Route::get('/export/daily-reports', [ExportController::class, 'exportDailyReports']);
    Route::get('/export/weekly-reports', [ExportController::class, 'exportWeeklyReports']);
    Route::get('/export/assignments', [ExportController::class, 'exportAssignments']);
    Route::post('/export/student-data', [ExportController::class, 'exportStudentData']);
});
