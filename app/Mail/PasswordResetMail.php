<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public $token;
    public $username;

    public function __construct($token, $username)
    {
        $this->token = $token;
        $this->username = $username;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: config('app.name', 'Personal Money Manager') . ' Password Reset Link',
        );
    }

    public function content(): Content
    {
        $resetUrl = url('/reset-password/' . $this->token . '?username=' . urlencode($this->username));

        return new Content(
            htmlString: "
                <div style='font-family: Arial, sans-serif; background-color: #0f172a; color: #ffffff; padding: 40px 20px; text-align: center;'>
                    <div style='max-width: 480px; margin: 0 auto; background-color: #1e293b; padding: 30px; border-radius: 16px; border: 1px solid #334155;'>
                        <h2 style='color: #6366f1; margin-bottom: 10px;'>" . config('app.name', 'Personal Money Manager') . "</h2>
                        <p style='color: #94a3b8; font-size: 14px;'>Hello {$this->username}, you requested a password reset for your account.</p>
                        <div style='margin: 25px 0;'>
                            <a href='{$resetUrl}' style='font-size: 14px; font-weight: bold; color: #ffffff; background-color: #6366f1; text-decoration: none; padding: 12px 28px; border-radius: 10px; display: inline-block;'>
                                Reset Password
                            </a>
                        </div>
                        <p style='color: #64748b; font-size: 12px;'>If you did not request a password reset, no further action is required.</p>
                    </div>
                </div>
            "
        );
    }
}
