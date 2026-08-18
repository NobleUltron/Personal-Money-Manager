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
use Str;

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
            $accountMap = [];

            // Restore Accounts
            if (isset($data['accounts']) && is_array($data['accounts'])) {
                foreach ($data['accounts'] as $acc) {
                    $oldId = $acc['id'];
                    $account = Account::updateOrCreate(
                        ['user_id' => $user->id, 'name' => $acc['name']],
                        [
                            'id' => $oldId,
                            'bank_name' => $acc['bank_name'] ?? null,
                            'account_number' => $acc['account_number'] ?? null,
                            'type' => $acc['type'] ?? 'Checking',
                            'initial_balance' => $acc['initial_balance'] ?? 0,
                        ]
                    );
                    $accountMap[$oldId] = $account->id;
                }
            }

            // Restore Transactions
            $txCount = 0;
            if (isset($data['transactions']) && is_array($data['transactions'])) {
                foreach ($data['transactions'] as $tx) {
                    $accId = $accountMap[$tx['accountId']] ?? $tx['accountId'];
                    if (Account::where('id', $accId)->where('user_id', $user->id)->exists()) {
                        Transaction::updateOrCreate(
                            ['id' => $tx['id']],
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

            // Restore Budgets
            if (isset($data['budgets']) && is_array($data['budgets'])) {
                foreach ($data['budgets'] as $b) {
                    Budget::updateOrCreate(
                        ['user_id' => $user->id, 'category' => $b['category']],
                        ['amount' => $b['amount']]
                    );
                }
            }

            // Restore Subscriptions
            if (isset($data['subscriptions']) && is_array($data['subscriptions'])) {
                foreach ($data['subscriptions'] as $s) {
                    Subscription::updateOrCreate(
                        ['user_id' => $user->id, 'name' => $s['name']],
                        [
                            'accountId' => $s['accountId'] ?? ($accountMap[$s['accountId'] ?? ''] ?? null),
                            'amount' => $s['amount'],
                            'billing_cycle' => $s['billing_cycle'] ?? 'Monthly',
                            'category' => $s['category'] ?? 'Subscriptions',
                        ]
                    );
                }
            }

            // Restore Loans
            if (isset($data['loans']) && is_array($data['loans'])) {
                foreach ($data['loans'] as $l) {
                    Loan::updateOrCreate(
                        ['user_id' => $user->id, 'title' => $l['title']],
                        [
                            'type' => $l['type'],
                            'amount' => $l['amount'],
                            'remaining_amount' => $l['remaining_amount'] ?? $l['amount'],
                            'person_name' => $l['person_name'] ?? null,
                            'due_date' => $l['due_date'] ?? null,
                            'notes' => $l['notes'] ?? null,
                        ]
                    );
                }
            }

            // Restore Goals
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
