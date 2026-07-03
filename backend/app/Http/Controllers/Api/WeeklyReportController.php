<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\WeeklyReportRequest;
use App\Models\DailyReport;
use App\Models\WeeklyReport;
use App\Models\UserProgram;
use App\Services\AccessScope;
use App\Services\ApprovalService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WeeklyReportController extends Controller
{
    public function __construct(
        private ApprovalService $approvals,
        private NotificationService $notifications
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', WeeklyReport::class);
        $query = WeeklyReport::query()
            ->whereIn('user_program_id', AccessScope::assignmentIds($request->user()))
            ->with(['userProgram.user', 'userProgram.program']);

        if ($request->has('user_program_id')) {
            $query->where('user_program_id', $request->user_program_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('week_number')) {
            $query->where('week_number', $request->week_number);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($filtered) use ($search) {
                $filtered->whereHas('userProgram.user', function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('userProgram.program', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhere('summary', 'like', "%{$search}%");
            });
        }

        return response()->json($query->latest('start_date')->paginate(15));
    }

    public function store(WeeklyReportRequest $request): JsonResponse
    {
        $this->authorize('create', WeeklyReport::class);
        $payload = $request->validated();
        $assignment = UserProgram::query()->findOrFail($payload['user_program_id']);
        abort_unless((int) $assignment->user_id === (int) $request->user()->id, 403);
        $payload['status'] = 'draft';
        $report = WeeklyReport::create($payload);

        return response()->json($report->load('userProgram'), 201);
    }

    public function show(WeeklyReport $weeklyReport): JsonResponse
    {
        $this->authorize('view', $weeklyReport);
        return response()->json($weeklyReport->load(['userProgram.user', 'userProgram.program', 'files']));
    }

    public function update(WeeklyReportRequest $request, WeeklyReport $weeklyReport): JsonResponse
    {
        $this->authorize('update', $weeklyReport);
        // Only allow draft or needs_revision status to be updated
        if (! in_array($weeklyReport->status, ['draft', 'needs_revision'])) {
            return response()->json(['message' => 'Cannot edit report with status: ' . $weeklyReport->status], 422);
        }

        $payload = $request->validated();
        $payload['user_program_id'] = $weeklyReport->user_program_id;
        $weeklyReport->update($payload);

        return response()->json($weeklyReport->refresh());
    }

    public function generateDraft(Request $request): JsonResponse
    {
        $this->authorize('create', WeeklyReport::class);
        $validated = $request->validate([
            'user_program_id' => ['required', 'integer', 'exists:user_programs,id'],
            'week_number' => ['required', 'integer', 'min:1'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ]);
        $assignment = UserProgram::query()->findOrFail($validated['user_program_id']);
        abort_unless((int) $assignment->user_id === (int) $request->user()->id, 403);

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

    public function submit(Request $request, WeeklyReport $weeklyReport): JsonResponse
    {
        $this->authorize('submit', $weeklyReport);
        if (! in_array($weeklyReport->status, ['draft', 'needs_revision'], true)) {
            return response()->json(['message' => 'Only draft reports can be submitted'], 422);
        }

        $weeklyReport->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $this->notifications->notifyReviewersOfSubmission(
            $weeklyReport->userProgram->loadMissing(['user', 'supervisor', 'coordinator']),
            'Weekly',
            $weeklyReport->id
        );

        return response()->json($weeklyReport);
    }

    public function approve(Request $request, WeeklyReport $weeklyReport): JsonResponse
    {
        $validated = $request->validate([
            'review_comment' => ['nullable', 'string'],
        ]);

        $this->authorize('review', $weeklyReport);
        return response()->json($this->approvals->review($request->user(), $weeklyReport, 'approved', $validated['review_comment'] ?? null));
    }

    public function reject(Request $request, WeeklyReport $weeklyReport): JsonResponse
    {
        $validated = $request->validate([
            'review_comment' => ['required', 'string'],
        ]);

        $this->authorize('review', $weeklyReport);
        return response()->json($this->approvals->review($request->user(), $weeklyReport, 'rejected', $validated['review_comment']));
    }

    public function requestRevision(Request $request, WeeklyReport $weeklyReport): JsonResponse
    {
        $validated = $request->validate([
            'review_comment' => ['required', 'string'],
        ]);

        $this->authorize('review', $weeklyReport);
        return response()->json($this->approvals->review($request->user(), $weeklyReport, 'needs_revision', $validated['review_comment']));
    }

    public function destroy(WeeklyReport $weeklyReport): JsonResponse
    {
        $this->authorize('delete', $weeklyReport);
        // Only allow deletion of draft reports
        if ($weeklyReport->status !== 'draft') {
            return response()->json(['message' => 'Cannot delete non-draft report'], 422);
        }

        $weeklyReport->delete();

        return response()->json(['message' => 'Weekly report deleted.']);
    }
}
