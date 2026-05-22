<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

class VerifyStudentAccount extends VerifyEmail
{
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Verify your TrackWise account')
            ->greeting('Welcome to TrackWise!')
            ->line('Please verify your Gmail address before signing in to your student OJT tracker.')
            ->action('Verify my account', $this->verificationUrl($notifiable))
            ->line('After verification, TrackWise will sign you in automatically.');
    }
}
