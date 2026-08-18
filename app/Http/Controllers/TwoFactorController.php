<?php

namespace App\Http\Controllers;

use App\Mail\TwoFactorCodeMail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class TwoFactorController extends Controller
{
    public function toggle(Request $request)
    {
        $user = $request->user();
        $enable = $request->boolean('enable');

        if ($enable) {
            $code = sprintf('%06d', mt_rand(100000, 999999));
            $user->update([
                'two_factor_enabled' => true,
                'two_factor_code' => $code,
                'two_factor_expires_at' => Carbon::now()->addMinutes(10),
            ]);

            $recipient = $user->email ?: $user->username;
            try {
                Mail::to($recipient)->send(new TwoFactorCodeMail($code, $user->username));
            } catch (\Exception $e) {
                // Log or handle email exception gracefully
            }

            return back()->with('success', 'Two-Factor Authentication enabled successfully.');
        } else {
            $user->update([
                'two_factor_enabled' => false,
                'two_factor_code' => null,
                'two_factor_expires_at' => null,
            ]);

            return back()->with('success', 'Two-Factor Authentication disabled.');
        }
    }

    public function showChallenge(Request $request)
    {
        if (!session()->has('2fa_user_id')) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactorChallenge');
    }

    public function verify(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $userId = session()->get('2fa_user_id');
        if (!$userId) {
            return redirect()->route('login');
        }

        $user = User::find($userId);

        if (!$user || !$user->two_factor_code || $user->two_factor_code !== $request->code) {
            return back()->withErrors(['code' => 'The entered security code is invalid.']);
        }

        if ($user->two_factor_expires_at && Carbon::now()->greaterThan($user->two_factor_expires_at)) {
            return back()->withErrors(['code' => 'Security code has expired. Please request a new code.']);
        }

        // Clear code and log user in
        $user->update([
            'two_factor_code' => null,
            'two_factor_expires_at' => null,
        ]);

        session()->forget('2fa_user_id');
        Auth::login($user, session()->get('2fa_remember', false));

        return redirect()->intended('/dashboard')->with('success', 'Authenticated with Two-Factor Security!');
    }

    public function resend(Request $request)
    {
        $userId = session()->get('2fa_user_id');
        if (!$userId) {
            return redirect()->route('login');
        }

        $user = User::find($userId);
        if ($user) {
            $code = sprintf('%06d', mt_rand(100000, 999999));
            $user->update([
                'two_factor_code' => $code,
                'two_factor_expires_at' => Carbon::now()->addMinutes(10),
            ]);

            $recipient = $user->email ?: $user->username;
            try {
                Mail::to($recipient)->send(new TwoFactorCodeMail($code, $user->username));
            } catch (\Exception $e) {
                // Handle email failure gracefully
            }
        }

        return back()->with('success', 'A new 6-digit security code has been sent.');
    }
}
