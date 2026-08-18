import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardHeader, CardTitle } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { Modal } from '@/Components/Modal';
import { useForm, usePage } from '@inertiajs/react';
import { formatMoney } from '@/Utils/formatCurrency';
import {
    Target,
    PlusCircle,
    PiggyBank,
    Trophy,
    CheckCircle2,
    Calendar,
    Sparkles,
    Trash2,
    Edit3,
    ArrowUpRight,
    TrendingUp,
    Coins,
    Check
} from 'lucide-react';

export default function GoalsIndex({ goals = [], summary = {} }) {
    const { auth } = usePage().props;
    const currencySymbol = auth?.user?.currencySymbol || 'UGX';

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState(null);

    const createForm = useForm({
        name: '',
        target_amount: '',
        current_amount: '0',
        target_date: '',
        category: 'Savings',
        color: '#6366f1',
        notes: '',
    });

    const depositForm = useForm({
        amount: '',
    });

    const editForm = useForm({
        name: '',
        target_amount: '',
        current_amount: '',
        target_date: '',
        category: '',
        color: '',
        notes: '',
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.post('/goals', {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            }
        });
    };

    const handleDepositSubmit = (e) => {
        e.preventDefault();
        if (!selectedGoal) return;
        depositForm.post(`/goals/${selectedGoal.id}/deposit`, {
            onSuccess: () => {
                setIsDepositModalOpen(false);
                depositForm.reset();
                setSelectedGoal(null);
            }
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        if (!selectedGoal) return;
        editForm.put(`/goals/${selectedGoal.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setSelectedGoal(null);
            }
        });
    };

    const handleDelete = (goal) => {
        if (confirm(`Are you sure you want to delete "${goal.name}"?`)) {
            useForm().delete(`/goals/${goal.id}`);
        }
    };

    const openDepositModal = (goal) => {
        setSelectedGoal(goal);
        depositForm.setData('amount', '');
        setIsDepositModalOpen(true);
    };

    const openEditModal = (goal) => {
        setSelectedGoal(goal);
        editForm.setData({
            name: goal.name,
            target_amount: goal.target_amount,
            current_amount: goal.current_amount,
            target_date: goal.target_date || '',
            category: goal.category || 'Savings',
            color: goal.color || '#6366f1',
            notes: goal.notes || '',
        });
        setIsEditModalOpen(true);
    };

    const categories = ['Savings', 'Emergency Fund', 'Investment', 'Real Estate', 'Vehicle', 'Vacation', 'Education', 'Gadgets', 'Other'];
    const colors = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#14b8a6', '#64748b'];

    const getMilestoneBadge = (percentage) => {
        if (percentage >= 100) {
            return { label: 'Goal Completed!', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', icon: Trophy };
        } else if (percentage >= 75) {
            return { label: 'Final Stretch', bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20', icon: Sparkles };
        } else if (percentage >= 50) {
            return { label: 'Halfway There', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', icon: TrendingUp };
        } else if (percentage >= 25) {
            return { label: 'Good Progress', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: Coins };
        }
        return { label: 'Just Started', bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', icon: Target };
    };

    return (
        <AuthenticatedLayout header="Savings Goals & Wealth Milestones">
            {/* Header Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Savings Goals & Milestones
                    </h1>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                        Track financial targets, achieve wealth milestones, and log progress
                    </p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 shadow-glow-indigo">
                    <PlusCircle className="w-4 h-4" /> Add Savings Goal
                </Button>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Total Goals Target
                        </span>
                        <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <Target className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {formatMoney(summary.totalTarget || 0, currencySymbol)}
                        </h2>
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 block">
                            Across {goals.length} active goals
                        </span>
                    </div>
                </Card>

                <Card className="relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Total Money Saved
                        </span>
                        <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <PiggyBank className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {formatMoney(summary.totalCurrent || 0, currencySymbol)}
                        </h2>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">
                            {summary.overallPercentage || 0}% overall completion
                        </span>
                    </div>
                </Card>

                <Card className="relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Completed Goals
                        </span>
                        <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                            <Trophy className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {summary.completedCount || 0} / {goals.length}
                        </h2>
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1 block">
                            Milestones achieved
                        </span>
                    </div>
                </Card>

                <Card className="relative overflow-hidden">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Remaining Target
                        </span>
                        <div className="h-10 w-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                            <Coins className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {formatMoney(Math.max(0, (summary.totalTarget || 0) - (summary.totalCurrent || 0)), currencySymbol)}
                        </h2>
                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-1 block">
                            Left to reach targets
                        </span>
                    </div>
                </Card>
            </div>

            {/* Goals Grid */}
            <div className="space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" /> Active Wealth Milestones
                </h3>

                {goals.length === 0 ? (
                    <Card className="p-12 text-center flex flex-col items-center justify-center">
                        <div className="h-16 w-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                            <Target className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Savings Goals Set Yet</h3>
                        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
                            Start planning for your future by adding a savings goal like an Emergency Fund, Car Deposit, or Vacation!
                        </p>
                        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
                            <PlusCircle className="w-4 h-4" /> Create Your First Goal
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {goals.map((goal) => {
                            const badge = getMilestoneBadge(goal.percentage);
                            const BadgeIcon = badge.icon;
                            const remaining = Math.max(0, goal.target_amount - goal.current_amount);
                            const radius = 36;
                            const circumference = 2 * Math.PI * radius;
                            const strokeDashoffset = circumference - (goal.percentage / 100) * circumference;

                            return (
                                <Card key={goal.id} className="relative overflow-hidden group flex flex-col justify-between">
                                    {/* Top accent bar */}
                                    <div
                                        className="absolute top-0 left-0 right-0 h-1.5"
                                        style={{ backgroundColor: goal.color || '#6366f1' }}
                                    />

                                    <div>
                                        {/* Goal Header */}
                                        <div className="flex items-start justify-between gap-3 pt-2">
                                            <div>
                                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                                    {goal.category}
                                                </span>
                                                <h4 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
                                                    {goal.name}
                                                </h4>
                                            </div>

                                            {/* Circular Progress Ring */}
                                            <div className="relative flex items-center justify-center shrink-0">
                                                <svg className="w-20 h-20 transform -rotate-90">
                                                    <circle
                                                        cx="40"
                                                        cy="40"
                                                        r={radius}
                                                        stroke="currentColor"
                                                        strokeWidth="7"
                                                        className="text-slate-100 dark:text-slate-800"
                                                        fill="transparent"
                                                    />
                                                    <circle
                                                        cx="40"
                                                        cy="40"
                                                        r={radius}
                                                        stroke={goal.color || '#6366f1'}
                                                        strokeWidth="7"
                                                        strokeDasharray={circumference}
                                                        strokeDashoffset={strokeDashoffset}
                                                        strokeLinecap="round"
                                                        fill="transparent"
                                                        className="transition-all duration-700 ease-out"
                                                    />
                                                </svg>
                                                <span className="absolute text-xs font-extrabold text-slate-900 dark:text-white">
                                                    {goal.percentage}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* Milestone Badge */}
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${badge.bg}`}>
                                                <BadgeIcon className="w-3.5 h-3.5" />
                                                {badge.label}
                                            </span>
                                            {goal.target_date && (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                                                    <Calendar className="w-3 h-3 text-slate-400" />
                                                    {goal.target_date}
                                                </span>
                                            )}
                                        </div>

                                        {/* Amount Progress Details */}
                                        <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-semibold text-slate-500">Saved:</span>
                                                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                                                    {formatMoney(goal.current_amount, currencySymbol)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-semibold text-slate-500">Target:</span>
                                                <span className="font-bold text-slate-900 dark:text-white">
                                                    {formatMoney(goal.target_amount, currencySymbol)}
                                                </span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${goal.percentage}%`, backgroundColor: goal.color || '#6366f1' }}
                                                />
                                            </div>
                                            <div className="text-[11px] text-right font-medium text-slate-400">
                                                {formatMoney(remaining, currencySymbol)} remaining
                                            </div>
                                        </div>

                                        {goal.notes && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic line-clamp-2">
                                                "{goal.notes}"
                                            </p>
                                        )}
                                    </div>

                                    {/* Card Footer Actions */}
                                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                                        <Button
                                            onClick={() => openDepositModal(goal)}
                                            size="sm"
                                            className="flex-1 gap-1.5 shadow-sm"
                                        >
                                            <PlusCircle className="w-3.5 h-3.5" /> Add Money
                                        </Button>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => openEditModal(goal)}
                                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                title="Edit Goal"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(goal)}
                                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                                title="Delete Goal"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal: Create Goal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Savings Goal">
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                            Goal Name *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Emergency Fund, New Car, Vacation"
                            value={createForm.data.name}
                            onChange={(e) => createForm.setData('name', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                Target Amount ($) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                min="1"
                                placeholder="10000"
                                value={createForm.data.target_amount}
                                onChange={(e) => createForm.setData('target_amount', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                Initial Saved ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={createForm.data.current_amount}
                                onChange={(e) => createForm.setData('current_amount', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                Category
                            </label>
                            <select
                                value={createForm.data.category}
                                onChange={(e) => createForm.setData('category', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                Target Date
                            </label>
                            <input
                                type="date"
                                value={createForm.data.target_date}
                                onChange={(e) => createForm.setData('target_date', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                            Theme Accent Color
                        </label>
                        <div className="flex items-center gap-2">
                            {colors.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => createForm.setData('color', c)}
                                    className={`h-8 w-8 rounded-xl transition-all ${createForm.data.color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105'}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                            Notes / Motivation
                        </label>
                        <textarea
                            rows="2"
                            placeholder="Why is this goal important to you?"
                            value={createForm.data.notes}
                            onChange={(e) => createForm.setData('notes', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                        <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={createForm.processing}>
                            Create Goal
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Quick Deposit / Add Contribution */}
            <Modal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} title={`Add Money to "${selectedGoal?.name}"`}>
                <form onSubmit={handleDepositSubmit} className="space-y-4">
                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold">Current Saved Amount</p>
                            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                                ${selectedGoal?.current_amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })} / ${selectedGoal?.target_amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                        <span className="text-sm font-extrabold px-3 py-1 bg-indigo-600 text-white rounded-xl">
                            {selectedGoal?.percentage}%
                        </span>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                            Contribution Amount ($) *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            min="0.01"
                            placeholder="100.00"
                            value={depositForm.data.amount}
                            onChange={(e) => depositForm.setData('amount', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-base font-extrabold text-indigo-600 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Quick Amount Preset Chips */}
                    <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 block">Quick Add Presets</span>
                        <div className="flex flex-wrap gap-2">
                            {[50, 100, 250, 500, 1000].map((preset) => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => depositForm.setData('amount', preset.toString())}
                                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 font-bold text-xs transition-colors"
                                >
                                    +${preset}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                        <Button type="button" variant="secondary" onClick={() => setIsDepositModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={depositForm.processing}>
                            Add Contribution
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Edit Goal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Goal: ${selectedGoal?.name}`}>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                            Goal Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={editForm.data.name}
                            onChange={(e) => editForm.setData('name', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                Target Amount ($) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                min="1"
                                value={editForm.data.target_amount}
                                onChange={(e) => editForm.setData('target_amount', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                Current Saved ($) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                min="0"
                                value={editForm.data.current_amount}
                                onChange={(e) => editForm.setData('current_amount', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                Category
                            </label>
                            <select
                                value={editForm.data.category}
                                onChange={(e) => editForm.setData('category', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                                Target Date
                            </label>
                            <input
                                type="date"
                                value={editForm.data.target_date}
                                onChange={(e) => editForm.setData('target_date', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                        <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={editForm.processing}>
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
