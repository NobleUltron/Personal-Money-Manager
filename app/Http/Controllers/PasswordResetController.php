<?php

namespace App\Http\Controllers;

use App\Mail\PasswordResetMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PasswordResetController extends Controller
{
    public function showLinkRequestForm()
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    public function sendResetLinkEmail(Request $request)
    {
        $request->validate([
            'username' => 'required|string|exists:users,username',
        ]);

        $token = Str::random(60);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['username' => $request->username],
            [
                'token' => Hash::make($token),
                'created_at' => now(),
            ]
        );

        try {
            Mail::to($request->username)->send(new PasswordResetMail($token, $request->username));
        } catch (\Exception $e) {
            // Handle mail delivery exception gracefully
        }

        return back()->with('success', 'If an account exists, a password reset link has been generated.');
    }

    public function showResetForm(Request $request, $token)
    {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'username' => $request->query('username', ''),
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'username' => 'required|string|exists:users,username',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('username', $request->username)
            ->first();

        if (!$record || !Hash::check($request->token, $record->token)) {
            return back()->withErrors(['username' => 'Invalid or expired password reset token.']);
        }

        $user = User::where('username', $request->username)->first();
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        DB::table('password_reset_tokens')->where('username', $request->username)->delete();

        return redirect()->route('login')->with('success', 'Your password has been reset successfully! Please sign in.');
    }
}
