<?php

namespace App\Services;

use App\Models\User;
use App\Models\Budget;
use App\Models\Goal;
use App\Models\Subscription;
use App\Models\Transaction;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class NotificationService
{
    public static function getNotificationsForUser(User $user): array
    {
        // Cache notifications in memory for 30 seconds to prevent running 10+ DB queries on every page click
        return Cache::remember('user_notifications_' . $user->id, 30, function () use ($user) {
            $notifications = [];

            // 1. Check 2FA Security Status (0 DB queries, memory check)
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

            // 2. Check Savings Goal Milestones (1 lightweight query)
            $goals = Goal::where('user_id', $user->id)
                ->select('id', 'name', 'target_amount', 'current_amount')
                ->get();

            foreach ($goals as $goal) {
                $percentage = $goal->target_amount > 0 ? round(($goal->current_amount / $goal->target_amount) * 100) : 0;
                if ($percentage >= 100) {
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
                } elseif ($percentage >= 50) {
                    $notifications[] = [
                        'id' => 'goal_' . $goal->id . '_50',
                        'type' => 'milestone',
                        'title' => "Goal Milestone: {$percentage}%",
                        'message' => "Great job! {$goal->name} has reached {$percentage}% of target.",
                        'time' => 'In Progress',
                        'read' => false,
                        'link' => '/goals',
                        'icon' => 'Target',
                        'color' => 'indigo',
                    ];
                }
            }

            // 3. Single Aggregated Budget Check (Replaces N queries with 2 lightweight queries)
            $budgets = Budget::where('user_id', $user->id)->get();
            if ($budgets->isNotEmpty()) {
                $categories = $budgets->pluck('category')->toArray();

                $spendingByCategory = Transaction::whereHas('account', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->whereIn('category', $categories)
                ->whereIn('type', ['withdrawal', 'expense'])
                ->groupBy('category')
                ->select('category', DB::raw('SUM(amount) as total_spent'))
                ->pluck('total_spent', 'category');

                foreach ($budgets as $budget) {
                    $spent = (float) ($spendingByCategory[$budget->category] ?? 0);
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

            // 4. Check Subscriptions (1 lightweight query)
            $subscriptions = Subscription::where('user_id', $user->id)
                ->select('id', 'name', 'frequency')
                ->get();

            foreach ($subscriptions as $sub) {
                $notifications[] = [
                    'id' => 'sub_' . $sub->id,
                    'type' => 'reminder',
                    'title' => "Active Subscription: {$sub->name}",
                    'message' => "Recurring payment scheduled for {$sub->frequency} cycle.",
                    'time' => 'Recurring Bill',
                    'read' => false,
                    'link' => '/subscriptions',
                    'icon' => 'CalendarCheck',
                    'color' => 'purple',
                ];
            }

            return $notifications;
        });
    }
}
