<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\DailyReportRequest;
use App\Models\DailyReport;
use App\Models\UserProgram;
use App\Services\AccessScope;
use App\Services\ApprovalService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DailyReportController extends Controller
{
    public function __construct(
        private ApprovalService $approvals,
        private NotificationService $notifications
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', DailyReport::class);
        $query = DailyReport::query()
            ->whereIn('user_program_id', AccessScope::assignmentIds($request->user()))
            ->with(['userProgram.user', 'userProgram.program']);

        if ($request->has('user_program_id')) {
            $query->where('user_program_id', $request->user_program_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($filtered) use ($search) {
                $filtered->whereHas('userProgram.user', function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('userProgram.program', fn ($q) => $q->where('name', 'like', "%{$search}%"))
                    ->orWhere('tasks_done', 'like', "%{$search}%");
            });
        }

        if ($request->has('report_date_from') && $request->has('report_date_to')) {
            $query->whereBetween('report_date', [$request->report_date_from, $request->report_date_to]);
        }

        return response()->json($query->latest('report_date')->paginate(15));
    }

    public function store(DailyReportRequest $request): JsonResponse
    {
        $this->authorize('create', DailyReport::class);
        $payload = $request->validated();
        $assignment = UserProgram::query()->findOrFail($payload['user_program_id']);
        abort_unless((int) $assignment->user_id === (int) $request->user()->id, 403);
        $payload['status'] = 'draft';
        $report = DailyReport::create($payload);

        return response()->json($report->load('userProgram'), 201);
    }

    public function show(DailyReport $dailyReport): JsonResponse
    {
        $this->authorize('view', $dailyReport);
        return response()->json($dailyReport->load(['userProgram.user', 'userProgram.program', 'files']));
    }

    public function update(DailyReportRequest $request, DailyReport $dailyReport): JsonResponse
    {
        $this->authorize('update', $dailyReport);
        // Only allow draft or needs_revision status to be updated
        if (! in_array($dailyReport->status, ['draft', 'needs_revision'])) {
            return response()->json(['message' => 'Cannot edit report with status: ' . $dailyReport->status], 422);
        }

        $payload = $request->validated();
        $payload['user_program_id'] = $dailyReport->user_program_id;
        $dailyReport->update($payload);

        return response()->json($dailyReport->refresh());
    }

    public function submit(Request $request, DailyReport $dailyReport): JsonResponse
    {
        $this->authorize('submit', $dailyReport);
        if (! in_array($dailyReport->status, ['draft', 'needs_revision'])) {
            return response()->json(['message' => 'Only draft or revised reports can be submitted'], 422);
        }

        $dailyReport->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $this->notifications->notifyReviewersOfSubmission(
            $dailyReport->userProgram->loadMissing(['user', 'supervisor', 'coordinator']),
            'Daily',
            $dailyReport->id
        );

        return response()->json($dailyReport);
    }

    public function approve(Request $request, DailyReport $dailyReport): JsonResponse
    {
        $validated = $request->validate([
            'review_comment' => ['nullable', 'string'],
        ]);

        $this->authorize('review', $dailyReport);
        return response()->json($this->approvals->review($request->user(), $dailyReport, 'approved', $validated['review_comment'] ?? null));
    }

    public function reject(Request $request, DailyReport $dailyReport): JsonResponse
    {
        $validated = $request->validate([
            'review_comment' => ['required', 'string'],
        ]);

        $this->authorize('review', $dailyReport);
        return response()->json($this->approvals->review($request->user(), $dailyReport, 'rejected', $validated['review_comment']));
    }

    public function requestRevision(Request $request, DailyReport $dailyReport): JsonResponse
    {
        $validated = $request->validate([
            'review_comment' => ['required', 'string'],
        ]);

        $this->authorize('review', $dailyReport);
        return response()->json($this->approvals->review($request->user(), $dailyReport, 'needs_revision', $validated['review_comment']));
    }

    public function destroy(DailyReport $dailyReport): JsonResponse
    {
        $this->authorize('delete', $dailyReport);
        // Only allow deletion of draft reports
        if ($dailyReport->status !== 'draft') {
            return response()->json(['message' => 'Cannot delete non-draft report'], 422);
        }

        $dailyReport->delete();

        return response()->json(['message' => 'Daily report deleted.']);
    }
}
