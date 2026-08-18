<?php

namespace App\Http\Controllers;

use App\Mail\TwoFactorCodeMail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('Auth/Login');
    }

    public function showRegister()
    {
        return Inertia::render('Auth/Register');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if (Auth::validate($credentials)) {
            $user = User::where('username', $credentials['username'])->first();

            if ($user->two_factor_enabled) {
                $code = sprintf('%06d', mt_rand(100000, 999999));
                $user->update([
                    'two_factor_code' => $code,
                    'two_factor_expires_at' => Carbon::now()->addMinutes(10),
                ]);

                try {
                    Mail::to($user->username)->send(new TwoFactorCodeMail($code, $user->username));
                } catch (\Exception $e) {}

                session()->put('2fa_user_id', $user->id);
                session()->put('2fa_remember', $request->boolean('remember'));

                return redirect()->route('two-factor.challenge');
            }

            Auth::login($user, $request->boolean('remember'));
            $request->session()->regenerate();
            return redirect()->intended('/dashboard')->with('success', 'Logged in successfully.');
        }

        return back()->withErrors([
            'username' => 'The provided credentials do not match our records.',
        ])->onlyInput('username');
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:50', 'unique:users'],
            'email' => ['nullable', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'email' => $validated['email'] ?? null,
            'password' => Hash::make($validated['password']),
        ]);

        Auth::login($user);

        return redirect('/dashboard')->with('success', 'Account created successfully!');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }
}
