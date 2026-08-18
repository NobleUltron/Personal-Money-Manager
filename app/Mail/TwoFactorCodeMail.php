<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TwoFactorCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $code;
    public $userName;

    public function __construct($code, $userName)
    {
        $this->code = $code;
        $this->userName = $userName;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: config('app.name', 'Personal Money Manager') . ' Security Code: ' . $this->code,
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: "
                <div style='font-family: Arial, sans-serif; background-color: #0f172a; color: #ffffff; padding: 40px 20px; text-align: center;'>
                    <div style='max-width: 480px; margin: 0 auto; background-color: #1e293b; padding: 30px; border-radius: 16px; border: 1px solid #334155;'>
                        <h2 style='color: #6366f1; margin-bottom: 10px;'>" . config('app.name', 'Personal Money Manager') . " Security</h2>
                        <p style='color: #94a3b8; font-size: 14px;'>Hello {$this->userName}, your 6-digit security verification code is:</p>
                        <div style='font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ffffff; background-color: #0f172a; padding: 16px 24px; border-radius: 12px; display: inline-block; margin: 20px 0; border: 1px solid #6366f1;'>
                            {$this->code}
                        </div>
                        <p style='color: #64748b; font-size: 12px;'>This code is valid for 10 minutes. If you did not request this login attempt, please change your password immediately.</p>
                    </div>
                </div>
            "
        );
    }
}
