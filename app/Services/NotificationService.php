<?php

namespace App\Services;

use App\Models\User;
use App\Models\Budget;
use App\Models\Goal;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\Account;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    public static function getNotificationsForUser(User $user): array
    {
        try {
            $notifications = [];

            // 1. 2FA Security Status
            if ($user->two_factor_enabled) {
                $notifications[] = [
                    'id' => 'sec_2fa_enabled',
                    'type' => 'security',
                    'title' => '2FA Protection Active',
                    'message' => 'Two-Factor Authentication is protecting your account via email verification.',
                    'time' => 'Security Active',
                    'read' => false,
                    'link' => '/settings',
                    'icon' => 'ShieldCheck',
                    'color' => 'emerald',
                ];
            } else {
                $notifications[] = [
                    'id' => 'sec_2fa_disabled',
                    'type' => 'warning',
                    'title' => 'Security Recommendation',
                    'message' => 'Enable 2FA in Settings to protect your financial data.',
                    'time' => 'Action Needed',
                    'read' => false,
                    'link' => '/settings',
                    'icon' => 'ShieldAlert',
                    'color' => 'amber',
                ];
            }

            // 2. Goal Milestones
            $goals = Goal::where('user_id', $user->id)->get();
            foreach ($goals as $goal) {
                $pct = $goal->percentage ?? 0;
                if ($pct >= 100) {
                    $notifications[] = [
                        'id' => 'goal_' . $goal->id . '_100',
                        'type' => 'milestone',
                        'title' => '🎉 Goal Completed!',
                        'message' => "Congratulations! You reached your savings target for {$goal->name}.",
                        'time' => 'Achieved',
                        'read' => false,
                        'link' => '/goals',
                        'icon' => 'Trophy',
                        'color' => 'emerald',
                    ];
                } elseif ($pct >= 50) {
                    $notifications[] = [
                        'id' => 'goal_' . $goal->id . '_50',
                        'type' => 'milestone',
                        'title' => "Goal Milestone: {$pct}%",
                        'message' => "Great job! {$goal->name} has reached {$pct}% of target.",
                        'time' => 'In Progress',
                        'read' => false,
                        'link' => '/goals',
                        'icon' => 'Target',
                        'color' => 'indigo',
                    ];
                }
            }

            // 3. Budgets Alert Check
            $accountIds = Account::where('user_id', $user->id)->pluck('id');
            if ($accountIds->isNotEmpty()) {
                $transactions = Transaction::whereIn('accountId', $accountIds)
                    ->whereIn('type', ['withdrawal', 'expense'])
                    ->get();

                $budgets = Budget::where('user_id', $user->id)->get();
                foreach ($budgets as $budget) {
                    $spent = $transactions->where('category', $budget->category)->sum('amount');
                    if ($spent > (float) $budget->amount) {
                        $notifications[] = [
                            'id' => 'budget_over_' . $budget->id,
                            'type' => 'alert',
                            'title' => "Budget Exceeded: {$budget->category}",
                            'message' => "Spending has exceeded your set budget limit for {$budget->category}.",
                            'time' => 'Budget Alert',
                            'read' => false,
                            'link' => '/budgets',
                            'icon' => 'AlertCircle',
                            'color' => 'rose',
                        ];
                    }
                }
            }

            // 4. Subscriptions Check
            $subscriptions = Subscription::where('user_id', $user->id)->get();
            foreach ($subscriptions as $sub) {
                $notifications[] = [
                    'id' => 'sub_' . $sub->id,
                    'type' => 'reminder',
                    'title' => "Active Subscription: {$sub->name}",
                    'message' => "Recurring payment scheduled for " . ($sub->frequency ?? 'monthly') . " cycle.",
                    'time' => 'Recurring Bill',
                    'read' => false,
                    'link' => '/subscriptions',
                    'icon' => 'CalendarCheck',
                    'color' => 'purple',
                ];
            }

            return $notifications;
        } catch (\Throwable $e) {
            Log::error('NotificationService Exception: ' . $e->getMessage());
            return [];
        }
    }
}
