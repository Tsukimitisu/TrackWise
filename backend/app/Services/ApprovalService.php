<?php

namespace App\Services;

use App\Models\ApprovalLog;
use App\Models\AttendanceLog;
use App\Models\DailyReport;
use App\Models\User;
use App\Models\UserProgram;
use App\Models\WeeklyReport;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ApprovalService
{
    public function __construct(private NotificationService $notifications)
    {
    }

    public function review(User $reviewer, Model $record, string $status, ?string $comment = null): Model
    {
        $assignment = $this->assignment($record);

        abort_unless(AccessScope::canReviewAssignment($reviewer, $assignment), 403);

        if (in_array($status, ['rejected', 'needs_revision'], true) && ! trim((string) $comment)) {
            throw ValidationException::withMessages([
                'comment' => ['Reviewer feedback is required for rejection or revision requests.'],
            ]);
        }

        if (($record instanceof DailyReport || $record instanceof WeeklyReport) && $record->status !== 'submitted') {
            throw ValidationException::withMessages([
                'status' => ['Only submitted reports can be reviewed.'],
            ]);
        }

        DB::transaction(function () use ($record, $reviewer, $status, $comment, $assignment) {
            if ($record instanceof AttendanceLog) {
                $record->forceFill([
                    'approval_status' => $status,
                    'approved_by' => $reviewer->id,
                ])->save();
                $this->refreshApprovedHours($assignment);
            } else {
                $record->forceFill([
                    'status' => $status,
                    'reviewed_by' => $reviewer->id,
                    'review_comment' => $comment,
                ])->save();
            }

            ApprovalLog::query()->create([
                'approvable_type' => $record::class,
                'approvable_id' => $record->getKey(),
                'reviewed_by' => $reviewer->id,
                'status' => $status,
                'comment' => $comment,
            ]);

            if ($record instanceof DailyReport || $record instanceof WeeklyReport) {
                $this->notifications->notifyStudentOfReview(
                    $assignment,
                    $record instanceof DailyReport ? 'Daily' : 'Weekly',
                    (int) $record->getKey(),
                    $status,
                    $comment
                );
            }
        });

        return $record->refresh()->load(['userProgram.user', 'userProgram.program']);
    }

    private function assignment(Model $record): UserProgram
    {
        if (! $record instanceof AttendanceLog
            && ! $record instanceof DailyReport
            && ! $record instanceof WeeklyReport) {
            abort(422, 'This record type does not use the TrackWise approval workflow.');
        }

        return $record->userProgram;
    }

    private function refreshApprovedHours(UserProgram $assignment): void
    {
        $approvedHours = $assignment->attendanceLogs()
            ->where('approval_status', 'approved')
            ->sum('total_hours');

        $assignment->update([
            'completed_hours' => $approvedHours,
            'status' => (float) $approvedHours >= (float) $assignment->required_hours
                ? 'completed'
                : $assignment->status,
        ]);
    }
}
