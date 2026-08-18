<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\Subscription;
use App\Models\Loan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['username' => 'default_user'],
            ['password' => Hash::make('password123')]
        );

        // Sample Account 1
        $account1 = Account::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'name' => 'Main Checking Account',
            'bank_name' => 'Chase Bank',
            'account_number' => '**** 4829',
            'type' => 'Checking',
            'initial_balance' => 5000.00
        ]);

        // Sample Account 2
        $account2 = Account::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'name' => 'High Yield Savings',
            'bank_name' => 'Capital One',
            'account_number' => '**** 9102',
            'type' => 'Savings',
            'initial_balance' => 12500.00
        ]);

        // Sample Transactions
        Transaction::create([
            'id' => (string) Str::uuid(),
            'accountId' => $account1->id,
            'type' => 'deposit',
            'amount' => 4500.00,
            'date' => now()->format('Y-m-d'),
            'reason' => 'Monthly Salary Payment',
            'category' => 'Salary'
        ]);

        Transaction::create([
            'id' => (string) Str::uuid(),
            'accountId' => $account1->id,
            'type' => 'withdrawal',
            'amount' => 120.50,
            'date' => now()->format('Y-m-d'),
            'reason' => 'Whole Foods Grocery',
            'category' => 'Food & Dining'
        ]);

        Transaction::create([
            'id' => (string) Str::uuid(),
            'accountId' => $account1->id,
            'type' => 'withdrawal',
            'amount' => 85.00,
            'date' => now()->subDays(2)->format('Y-m-d'),
            'reason' => 'Electric & Water Utility',
            'category' => 'Utilities'
        ]);

        // Sample Budgets
        Budget::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'category' => 'Food & Dining',
            'amount' => 600.00
        ]);

        Budget::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'category' => 'Utilities',
            'amount' => 250.00
        ]);

        Budget::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'category' => 'Entertainment',
            'amount' => 300.00
        ]);

        // Sample Subscriptions
        Subscription::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'accountId' => $account1->id,
            'name' => 'Netflix Premium',
            'amount' => 19.99,
            'frequency' => 'monthly',
            'next_due_date' => now()->addDays(12)->format('Y-m-d'),
            'category' => 'Entertainment'
        ]);

        Subscription::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'accountId' => $account1->id,
            'name' => 'Spotify Family',
            'amount' => 16.99,
            'frequency' => 'monthly',
            'next_due_date' => now()->addDays(5)->format('Y-m-d'),
            'category' => 'Entertainment'
        ]);

        // Sample Loans
        Loan::create([
            'id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'type' => 'borrowed',
            'name' => 'Car Loan - Ally Bank',
            'amount' => 8500.00,
            'amount_paid' => 3200.00,
            'due_date' => now()->addMonths(18)->format('Y-m-d')
        ]);
    }
}
