<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\ApprovalController;
use App\Http\Controllers\Api\DailyReportController;
use App\Http\Controllers\Api\DocumentController;
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
    Route::apiResource('attendance-logs', AttendanceController::class);
    Route::apiResource('daily-reports', DailyReportController::class);
    Route::apiResource('weekly-reports', WeeklyReportController::class);
    Route::apiResource('documents', DocumentController::class);
    Route::apiResource('evaluations', EvaluationController::class);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);

    Route::post('/approvals/{type}/{id}', [ApprovalController::class, 'review']);
});
