import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardHeader, CardTitle } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { Modal } from '@/Components/Modal';
import { useForm, Link, usePage } from '@inertiajs/react';
import { formatMoney } from '@/Utils/formatCurrency';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    PiggyBank,
    PlusCircle,
    MinusCircle,
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    ChevronRight,
    Target,
    Sparkles,
    PieChart as PieChartIcon
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard({
    accounts = [],
    recentTransactions = [],
    totalBalance = 0,
    totalDeposits = 0,
    totalWithdrawals = 0,
    netSavings = 0,
    budgets = [],
    subscriptions = [],
    loans = [],
    goals = []
}) {
    const { auth } = usePage().props;
    const currencySymbol = auth?.user?.currencySymbol || 'UGX';

    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);

    const transactionForm = useForm({
        accountId: accounts[0]?.id || '',
        type: 'deposit',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        reason: '',
        category: 'Salary',
    });

    const submitTransaction = (e, type) => {
        e.preventDefault();
        transactionForm.setData('type', type);
        transactionForm.post('/transactions', {
            onSuccess: () => {
                setIsDepositModalOpen(false);
                setIsWithdrawalModalOpen(false);
                transactionForm.reset();
            }
        });
    };

    const categories = ['Salary', 'Food & Dining', 'Utilities', 'Entertainment', 'Savings', 'Investment', 'Other'];
    const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6'];

    // Format chart data
    const chartData = [
        { name: 'Deposits', amount: totalDeposits },
        { name: 'Withdrawals', amount: totalWithdrawals },
    ];

    return (
        <AuthenticatedLayout header="Financial Overview">
            {/* Top SaaS Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Welcome back!
                    </h1>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                        Here is your wealth growth & financial summary
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => setIsDepositModalOpen(true)} className="gap-2 shadow-glow-indigo">
                        <PlusCircle className="w-4 h-4" /> Add Deposit
                    </Button>
                    <Button variant="secondary" onClick={() => setIsWithdrawalModalOpen(true)} className="gap-2">
                        <MinusCircle className="w-4 h-4 text-rose-500" /> Withdrawal
                    </Button>
                </div>
            </div>

            {/* Metrics Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Total Balance
                        </span>
                        <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {formatMoney(totalBalance, currencySymbol)}
                        </h2>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3.5 h-3.5" /> Across {accounts.length} Accounts
                        </span>
                    </div>
                </Card>

                <Card className="relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Total Income
                        </span>
                        <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {formatMoney(totalDeposits, currencySymbol)}
                        </h2>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block">
                            Total lifetime deposits
                        </span>
                    </div>
                </Card>

                <Card className="relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Total Expenses
                        </span>
                        <div className="h-10 w-10 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                            <ArrowDownLeft className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {formatMoney(totalWithdrawals, currencySymbol)}
                        </h2>
                        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1 block">
                            Total lifetime spending
                        </span>
                    </div>
                </Card>

                <Card className="relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Net Savings
                        </span>
                        <div className="h-10 w-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                            <PiggyBank className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {formatMoney(netSavings, currencySymbol)}
                        </h2>
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1 block">
                            Net income retained
                        </span>
                    </div>
                </Card>
            </div>

            {/* Charts & Breakdown Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Account Balances List */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-indigo-600" /> Accounts
                        </CardTitle>
                        <Link href="/accounts" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </CardHeader>
                    <div className="space-y-4">
                        {accounts.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-6">No accounts registered yet.</p>
                        ) : (
                            accounts.map((acc) => (
                                <div key={acc.id} className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{acc.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{acc.type} • {acc.bank_name || 'Bank'}</p>
                                    </div>
                                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                                        {formatMoney(acc.balance || 0, currencySymbol)}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Cash Flow Distribution Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-indigo-600" /> Income vs Expenses Ratio
                        </CardTitle>
                    </CardHeader>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="amount"
                                >
                                    <Cell fill="#10b981" />
                                    <Cell fill="#f43f5e" />
                                </Pie>
                                <Tooltip formatter={(val) => formatMoney(val, currencySymbol)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-2 text-xs font-bold">
                        <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Income ({formatMoney(totalDeposits, currencySymbol)})
                        </span>
                        <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <span className="w-3 h-3 rounded-full bg-rose-500"></span> Expenses ({formatMoney(totalWithdrawals, currencySymbol)})
                        </span>
                    </div>
                </Card>
            </div>

            {/* Savings Goals & Wealth Milestones Widget */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-600" /> Savings Goals & Wealth Milestones
                    </CardTitle>
                    <Link href="/goals" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                        Manage Goals <ChevronRight className="w-4 h-4" />
                    </Link>
                </CardHeader>
                <div className="space-y-4">
                    {goals.length === 0 ? (
                        <div className="p-6 text-center">
                            <p className="text-xs text-slate-500 font-medium">No savings goals created yet.</p>
                            <Link href="/goals" className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs">
                                <PlusCircle className="w-3.5 h-3.5" /> Create Your First Goal
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {goals.slice(0, 3).map((goal) => (
                                <div key={goal.id} className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                                            {goal.name}
                                        </span>
                                        <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                                            {goal.percentage}%
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${goal.percentage}%`, backgroundColor: goal.color || '#6366f1' }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                                        <span>{formatMoney(goal.current_amount || 0, currencySymbol)} saved</span>
                                        <span>Target: {formatMoney(goal.target_amount || 0, currencySymbol)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            {/* Recent Activity Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-600" /> Recent Transactions
                    </CardTitle>
                    <Link href="/transactions" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                        See All <ChevronRight className="w-4 h-4" />
                    </Link>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                                <th className="pb-3 px-2">Type</th>
                                <th className="pb-3 px-2">Description</th>
                                <th className="pb-3 px-2">Category</th>
                                <th className="pb-3 px-2">Date</th>
                                <th className="pb-3 px-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-semibold">
                            {recentTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-6 text-center text-slate-400 font-medium">
                                        No recent transactions available.
                                    </td>
                                </tr>
                            ) : (
                                recentTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="py-3.5 px-2">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                t.type === 'deposit'
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                            }`}>
                                                {t.type === 'deposit' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                                                {t.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-2 font-bold text-slate-900 dark:text-white">
                                            {t.reason || 'General Transaction'}
                                        </td>
                                        <td className="py-3.5 px-2 text-slate-500 dark:text-slate-400">
                                            {t.category}
                                        </td>
                                        <td className="py-3.5 px-2 text-slate-500 dark:text-slate-400">
                                            {t.date}
                                        </td>
                                        <td className={`py-3.5 px-2 text-right font-extrabold ${
                                            t.type === 'deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                                        }`}>
                                            {t.type === 'deposit' ? '+' : '-'}{formatMoney(t.amount, currencySymbol)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Quick Action Deposit Modal */}
            <Modal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} title="Record New Deposit">
                <form onSubmit={(e) => submitTransaction(e, 'deposit')} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Account</label>
                        <select
                            value={transactionForm.data.accountId}
                            onChange={(e) => transactionForm.setData('accountId', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance?.toLocaleString()})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Amount ({currencySymbol})</label>
                        <input
                            type="number"
                            step="0.01"
                            value={transactionForm.data.amount}
                            onChange={(e) => transactionForm.setData('amount', e.target.value)}
                            placeholder="0.00"
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Reason / Description</label>
                        <input
                            type="text"
                            value={transactionForm.data.reason}
                            onChange={(e) => transactionForm.setData('reason', e.target.value)}
                            placeholder="e.g. Salary / Client Payment"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Category</label>
                        <select
                            value={transactionForm.data.category}
                            onChange={(e) => transactionForm.setData('category', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Transaction Date</label>
                        <div className="relative flex items-center">
                            <Calendar className="w-4 h-4 text-indigo-500 absolute left-3.5 pointer-events-none" />
                            <input
                                type="date"
                                value={transactionForm.data.date}
                                onChange={(e) => transactionForm.setData('date', e.target.value)}
                                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                className="w-full pl-10 pr-4 py-3 min-h-[46px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white dark:[color-scheme:dark] focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                            />
                        </div>
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setIsDepositModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={transactionForm.processing}>Save Deposit</Button>
                    </div>
                </form>
            </Modal>

            {/* Quick Action Withdrawal Modal */}
            <Modal isOpen={isWithdrawalModalOpen} onClose={() => setIsWithdrawalModalOpen(false)} title="Record New Expense">
                <form onSubmit={(e) => submitTransaction(e, 'withdrawal')} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Account</label>
                        <select
                            value={transactionForm.data.accountId}
                            onChange={(e) => transactionForm.setData('accountId', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name} ({formatMoney(acc.balance, currencySymbol)})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Amount ({currencySymbol})</label>
                        <input
                            type="number"
                            step="0.01"
                            value={transactionForm.data.amount}
                            onChange={(e) => transactionForm.setData('amount', e.target.value)}
                            placeholder="0.00"
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Reason / Description</label>
                        <input
                            type="text"
                            value={transactionForm.data.reason}
                            onChange={(e) => transactionForm.setData('reason', e.target.value)}
                            placeholder="e.g. Groceries / Electricity Bill"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Category</label>
                        <select
                            value={transactionForm.data.category}
                            onChange={(e) => transactionForm.setData('category', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Transaction Date</label>
                        <div className="relative flex items-center">
                            <Calendar className="w-4 h-4 text-indigo-500 absolute left-3.5 pointer-events-none" />
                            <input
                                type="date"
                                value={transactionForm.data.date}
                                onChange={(e) => transactionForm.setData('date', e.target.value)}
                                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                className="w-full pl-10 pr-4 py-3 min-h-[46px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white dark:[color-scheme:dark] focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                            />
                        </div>
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setIsWithdrawalModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="danger" disabled={transactionForm.processing}>Save Withdrawal</Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
