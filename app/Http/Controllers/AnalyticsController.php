<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $accounts = Account::where('user_id', $user->id)->get();
        $accountIds = $accounts->pluck('id');

        // Date ranges for current 30-day period vs previous 30-day period
        $now = Carbon::now();
        $startDate = Carbon::now()->subDays(29)->startOfDay();
        $previousStartDate = Carbon::now()->subDays(59)->startOfDay();
        $previousEndDate = Carbon::now()->subDays(30)->endOfDay();

        $transactions = Transaction::whereIn('accountId', $accountIds)
            ->where('date', '>=', $previousStartDate->format('Y-m-d'))
            ->orderBy('date', 'asc')
            ->get();

        // Current period transactions
        $currentTransactions = $transactions->filter(function ($t) use ($startDate) {
            return Carbon::parse($t->date)->greaterThanOrEqualTo($startDate);
        });

        // Previous period transactions
        $previousTransactions = $transactions->filter(function ($t) use ($previousStartDate, $previousEndDate) {
            $d = Carbon::parse($t->date);
            return $d->greaterThanOrEqualTo($previousStartDate) && $d->lessThanOrEqualTo($previousEndDate);
        });

        // Expenses in current period
        $currentExpenses = $currentTransactions->whereIn('type', ['withdrawal', 'expense']);
        $totalSpending = (float) $currentExpenses->sum('amount');

        // Expenses in previous period
        $previousExpenses = $previousTransactions->whereIn('type', ['withdrawal', 'expense']);
        $prevTotalSpending = (float) $previousExpenses->sum('amount');

        // Percentage change
        $spendingChangePct = 0;
        if ($prevTotalSpending > 0) {
            $spendingChangePct = round((($totalSpending - $prevTotalSpending) / $prevTotalSpending) * 100, 1);
        }

        // Daily trend data (Last 30 Days)
        $dailyMap = [];
        for ($i = 29; $i >= 0; $i--) {
            $dateKey = Carbon::now()->subDays($i)->format('Y-m-d');
            $dailyMap[$dateKey] = [
                'date' => $dateKey,
                'label' => Carbon::parse($dateKey)->format('M j'),
                'dayName' => Carbon::parse($dateKey)->format('D'),
                'amount' => 0.0,
                'accountSpending' => [],
            ];
        }

        $peakAmount = 0;
        $peakDate = null;

        foreach ($currentExpenses as $t) {
            $d = $t->date;
            if (isset($dailyMap[$d])) {
                $amt = (float) $t->amount;
                $dailyMap[$d]['amount'] += $amt;
                $accId = $t->accountId;
                $dailyMap[$d]['accountSpending'][$accId] = ($dailyMap[$d]['accountSpending'][$accId] ?? 0) + $amt;
            }
        }

        $dailyTrend = array_values($dailyMap);
        foreach ($dailyTrend as $item) {
            if ($item['amount'] > $peakAmount) {
                $peakAmount = $item['amount'];
                $peakDate = $item['label'];
            }
        }

        $dailyAvg = count($dailyTrend) > 0 ? round($totalSpending / 30, 2) : 0;

        // Categories breakdown
        $categoryBreakdown = $currentExpenses->groupBy('category')->map(function ($group, $cat) use ($totalSpending) {
            $catSum = (float) $group->sum('amount');
            return [
                'category' => $cat ?: 'General',
                'amount' => $catSum,
                'percentage' => $totalSpending > 0 ? round(($catSum / $totalSpending) * 100, 1) : 0,
            ];
        })->sortByDesc('amount')->values();

        // Trackers / Accounts Comparison
        $accountsComparison = $accounts->map(function ($acc) use ($currentExpenses, $totalSpending) {
            $spent = (float) $currentExpenses->where('accountId', $acc->id)->sum('amount');
            return [
                'id' => $acc->id,
                'name' => $acc->name,
                'bank_name' => $acc->bank_name,
                'type' => $acc->type,
                'spent' => $spent,
                'percentage' => $totalSpending > 0 ? round(($spent / $totalSpending) * 100, 1) : 0,
            ];
        })->sortByDesc('spent')->values();

        // Budgets overview
        $budgets = Budget::where('user_id', $user->id)->get()->map(function ($b) use ($currentExpenses) {
            $spent = (float) $currentExpenses->where('category', $b->category)->sum('amount');
            $limit = (float) $b->amount;
            $remaining = max(0, $limit - $spent);
            $pct = $limit > 0 ? round(($spent / $limit) * 100, 1) : 0;

            return [
                'id' => $b->id,
                'category' => $b->category,
                'limit' => $limit,
                'spent' => $spent,
                'remaining' => $remaining,
                'percentage' => $pct,
                'isOver' => $spent > $limit,
            ];
        });

        // Days until end of current month
        $daysInMonth = Carbon::now()->daysInMonth;
        $dayOfMonth = Carbon::now()->day;
        $daysRemainingInMonth = max(1, $daysInMonth - $dayOfMonth);

        return Inertia::render('Analytics/Index', [
            'accounts' => $accounts,
            'overview' => [
                'totalSpending' => $totalSpending,
                'prevTotalSpending' => $prevTotalSpending,
                'spendingChangePct' => $spendingChangePct,
                'dailyAvg' => $dailyAvg,
                'peakAmount' => $peakAmount,
                'peakDate' => $peakDate ?: 'N/A',
                'dateRange' => $startDate->format('M j, Y') . ' – ' . Carbon::now()->format('M j, Y'),
            ],
            'dailyTrend' => $dailyTrend,
            'categoryBreakdown' => $categoryBreakdown,
            'accountsComparison' => $accountsComparison,
            'budgets' => $budgets,
            'daysRemainingInMonth' => $daysRemainingInMonth,
            'currencySymbol' => $user->currency_symbol ?? 'UGX',
            'userName' => $user->username ?? 'User',
        ]);
    }
}
