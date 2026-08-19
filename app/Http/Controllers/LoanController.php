<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Loan;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $loans = Loan::with('account')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $accounts = Account::where('user_id', $user->id)
            ->with(['transactions' => function ($query) {
                $query->select('id', 'accountId', 'type', 'amount');
            }])
            ->get()
            ->map(function ($acc) {
                $totalIncome = $acc->transactions->where('type', 'income')->sum('amount');
                $totalExpense = $acc->transactions->where('type', 'expense')->sum('amount');
                $currentBalance = (float) $acc->initial_balance + $totalIncome - $totalExpense;

                return [
                    'id' => $acc->id,
                    'name' => $acc->name,
                    'bank_name' => $acc->bank_name,
                    'type' => $acc->type,
                    'balance' => (float) $currentBalance,
                ];
            });

        $totalBorrowed = $loans->where('type', 'borrowed')->sum('amount');
        $borrowedPaid = $loans->where('type', 'borrowed')->sum('amount_paid');
        
        $totalLent = $loans->where('type', 'lent')->sum('amount');
        $lentPaid = $loans->where('type', 'lent')->sum('amount_paid');

        return Inertia::render('Loans/Index', [
            'loans' => $loans,
            'accounts' => $accounts,
            'summary' => [
                'totalBorrowed' => (float) $totalBorrowed,
                'borrowedPaid' => (float) $borrowedPaid,
                'borrowedRemaining' => (float) max(0, $totalBorrowed - $borrowedPaid),
                'totalLent' => (float) $totalLent,
                'lentPaid' => (float) $lentPaid,
                'lentRemaining' => (float) max(0, $totalLent - $lentPaid),
            ],
            'currencySymbol' => $user->currency_symbol ?? 'UGX',
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'type' => 'required|in:borrowed,lent',
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|gt:0',
            'amount_paid' => 'nullable|numeric|min:0',
            'due_date' => 'nullable|date',
            'accountId' => 'nullable|string|exists:accounts,id',
            'sync_account' => 'nullable|boolean',
        ]);

        DB::beginTransaction();
        try {
            $loanId = (string) Str::uuid();

            $loan = Loan::create([
                'id' => $loanId,
                'user_id' => $user->id,
                'accountId' => $validated['accountId'] ?? null,
                'type' => $validated['type'],
                'name' => $validated['name'],
                'amount' => $validated['amount'],
                'amount_paid' => $validated['amount_paid'] ?? 0,
                'due_date' => $validated['due_date'] ?? null,
            ]);

            // If account synchronization is requested and an account is selected
            if (!empty($validated['sync_account']) && !empty($validated['accountId'])) {
                $account = Account::where('id', $validated['accountId'])->where('user_id', $user->id)->first();

                if ($account) {
                    if ($validated['type'] === 'borrowed') {
                        // Borrowed money adds cash/income into your account
                        Transaction::create([
                            'id' => (string) Str::uuid(),
                            'accountId' => $account->id,
                            'type' => 'income',
                            'amount' => $validated['amount'],
                            'category' => 'Loan / Borrowed',
                            'reason' => 'Loan borrowed from ' . $validated['name'],
                            'date' => now()->format('Y-m-d'),
                        ]);
                    } elseif ($validated['type'] === 'lent') {
                        // Lent money deducts cash/expense from your account
                        Transaction::create([
                            'id' => (string) Str::uuid(),
                            'accountId' => $account->id,
                            'type' => 'expense',
                            'amount' => $validated['amount'],
                            'category' => 'Loan / Lent',
                            'reason' => 'Loan lent to ' . $validated['name'],
                            'date' => now()->format('Y-m-d'),
                        ]);
                    }
                }
            }

            DB::commit();
            return back()->with('success', 'Loan record created successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create loan: ' . $e->getMessage()]);
        }
    }

    public function repay(Request $request, $id)
    {
        $user = $request->user();
        $loan = Loan::where('user_id', $user->id)->where('id', $id)->firstOrFail();

        $remaining = (float) max(0, $loan->amount - $loan->amount_paid);

        $validated = $request->validate([
            'repayment_amount' => 'required|numeric|gt:0|max:' . ($remaining + 0.01),
            'accountId' => 'nullable|string|exists:accounts,id',
            'sync_account' => 'nullable|boolean',
        ]);

        DB::beginTransaction();
        try {
            $newAmountPaid = min((float) $loan->amount, (float) $loan->amount_paid + (float) $validated['repayment_amount']);
            $loan->update([
                'amount_paid' => $newAmountPaid,
            ]);

            // If account synchronization is requested and an account is selected
            if (!empty($validated['sync_account']) && !empty($validated['accountId'])) {
                $account = Account::where('id', $validated['accountId'])->where('user_id', $user->id)->first();

                if ($account) {
                    if ($loan->type === 'borrowed') {
                        // Paying back debt is an expense from your account
                        Transaction::create([
                            'id' => (string) Str::uuid(),
                            'accountId' => $account->id,
                            'type' => 'expense',
                            'amount' => $validated['repayment_amount'],
                            'category' => 'Loan Repayment',
                            'reason' => 'Repayment for loan: ' . $loan->name,
                            'date' => now()->format('Y-m-d'),
                        ]);
                    } elseif ($loan->type === 'lent') {
                        // Receiving payback from someone is income into your account
                        Transaction::create([
                            'id' => (string) Str::uuid(),
                            'accountId' => $account->id,
                            'type' => 'income',
                            'amount' => $validated['repayment_amount'],
                            'category' => 'Loan Repayment',
                            'reason' => 'Loan repayment received from: ' . $loan->name,
                            'date' => now()->format('Y-m-d'),
                        ]);
                    }
                }
            }

            DB::commit();
            return back()->with('success', 'Repayment of ' . number_format($validated['repayment_amount'], 2) . ' recorded successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to record repayment: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, $id)
    {
        $loan = Loan::where('user_id', $request->user()->id)->where('id', $id)->firstOrFail();

        $validated = $request->validate([
            'type' => 'required|in:borrowed,lent',
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|gt:0',
            'amount_paid' => 'required|numeric|min:0',
            'due_date' => 'nullable|date',
            'accountId' => 'nullable|string|exists:accounts,id',
        ]);

        $loan->update($validated);

        return back()->with('success', 'Loan updated successfully!');
    }

    public function destroy(Request $request, $id)
    {
        $loan = Loan::where('user_id', $request->user()->id)->where('id', $id)->firstOrFail();
        $loan->delete();

        return back()->with('success', 'Loan deleted successfully!');
    }
}
