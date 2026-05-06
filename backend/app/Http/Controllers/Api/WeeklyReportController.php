<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\WeeklyReportRequest;
use App\Models\DailyReport;
use App\Models\WeeklyReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WeeklyReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = WeeklyReport::with(['userProgram.user', 'userProgram.program']);

        if ($request->has('user_program_id')) {
            $query->where('user_program_id', $request->user_program_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('week_number')) {
            $query->where('week_number', $request->week_number);
        }

        return response()->json($query->latest('start_date')->paginate(15));
    }

    public function store(WeeklyReportRequest $request): JsonResponse
    {
        $report = WeeklyReport::create($request->validated());

        return response()->json($report->load('userProgram'), 201);
    }

    public function show(WeeklyReport $weeklyReport): JsonResponse
    {
        return response()->json($weeklyReport->load(['userProgram.user', 'userProgram.program', 'files']));
    }

    public function update(WeeklyReportRequest $request, WeeklyReport $weeklyReport): JsonResponse
    {
        // Only allow draft or needs_revision status to be updated
        if (! in_array($weeklyReport->status, ['draft', 'needs_revision'])) {
            return response()->json(['message' => 'Cannot edit report with status: ' . $weeklyReport->status], 422);
        }

        $weeklyReport->update($request->validated());

        return response()->json($weeklyReport->refresh());
    }

    public function generateDraft(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_program_id' => ['required', 'integer', 'exists:user_programs,id'],
            'week_number' => ['required', 'integer', 'min:1'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ]);

        // Check if weekly report already exists for this week
        $existing = WeeklyReport::where('user_program_id', $validated['user_program_id'])
            ->where('week_number', $validated['week_number'])
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'Weekly report already exists for this week'], 422);
        }

        // Fetch approved daily reports for the week
        $dailyReports = DailyReport::where('user_program_id', $validated['user_program_id'])
            ->where('status', 'approved')
            ->whereBetween('report_date', [$validated['start_date'], $validated['end_date']])
            ->latest('report_date')
            ->get();

        // Generate summary from daily reports
        $tasksSummary = $dailyReports->pluck('tasks_done')->join('\n\n');
        $skillsSummary = $dailyReports->pluck('learnings')->filter()->join('\n\n');
        $challengesSummary = $dailyReports->pluck('problems_encountered')->filter()->join('\n\n');

        $summary = "Generated from " . count($dailyReports) . " approved daily reports.\n\nDaily Summary:\n" . $tasksSummary;

        $report = WeeklyReport::create([
            'user_program_id' => $validated['user_program_id'],
            'week_number' => $validated['week_number'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'summary' => $summary,
            'skills_learned' => $skillsSummary,
            'challenges' => $challengesSummary,
            'reflection' => '',
            'status' => 'draft',
        ]);

        return response()->json($report->load('userProgram'), 201);
    }

    public function submit(WeeklyReport $weeklyReport): JsonResponse
    {
        if ($weeklyReport->status !== 'draft') {
            return response()->json(['message' => 'Only draft reports can be submitted'], 422);
        }

        $weeklyReport->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        return response()->json($weeklyReport);
    }

    public function approve(Request $request, WeeklyReport $weeklyReport): JsonResponse
    {
        $validated = $request->validate([
            'review_comment' => ['nullable', 'string'],
        ]);

        $weeklyReport->update([
            'status' => 'approved',
            'reviewed_by' => auth()->id(),
            'review_comment' => $validated['review_comment'] ?? null,
        ]);

        return response()->json($weeklyReport);
    }

    public function reject(Request $request, WeeklyReport $weeklyReport): JsonResponse
    {
        $validated = $request->validate([
            'review_comment' => ['required', 'string'],
        ]);

        $weeklyReport->update([
            'status' => 'rejected',
            'reviewed_by' => auth()->id(),
            'review_comment' => $validated['review_comment'],
        ]);

        return response()->json($weeklyReport);
    }

    public function requestRevision(Request $request, WeeklyReport $weeklyReport): JsonResponse
    {
        $validated = $request->validate([
            'review_comment' => ['required', 'string'],
        ]);

        $weeklyReport->update([
            'status' => 'needs_revision',
            'reviewed_by' => auth()->id(),
            'review_comment' => $validated['review_comment'],
        ]);

        return response()->json($weeklyReport);
    }

    public function destroy(WeeklyReport $weeklyReport): JsonResponse
    {
        // Only allow deletion of draft reports
        if ($weeklyReport->status !== 'draft') {
            return response()->json(['message' => 'Cannot delete non-draft report'], 422);
        }

        $weeklyReport->delete();

        return response()->json(['message' => 'Weekly report deleted.']);
    }
}
