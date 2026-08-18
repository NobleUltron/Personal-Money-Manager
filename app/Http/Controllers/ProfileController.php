<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Settings/Index', [
            'user' => [
                'id' => $request->user()->id,
                'username' => $request->user()->username,
                'email' => $request->user()->email,
                'profilePicture' => $request->user()->profile_picture,
                'currency' => $request->user()->currency ?? 'UGX',
                'currencySymbol' => $request->user()->currency_symbol ?? 'UGX',
                'twoFactorEnabled' => (bool) $request->user()->two_factor_enabled,
            ]
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'username' => 'required|string|max:50|unique:users,username,' . $user->id,
            'email' => 'nullable|email|max:255',
            'currency' => 'nullable|string|max:10',
            'currency_symbol' => 'nullable|string|max:10',
            'profile_picture' => 'nullable|string',
            'current_password' => 'nullable|required_with:new_password',
            'new_password' => 'nullable|string|min:6',
        ]);

        if (!empty($validated['new_password'])) {
            if (!Hash::check($validated['current_password'], $user->password)) {
                return back()->withErrors(['current_password' => 'Current password is incorrect.']);
            }
            $user->password = Hash::make($validated['new_password']);
        }

        $user->username = $validated['username'];
        $user->email = $validated['email'] ?? null;
        if (!empty($validated['currency'])) {
            $user->currency = $validated['currency'];
        }
        if (!empty($validated['currency_symbol'])) {
            $user->currency_symbol = $validated['currency_symbol'];
        }
        if (isset($validated['profile_picture'])) {
            $user->profile_picture = $validated['profile_picture'];
        }

        $user->save();

        return back()->with('success', 'Profile & Settings updated successfully!');
    }
}
