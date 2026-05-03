<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApprovalLog;
use App\Models\AttendanceLog;
use App\Models\DailyReport;
use App\Models\Document;
use App\Models\Evaluation;
use App\Models\UserProgram;
use App\Models\WeeklyReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class ApprovalController extends Controller
{
    public function review(Request $request, string $type, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:approved,rejected,needs_revision,pending'],
            'comment' => ['nullable', 'string'],
        ]);

        $approvable = $this->resolveApprovable($type, $id);

        if (! $approvable) {
            return response()->json(['message' => 'Approvable record not found.'], 404);
        }

        DB::transaction(function () use ($approvable, $validated, $request): void {
            $this->applyStatus($approvable, $validated['status'], $validated['comment'] ?? null, (int) $request->user()->id);

            ApprovalLog::create([
                'approvable_type' => $approvable::class,
                'approvable_id' => $approvable->getKey(),
                'reviewed_by' => (int) $request->user()->id,
                'status' => $validated['status'],
                'comment' => $validated['comment'] ?? null,
            ]);

            if ($approvable instanceof AttendanceLog) {
                $this->refreshUserProgramHours($approvable->user_program_id);
            }
        });

        return response()->json($approvable->refresh());
    }

    private function resolveApprovable(string $type, int $id): ?Model
    {
        return match ($type) {
            'attendance' => AttendanceLog::query()->find($id),
            'daily-report' => DailyReport::query()->find($id),
            'weekly-report' => WeeklyReport::query()->find($id),
            'document' => Document::query()->find($id),
            'evaluation' => Evaluation::query()->find($id),
            default => null,
        };
    }

    private function applyStatus(Model $approvable, string $status, ?string $comment, int $reviewedBy): void
    {
        if ($approvable instanceof AttendanceLog) {
            $approvable->approval_status = $status;
            $approvable->approved_by = $reviewedBy;
            $approvable->save();

            return;
        }

        if ($approvable instanceof DailyReport || $approvable instanceof WeeklyReport || $approvable instanceof Document) {
            $approvable->status = $status;
            $approvable->reviewed_by = $reviewedBy;
            $approvable->review_comment = $comment;
            $approvable->save();
        }

        if ($approvable instanceof Evaluation) {
            $approvable->save();
        }
    }

    private function refreshUserProgramHours(int $userProgramId): void
    {
        $completedHours = AttendanceLog::query()
            ->where('user_program_id', $userProgramId)
            ->where('approval_status', 'approved')
            ->sum('total_hours');

        UserProgram::query()->whereKey($userProgramId)->update([
            'completed_hours' => $completedHours,
        ]);
    }
}
