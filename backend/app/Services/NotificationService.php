<?php

namespace App\Services;

use App\Models\NotificationLog;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    public static function notify($userId, $type, $title, $message, $data = [])
    {
        try {
            $user = User::find($userId);
            if (!$user) return false;

            // Create database notification
            NotificationLog::create([
                'user_id' => $userId,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'data' => $data,
            ]);

            // Send email notification based on type
            self::sendEmailNotification($user, $type, $title, $message, $data);

            return true;
        } catch (\Exception $e) {
            \Log::error('Notification error: ' . $e->getMessage());
            return false;
        }
    }

    private static function sendEmailNotification($user, $type, $title, $message, $data)
    {
        try {
            $subject = match($type) {
                'report_submitted' => 'Report Submitted for Review',
                'report_approved' => 'Your Report Has Been Approved',
                'report_rejected' => 'Your Report Was Rejected',
                'report_needs_revision' => 'Your Report Needs Revision',
                'assignment_created' => 'New Assignment Created',
                'program_assigned' => 'New Program Assignment',
                default => $title,
            };

            $emailBody = self::generateEmailBody($type, $title, $message, $data, $user);

            // In production, use proper mailing service
            // For now, log that we would send an email
            \Log::info("Email to {$user->email}: {$subject}");

        } catch (\Exception $e) {
            \Log::error('Email notification failed: ' . $e->getMessage());
        }
    }

    private static function generateEmailBody($type, $title, $message, $data, $user)
    {
        $body = "Hello {$user->first_name},\n\n";
        $body .= "{$title}\n\n";
        $body .= "{$message}\n\n";

        if (!empty($data)) {
            $body .= "Details:\n";
            foreach ($data as $key => $value) {
                $body .= "- " . ucfirst(str_replace('_', ' ', $key)) . ": {$value}\n";
            }
            $body .= "\n";
        }

        $body .= "Please log in to TrackWise to view more details.\n\n";
        $body .= "Best regards,\nTrackWise Team";

        return $body;
    }

    public static function notifyReportSubmitted($userId, $reportType, $reportId)
    {
        return self::notify(
            $userId,
            'report_submitted',
            'Report Submitted for Review',
            "Your {$reportType} report has been submitted successfully and is awaiting review.",
            ['report_type' => $reportType, 'report_id' => $reportId]
        );
    }

    public static function notifyReportApproved($userId, $reportType, $reportId)
    {
        return self::notify(
            $userId,
            'report_approved',
            'Report Approved',
            "Your {$reportType} report (ID: {$reportId}) has been approved!",
            ['report_type' => $reportType, 'report_id' => $reportId, 'status' => 'approved']
        );
    }

    public static function notifyReportRejected($userId, $reportType, $reportId, $reason = '')
    {
        $message = "Your {$reportType} report (ID: {$reportId}) was rejected.";
        if ($reason) {
            $message .= " Reason: {$reason}";
        }

        return self::notify(
            $userId,
            'report_rejected',
            'Report Rejected',
            $message,
            ['report_type' => $reportType, 'report_id' => $reportId, 'reason' => $reason]
        );
    }

    public static function notifyReportNeedsRevision($userId, $reportType, $reportId, $feedback = '')
    {
        $message = "Your {$reportType} report (ID: {$reportId}) needs revision.";
        if ($feedback) {
            $message .= " Feedback: {$feedback}";
        }

        return self::notify(
            $userId,
            'report_needs_revision',
            'Report Needs Revision',
            $message,
            ['report_type' => $reportType, 'report_id' => $reportId, 'feedback' => $feedback]
        );
    }

    public static function notifyAssignmentCreated($userId, $programName, $supervisorName)
    {
        return self::notify(
            $userId,
            'assignment_created',
            'New Assignment Created',
            "You have been assigned to the program '{$programName}' under the supervision of {$supervisorName}.",
            ['program_name' => $programName, 'supervisor' => $supervisorName]
        );
    }

    public static function notifySupervisorsOfSubmission($programId, $reportType, $reportId, $studentName)
    {
        // Find all supervisors for this program
        // In a real app, this would find supervisors assigned to the program
        \Log::info("Notifying supervisors of {$reportType} submission from {$studentName}");
    }
}
