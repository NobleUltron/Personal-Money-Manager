<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\Subscription;
use App\Models\Loan;
use App\Models\Goal;
use Illuminate\Support\Str;

class BackupController extends Controller
{
    public function export(Request $request)
    {
        $user = $request->user();

        $backupData = [
            'version' => '1.0',
            'exported_at' => now()->toIso8601String(),
            'user' => [
                'username' => $user->username,
                'email' => $user->email,
                'currency' => $user->currency,
                'currency_symbol' => $user->currency_symbol,
            ],
            'accounts' => Account::where('user_id', $user->id)->get()->toArray(),
            'transactions' => Transaction::whereHas('account', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->get()->toArray(),
            'budgets' => Budget::where('user_id', $user->id)->get()->toArray(),
            'subscriptions' => Subscription::where('user_id', $user->id)->get()->toArray(),
            'loans' => Loan::where('user_id', $user->id)->get()->toArray(),
            'goals' => Goal::where('user_id', $user->id)->get()->toArray(),
        ];

        $filename = 'money_manager_backup_' . now()->format('Y_m_d_His') . '.json';

        return response()->streamDownload(function () use ($backupData) {
            echo json_encode($backupData, JSON_PRETTY_PRINT);
        }, $filename, [
            'Content-Type' => 'application/json',
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'backup_file' => 'required|file|mimes:json,txt',
        ]);

        $user = $request->user();
        $fileContent = file_get_contents($request->file('backup_file')->getRealPath());
        $data = json_decode($fileContent, true);

        if (!$data || !is_array($data) || !isset($data['version'])) {
            return redirect()->back()->with('error', 'Invalid backup file format. Please upload a valid JSON backup file.');
        }

        DB::beginTransaction();
        try {
            // Restore Currency Preferences if present
            if (isset($data['user']['currency']) && isset($data['user']['currency_symbol'])) {
                $user->update([
                    'currency' => $data['user']['currency'],
                    'currency_symbol' => $data['user']['currency_symbol'],
                ]);
            }

            $accountMap = [];

            // 1. Restore Accounts
            if (isset($data['accounts']) && is_array($data['accounts'])) {
                foreach ($data['accounts'] as $acc) {
                    $accId = $acc['id'] ?? (string) Str::uuid();
                    $account = Account::updateOrCreate(
                        ['id' => $accId],
                        [
                            'user_id' => $user->id,
                            'name' => $acc['name'],
                            'bank_name' => $acc['bank_name'] ?? null,
                            'account_number' => $acc['account_number'] ?? null,
                            'type' => $acc['type'] ?? 'Checking',
                            'initial_balance' => $acc['initial_balance'] ?? 0,
                        ]
                    );
                    $accountMap[$accId] = $account->id;
                }
            }

            // 2. Restore Transactions
            $txCount = 0;
            if (isset($data['transactions']) && is_array($data['transactions'])) {
                foreach ($data['transactions'] as $tx) {
                    $accId = $accountMap[$tx['accountId']] ?? $tx['accountId'];
                    if (Account::where('id', $accId)->where('user_id', $user->id)->exists()) {
                        Transaction::updateOrCreate(
                            ['id' => $tx['id'] ?? (string) Str::uuid()],
                            [
                                'accountId' => $accId,
                                'type' => $tx['type'],
                                'amount' => $tx['amount'],
                                'reason' => $tx['reason'] ?? '',
                                'category' => $tx['category'] ?? 'General',
                                'date' => $tx['date'] ?? date('Y-m-d'),
                            ]
                        );
                        $txCount++;
                    }
                }
            }

            // 3. Restore Budgets
            if (isset($data['budgets']) && is_array($data['budgets'])) {
                foreach ($data['budgets'] as $b) {
                    Budget::updateOrCreate(
                        ['user_id' => $user->id, 'category' => $b['category']],
                        ['amount' => $b['amount']]
                    );
                }
            }

            // 4. Restore Subscriptions
            if (isset($data['subscriptions']) && is_array($data['subscriptions'])) {
                foreach ($data['subscriptions'] as $s) {
                    $subId = $s['id'] ?? (string) Str::uuid();
                    $accId = $accountMap[$s['accountId'] ?? ''] ?? $s['accountId'] ?? array_key_first($accountMap);
                    
                    if ($accId && Account::where('id', $accId)->exists()) {
                        Subscription::updateOrCreate(
                            ['id' => $subId],
                            [
                                'user_id' => $user->id,
                                'accountId' => $accId,
                                'name' => $s['name'],
                                'amount' => $s['amount'],
                                'frequency' => $s['frequency'] ?? $s['billing_cycle'] ?? 'monthly',
                                'next_due_date' => $s['next_due_date'] ?? date('Y-m-d'),
                                'category' => $s['category'] ?? 'Subscriptions',
                            ]
                        );
                    }
                }
            }

            // 5. Restore Loans
            if (isset($data['loans']) && is_array($data['loans'])) {
                foreach ($data['loans'] as $l) {
                    $loanId = $l['id'] ?? (string) Str::uuid();
                    Loan::updateOrCreate(
                        ['id' => $loanId],
                        [
                            'user_id' => $user->id,
                            'type' => $l['type'] ?? 'borrowed',
                            'name' => $l['name'] ?? $l['title'] ?? 'Loan',
                            'amount' => $l['amount'],
                            'amount_paid' => $l['amount_paid'] ?? 0.00,
                            'due_date' => $l['due_date'] ?? null,
                        ]
                    );
                }
            }

            // 6. Restore Goals
            $goalCount = 0;
            if (isset($data['goals']) && is_array($data['goals'])) {
                foreach ($data['goals'] as $g) {
                    Goal::updateOrCreate(
                        ['user_id' => $user->id, 'name' => $g['name']],
                        [
                            'target_amount' => $g['target_amount'],
                            'current_amount' => $g['current_amount'] ?? 0,
                            'target_date' => $g['target_date'] ?? null,
                            'category' => $g['category'] ?? 'Savings',
                            'color' => $g['color'] ?? '#6366f1',
                            'notes' => $g['notes'] ?? null,
                        ]
                    );
                    $goalCount++;
                }
            }

            DB::commit();

            return redirect()->back()->with('success', "Data restored successfully! Imported " . count($accountMap) . " accounts, {$txCount} transactions, and {$goalCount} goals.");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Failed to restore backup data: ' . $e->getMessage());
        }
    }
}
