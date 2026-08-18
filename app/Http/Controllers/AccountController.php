<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AccountController extends Controller
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

        return Inertia::render('Accounts/Index', [
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:100',
            'type' => 'required|string|max:50',
            'initial_balance' => 'nullable|numeric|min:0',
        ]);

        Account::create([
            'id' => (string) Str::uuid(),
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'bank_name' => $validated['bank_name'] ?? null,
            'account_number' => $validated['account_number'] ?? null,
            'type' => $validated['type'],
            'initial_balance' => $validated['initial_balance'] ?? 0,
        ]);

        return back()->with('success', 'Account created successfully!');
    }

    public function update(Request $request, $id)
    {
        $account = Account::where('user_id', $request->user()->id)->where('id', $id)->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:100',
            'type' => 'required|string|max:50',
            'initial_balance' => 'nullable|numeric|min:0',
        ]);

        $account->update($validated);

        return back()->with('success', 'Account updated successfully!');
    }

    public function destroy(Request $request, $id)
    {
        $account = Account::where('user_id', $request->user()->id)->where('id', $id)->firstOrFail();
        $account->delete();

        return back()->with('success', 'Account deleted successfully!');
    }
}
