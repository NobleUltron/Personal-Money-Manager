<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Services\NotificationService;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'username' => $user->username,
                    'email' => $user->email,
                    'profilePicture' => $user->profile_picture,
                    'currency' => $user->currency ?? 'UGX',
                    'currencySymbol' => $user->currency_symbol ?? 'UGX',
                    'twoFactorEnabled' => (bool) $user->two_factor_enabled,
                ] : null,
            ],
            'notifications' => fn () => $user ? NotificationService::getNotificationsForUser($user) : [],
            'unreadCount' => fn () => $user ? count(NotificationService::getNotificationsForUser($user)) : 0,
            'userAccounts' => fn () => $user ? $user->accounts()->select('id', 'name', 'bank_name', 'type', 'initial_balance')->get() : [],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}
