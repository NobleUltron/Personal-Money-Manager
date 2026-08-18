<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $accountIds = Account::where('user_id', $user->id)->pluck('id');

        $transactions = Transaction::whereIn('accountId', $accountIds)
            ->orderBy('date', 'asc')
            ->get();

        // Category breakdown
        $categoryBreakdown = $transactions->where('type', 'withdrawal')
            ->groupBy('category')
            ->map(function ($group, $category) {
                return [
                    'category' => $category,
                    'amount' => (float)$group->sum('amount'),
                ];
            })->values();

        // Monthly trends
        $monthlyTrends = $transactions->groupBy(function ($t) {
            return substr($t->date, 0, 7); // YYYY-MM
        })->map(function ($group, $month) {
            return [
                'month' => $month,
                'deposits' => (float)$group->where('type', 'deposit')->sum('amount'),
                'withdrawals' => (float)$group->where('type', 'withdrawal')->sum('amount'),
                'savings' => (float)($group->where('type', 'deposit')->sum('amount') - $group->where('type', 'withdrawal')->sum('amount')),
            ];
        })->values();

        return Inertia::render('Analytics/Index', [
            'categoryBreakdown' => $categoryBreakdown,
            'monthlyTrends' => $monthlyTrends,
        ]);
    }
}
