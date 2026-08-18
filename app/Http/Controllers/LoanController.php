<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $loans = Loan::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $totalBorrowed = $loans->where('type', 'borrowed')->sum('amount');
        $borrowedPaid = $loans->where('type', 'borrowed')->sum('amount_paid');
        
        $totalLent = $loans->where('type', 'lent')->sum('amount');
        $lentPaid = $loans->where('type', 'lent')->sum('amount_paid');

        return Inertia::render('Loans/Index', [
            'loans' => $loans,
            'summary' => [
                'totalBorrowed' => (float)$totalBorrowed,
                'borrowedRemaining' => (float)($totalBorrowed - $borrowedPaid),
                'totalLent' => (float)$totalLent,
                'lentRemaining' => (float)($totalLent - $lentPaid),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:borrowed,lent',
            'name' => 'required|string|max:255',
            'amount' => 'required|numeric|gt:0',
            'amount_paid' => 'nullable|numeric|min:0',
            'due_date' => 'nullable|date',
        ]);

        Loan::create([
            'id' => (string) Str::uuid(),
            'user_id' => $request->user()->id,
            'type' => $validated['type'],
            'name' => $validated['name'],
            'amount' => $validated['amount'],
            'amount_paid' => $validated['amount_paid'] ?? 0,
            'due_date' => $validated['due_date'] ?? null,
        ]);

        return back()->with('success', 'Loan record added successfully!');
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
