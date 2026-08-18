<?php

namespace App\Services;

use App\Models\User;
use App\Models\Budget;
use App\Models\Goal;
use App\Models\Subscription;
use App\Models\Loan;
use App\Models\Transaction;

class NotificationService
{
    public static function getNotificationsForUser(User $user)
    {
        $notifications = [];

        // 1. Check 2FA Security Status
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

        // 2. Check Savings Goal Milestones
        $goals = Goal::where('user_id', $user->id)->get();
        foreach ($goals as $goal) {
            if ($goal->percentage >= 100) {
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
            } elseif ($goal->percentage >= 50) {
                $notifications[] = [
                    'id' => 'goal_' . $goal->id . '_50',
                    'type' => 'milestone',
                    'title' => "Goal Milestone: {$goal->percentage}%",
                    'message' => "Great job! {$goal->name} has reached {$goal->percentage}% of target.",
                    'time' => 'In Progress',
                    'read' => false,
                    'link' => '/goals',
                    'icon' => 'Target',
                    'color' => 'indigo',
                ];
            }
        }

        // 3. Check Budget Warnings
        $budgets = Budget::where('user_id', $user->id)->get();
        foreach ($budgets as $budget) {
            $spent = Transaction::whereHas('account', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->where('category', $budget->category)->where('type', 'withdrawal')->sum('amount');

            if ($spent > $budget->amount) {
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

        // 4. Check Subscriptions
        $subscriptions = Subscription::where('user_id', $user->id)->get();
        foreach ($subscriptions as $sub) {
            $notifications[] = [
                'id' => 'sub_' . $sub->id,
                'type' => 'reminder',
                'title' => "Active Subscription: {$sub->name}",
                'message' => "Recurring payment scheduled for {$sub->billing_cycle} cycle.",
                'time' => 'Recurring Bill',
                'read' => false,
                'link' => '/subscriptions',
                'icon' => 'CalendarCheck',
                'color' => 'purple',
            ];
        }

        return $notifications;
    }
}
