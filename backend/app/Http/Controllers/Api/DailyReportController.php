<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DailyReportRequest;
use App\Models\DailyReport;
use App\Models\User;
use App\Models\UserProgram;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DailyReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DailyReport::with(['userProgram.user', 'userProgram.program']);

        if ($request->has('user_program_id')) {
            $query->where('user_program_id', $request->user_program_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('userProgram.user', function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })
            ->orWhereHas('userProgram.program', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })
            ->orWhere('tasks', 'like', "%{$search}%");
        }

        if ($request->has('report_date_from') && $request->has('report_date_to')) {
            $query->whereBetween('report_date', [$request->report_date_from, $request->report_date_to]);
        }

        return response()->json($query->latest('report_date')->paginate(15));
    }

    public function store(DailyReportRequest $request): JsonResponse
    {
        $report = DailyReport::create($request->validated());

        return response()->json($report->load('userProgram'), 201);
    }

    public function show(DailyReport $dailyReport): JsonResponse
    {
        return response()->json($dailyReport->load(['userProgram.user', 'userProgram.program', 'files']));
    }

    public function update(DailyReportRequest $request, DailyReport $dailyReport): JsonResponse
    {
        // Only allow draft or needs_revision status to be updated
        if (! in_array($dailyReport->status, ['draft', 'needs_revision'])) {
            return response()->json(['message' => 'Cannot edit report with status: ' . $dailyReport->status], 422);
        }

        $dailyReport->update($request->validated());

        return response()->json($dailyReport->refresh());
    }

    public function submit(DailyReport $dailyReport): JsonResponse
    {
        if ($dailyReport->status !== 'draft') {
            return response()->json(['message' => 'Only draft reports can be submitted'], 422);
        }

        $dailyReport->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        return response()->json($dailyReport);
    }

    public function approve(Request $request, DailyReport $dailyReport): JsonResponse
    {
        $validated = $request->validate([
            'review_comment' => ['nullable', 'string'],
        ]);

        $dailyReport->update([
            'status' => 'approved',
            'reviewed_by' => auth()->id(),
            'review_comment' => $validated['review_comment'] ?? null,
        ]);

        return response()->json($dailyReport);
    }

    public function reject(Request $request, DailyReport $dailyReport): JsonResponse
    {
        $validated = $request->validate([
            'review_comment' => ['required', 'string'],
        ]);

        $dailyReport->update([
            'status' => 'rejected',
            'reviewed_by' => auth()->id(),
            'review_comment' => $validated['review_comment'],
        ]);

        return response()->json($dailyReport);
    }

    public function requestRevision(Request $request, DailyReport $dailyReport): JsonResponse
    {
        $validated = $request->validate([
            'review_comment' => ['required', 'string'],
        ]);

        $dailyReport->update([
            'status' => 'needs_revision',
            'reviewed_by' => auth()->id(),
            'review_comment' => $validated['review_comment'],
        ]);

        return response()->json($dailyReport);
    }

    public function destroy(DailyReport $dailyReport): JsonResponse
    {
        // Only allow deletion of draft reports
        if ($dailyReport->status !== 'draft') {
            return response()->json(['message' => 'Cannot delete non-draft report'], 422);
        }

        $dailyReport->delete();

        return response()->json(['message' => 'Daily report deleted.']);
    }
}
