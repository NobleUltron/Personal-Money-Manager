<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\Subscription;
use App\Models\Loan;
use App\Models\Goal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $accounts = Account::where('user_id', $user->id)
            ->with(['transactions'])
            ->get()
            ->map(function ($acc) {
                $deposits = $acc->transactions->where('type', 'deposit')->sum('amount');
                $withdrawals = $acc->transactions->where('type', 'withdrawal')->sum('amount');
                $currentBalance = (float)$acc->initial_balance + $deposits - $withdrawals;
                return [
                    'id' => $acc->id,
                    'name' => $acc->name,
                    'bank_name' => $acc->bank_name,
                    'account_number' => $acc->account_number,
                    'type' => $acc->type,
                    'initial_balance' => (float)$acc->initial_balance,
                    'balance' => $currentBalance,
                    'created_at' => $acc->created_at->format('Y-m-d H:i:s'),
                ];
            });

        $accountIds = $accounts->pluck('id');

        $transactions = Transaction::whereIn('accountId', $accountIds)
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        $totalBalance = $accounts->sum('balance');
        $totalDeposits = $transactions->where('type', 'deposit')->sum('amount');
        $totalWithdrawals = $transactions->where('type', 'withdrawal')->sum('amount');
        $netSavings = $totalDeposits - $totalWithdrawals;

        $budgets = Budget::where('user_id', $user->id)->get();
        $subscriptions = Subscription::where('user_id', $user->id)->get();
        $loans = Loan::where('user_id', $user->id)->get();
        $goals = Goal::where('user_id', $user->id)->get();

        return Inertia::render('Dashboard', [
            'accounts' => $accounts,
            'recentTransactions' => $transactions->take(6)->values(),
            'totalBalance' => (float)$totalBalance,
            'totalDeposits' => (float)$totalDeposits,
            'totalWithdrawals' => (float)$totalWithdrawals,
            'netSavings' => (float)$netSavings,
            'budgets' => $budgets,
            'subscriptions' => $subscriptions,
            'loans' => $loans,
            'goals' => $goals,
        ]);
    }
}
