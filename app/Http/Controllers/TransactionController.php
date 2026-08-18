<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $accounts = Account::where('user_id', $user->id)->get();
        $accountIds = $accounts->pluck('id');

        $transactions = Transaction::whereIn('accountId', $accountIds)
            ->with('account')
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'accountId' => 'required|string|exists:accounts,id',
            'type' => 'required|in:deposit,withdrawal',
            'amount' => 'required|numeric|gt:0',
            'date' => 'required|date',
            'reason' => 'nullable|string|max:255',
            'category' => 'required|string|max:50',
        ]);

        // Verify account belongs to user
        $account = Account::where('user_id', $request->user()->id)->where('id', $validated['accountId'])->firstOrFail();

        Transaction::create([
            'id' => (string) Str::uuid(),
            'accountId' => $account->id,
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'date' => $validated['date'],
            'reason' => $validated['reason'] ?? '',
            'category' => $validated['category'],
        ]);

        return back()->with('success', 'Transaction added successfully!');
    }

    public function update(Request $request, $id)
    {
        $userAccountIds = Account::where('user_id', $request->user()->id)->pluck('id');
        $transaction = Transaction::whereIn('accountId', $userAccountIds)->where('id', $id)->firstOrFail();

        $validated = $request->validate([
            'accountId' => 'required|string|exists:accounts,id',
            'type' => 'required|in:deposit,withdrawal',
            'amount' => 'required|numeric|gt:0',
            'date' => 'required|date',
            'reason' => 'nullable|string|max:255',
            'category' => 'required|string|max:50',
        ]);

        $transaction->update($validated);

        return back()->with('success', 'Transaction updated successfully!');
    }

    public function destroy(Request $request, $id)
    {
        $userAccountIds = Account::where('user_id', $request->user()->id)->pluck('id');
        $transaction = Transaction::whereIn('accountId', $userAccountIds)->where('id', $id)->firstOrFail();
        $transaction->delete();

        return back()->with('success', 'Transaction deleted successfully!');
    }
}
