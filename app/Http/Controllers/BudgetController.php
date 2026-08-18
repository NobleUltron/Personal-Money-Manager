<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $accountIds = Account::where('user_id', $user->id)->pluck('id');
        
        // Get withdrawals this month per category
        $firstDayOfMonth = now()->startOfMonth()->format('Y-m-d');
        $lastDayOfMonth = now()->endOfMonth()->format('Y-m-d');

        $categorySpending = Transaction::whereIn('accountId', $accountIds)
            ->where('type', 'withdrawal')
            ->whereBetween('date', [$firstDayOfMonth, $lastDayOfMonth])
            ->selectRaw('category, SUM(amount) as total_spent')
            ->groupBy('category')
            ->pluck('total_spent', 'category');

        $budgets = Budget::where('user_id', $user->id)
            ->get()
            ->map(function ($b) use ($categorySpending) {
                $spent = (float)($categorySpending[$b->category] ?? 0);
                return [
                    'id' => $b->id,
                    'category' => $b->category,
                    'amount' => (float)$b->amount,
                    'spent' => $spent,
                    'remaining' => (float)$b->amount - $spent,
                    'percentage' => $b->amount > 0 ? min(100, round(($spent / $b->amount) * 100)) : 0,
                ];
            });

        return Inertia::render('Budgets/Index', [
            'budgets' => $budgets,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:50',
            'amount' => 'required|numeric|gt:0',
        ]);

        Budget::updateOrCreate(
            ['user_id' => $request->user()->id, 'category' => $validated['category']],
            ['id' => (string) Str::uuid(), 'amount' => $validated['amount']]
        );

        return back()->with('success', 'Budget updated successfully!');
    }

    public function destroy(Request $request, $id)
    {
        $budget = Budget::where('user_id', $request->user()->id)->where('id', $id)->firstOrFail();
        $budget->delete();

        return back()->with('success', 'Budget deleted successfully!');
    }
}
