<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class GoalController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $goals = $user->goals()->orderBy('created_at', 'desc')->get();

        $totalTarget = $goals->sum('target_amount');
        $totalCurrent = $goals->sum('current_amount');
        $completedCount = $goals->where('is_completed', true)->count();
        $overallPercentage = $totalTarget > 0 ? min(100, round(($totalCurrent / $totalTarget) * 100, 1)) : 0;

        return Inertia::render('Goals/Index', [
            'goals' => $goals,
            'summary' => [
                'totalTarget' => $totalTarget,
                'totalCurrent' => $totalCurrent,
                'completedCount' => $completedCount,
                'overallPercentage' => $overallPercentage,
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:1',
            'current_amount' => 'nullable|numeric|min:0',
            'target_date' => 'nullable|date',
            'category' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:30',
            'notes' => 'nullable|string',
        ]);

        $request->user()->goals()->create([
            'name' => $validated['name'],
            'target_amount' => $validated['target_amount'],
            'current_amount' => $validated['current_amount'] ?? 0,
            'target_date' => $validated['target_date'] ?? null,
            'category' => $validated['category'] ?? 'General',
            'color' => $validated['color'] ?? '#6366f1',
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Savings Goal created successfully!');
    }

    public function update(Request $request, Goal $goal)
    {
        if ($goal->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:1',
            'current_amount' => 'required|numeric|min:0',
            'target_date' => 'nullable|date',
            'category' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:30',
            'notes' => 'nullable|string',
        ]);

        $goal->update($validated);

        return redirect()->back()->with('success', 'Savings Goal updated successfully!');
    }

    public function deposit(Request $request, Goal $goal)
    {
        if ($goal->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
        ]);

        $goal->current_amount += $validated['amount'];
        $goal->save();

        return redirect()->back()->with('success', "Added $" . number_format($validated['amount'], 2) . " to " . $goal->name . "!");
    }

    public function destroy(Goal $goal)
    {
        if ($goal->user_id !== Auth::id()) {
            abort(403);
        }

        $goal->delete();

        return redirect()->back()->with('success', 'Savings Goal removed!');
    }
}
