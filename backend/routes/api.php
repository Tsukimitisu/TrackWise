<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\ApprovalController;
use App\Http\Controllers\Api\DailyReportController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\DocumentationFileController;
use App\Http\Controllers\Api\EvaluationController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OrganizationController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\WeeklyReportController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::apiResource('organizations', OrganizationController::class);
    Route::patch('/organizations/{organization}/toggle-status', [OrganizationController::class, 'toggleStatus']);

    Route::apiResource('programs', ProgramController::class);
    Route::apiResource('assignments', AssignmentController::class)->only(['index', 'store', 'show', 'update', 'destroy']);
    Route::post('/attendance-logs/clock-in', [AttendanceController::class, 'clockIn']);
    Route::post('/attendance-logs/clock-out', [AttendanceController::class, 'clockOut']);
    Route::apiResource('attendance-logs', AttendanceController::class);
    
    // Daily Reports with approval workflow
    Route::apiResource('daily-reports', DailyReportController::class);
    Route::post('/daily-reports/{dailyReport}/submit', [DailyReportController::class, 'submit']);
    Route::post('/daily-reports/{dailyReport}/approve', [DailyReportController::class, 'approve']);
    Route::post('/daily-reports/{dailyReport}/reject', [DailyReportController::class, 'reject']);
    Route::post('/daily-reports/{dailyReport}/request-revision', [DailyReportController::class, 'requestRevision']);
    
    // Weekly Reports with approval workflow and auto-generation
    Route::apiResource('weekly-reports', WeeklyReportController::class);
    Route::post('/weekly-reports/generate-draft', [WeeklyReportController::class, 'generateDraft']);
    Route::post('/weekly-reports/{weeklyReport}/submit', [WeeklyReportController::class, 'submit']);
    Route::post('/weekly-reports/{weeklyReport}/approve', [WeeklyReportController::class, 'approve']);
    Route::post('/weekly-reports/{weeklyReport}/reject', [WeeklyReportController::class, 'reject']);
    Route::post('/weekly-reports/{weeklyReport}/request-revision', [WeeklyReportController::class, 'requestRevision']);
    
    // Documentation Files (photos, camera, documents)
    Route::apiResource('documentation-files', DocumentationFileController::class);
    
    Route::apiResource('documents', DocumentController::class);
    Route::apiResource('evaluations', EvaluationController::class);
    Route::get('/evaluations/{evaluation}/average-score', [EvaluationController::class, 'getAverageScore']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);

    Route::post('/approvals/{type}/{id}', [ApprovalController::class, 'review']);
});
