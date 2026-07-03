<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\UserProgram;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class NotificationService
{
    public function notify(User|int $recipient, string $type, string $title, string $message, array $data = []): Notification
    {
        $user = $recipient instanceof User ? $recipient : User::query()->findOrFail($recipient);

        $notification = Notification::query()->create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
            'is_read' => false,
        ]);

        if (config('mail.default') !== 'log' && filter_var($user->email, FILTER_VALIDATE_EMAIL)) {
            try {
                Mail::raw(
                    "{$message}\n\nSign in to TrackWise to review the details.",
                    fn ($mail) => $mail->to($user->email)->subject($title)
                );
            } catch (Throwable $exception) {
                Log::error('Notification email delivery failed.', [
                    'notification_id' => $notification->id,
                    'user_id' => $user->id,
                    'error' => $exception->getMessage(),
                ]);
            }
        }

        return $notification;
    }

    public function notifyReviewersOfSubmission(UserProgram $assignment, string $reportType, int $reportId): void
    {
        $studentName = $assignment->user?->name ?? 'A student';
        $recipients = collect([$assignment->supervisor, $assignment->coordinator])
            ->filter()
            ->unique('id');

        foreach ($recipients as $recipient) {
            $this->notify(
                $recipient,
                'report_submitted',
                "{$reportType} report submitted",
                "{$studentName} submitted a {$reportType} report for review.",
                ['report_type' => strtolower($reportType), 'report_id' => $reportId]
            );
        }
    }

    public function notifyStudentOfReview(
        UserProgram $assignment,
        string $reportType,
        int $reportId,
        string $status,
        ?string $feedback
    ): void {
        $title = "{$reportType} report ".str_replace('_', ' ', $status);
        $message = "Your {$reportType} report was ".str_replace('_', ' ', $status).'.';
        if ($feedback) {
            $message .= " Reviewer feedback: {$feedback}";
        }

        $this->notify(
            $assignment->user,
            "report_{$status}",
            ucfirst($title),
            $message,
            [
                'report_type' => strtolower($reportType),
                'report_id' => $reportId,
                'status' => $status,
                'feedback' => $feedback,
            ]
        );
    }
}
