<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $accounts = Account::where('user_id', $user->id)->get();
        $subscriptions = Subscription::where('user_id', $user->id)
            ->with('account')
            ->orderBy('next_due_date', 'asc')
            ->get();

        $monthlyTotal = $subscriptions->reduce(function ($total, $sub) {
            if ($sub->frequency === 'yearly') return $total + ($sub->amount / 12);
            if ($sub->frequency === 'weekly') return $total + ($sub->amount * 4);
            return $total + $sub->amount;
        }, 0);

        return Inertia::render('Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'accounts' => $accounts,
            'monthlyTotal' => round($monthlyTotal, 2),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'accountId' => 'required|string|exists:accounts,id',
            'name' => 'required|string|max:100',
            'amount' => 'required|numeric|gt:0',
            'frequency' => 'required|in:monthly,yearly,weekly',
            'next_due_date' => 'required|date',
            'category' => 'required|string|max:50',
        ]);

        Subscription::create([
            'id' => (string) Str::uuid(),
            'user_id' => $request->user()->id,
            'accountId' => $validated['accountId'],
            'name' => $validated['name'],
            'amount' => $validated['amount'],
            'frequency' => $validated['frequency'],
            'next_due_date' => $validated['next_due_date'],
            'category' => $validated['category'],
        ]);

        return back()->with('success', 'Subscription created successfully!');
    }

    public function update(Request $request, $id)
    {
        $subscription = Subscription::where('user_id', $request->user()->id)->where('id', $id)->firstOrFail();

        $validated = $request->validate([
            'accountId' => 'required|string|exists:accounts,id',
            'name' => 'required|string|max:100',
            'amount' => 'required|numeric|gt:0',
            'frequency' => 'required|in:monthly,yearly,weekly',
            'next_due_date' => 'required|date',
            'category' => 'required|string|max:50',
        ]);

        $subscription->update($validated);

        return back()->with('success', 'Subscription updated successfully!');
    }

    public function destroy(Request $request, $id)
    {
        $subscription = Subscription::where('user_id', $request->user()->id)->where('id', $id)->firstOrFail();
        $subscription->delete();

        return back()->with('success', 'Subscription deleted successfully!');
    }
}
