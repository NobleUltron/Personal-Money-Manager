import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { Modal } from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import {
    HandCoins,
    PlusCircle,
    Calendar,
    Trash2,
    Edit3,
    ArrowDownRight,
    ArrowUpRight,
    Wallet,
    CheckCircle2,
    Coins,
    AlertCircle,
    Building2
} from 'lucide-react';

export default function Index({ loans = [], accounts = [], summary = {}, currencySymbol = 'UGX' }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingLoan, setEditingLoan] = useState(null);
    const [repayingLoan, setRepayingLoan] = useState(null);

    // Create Form
    const createForm = useForm({
        type: 'borrowed',
        name: '',
        amount: '',
        amount_paid: '0',
        due_date: '',
        accountId: accounts.length > 0 ? accounts[0].id : '',
        sync_account: true,
    });

    // Edit Form
    const editForm = useForm({
        type: 'borrowed',
        name: '',
        amount: '',
        amount_paid: '0',
        due_date: '',
        accountId: '',
    });

    // Repayment Form
    const repayForm = useForm({
        repayment_amount: '',
        accountId: accounts.length > 0 ? accounts[0].id : '',
        sync_account: true,
    });

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post('/loans', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                createForm.reset();
            }
        });
    };

    const submitUpdate = (e) => {
        e.preventDefault();
        editForm.put(`/loans/${editingLoan.id}`, {
            onSuccess: () => {
                setEditingLoan(null);
                editForm.reset();
            }
        });
    };

    const submitRepayment = (e) => {
        e.preventDefault();
        repayForm.post(`/loans/${repayingLoan.id}/repay`, {
            onSuccess: () => {
                setRepayingLoan(null);
                repayForm.reset();
            }
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this loan record?')) {
            createForm.delete(`/loans/${id}`);
        }
    };

    const openEdit = (l) => {
        setEditingLoan(l);
        editForm.setData({
            type: l.type,
            name: l.name,
            amount: l.amount,
            amount_paid: l.amount_paid || '0',
            due_date: l.due_date || '',
            accountId: l.accountId || '',
        });
    };

    const openRepay = (l) => {
        setRepayingLoan(l);
        const remaining = Math.max(0, Number(l.amount) - Number(l.amount_paid || 0));
        repayForm.setData({
            repayment_amount: '',
            accountId: l.accountId || (accounts.length > 0 ? accounts[0].id : ''),
            sync_account: true,
        });
    };

    return (
        <AuthenticatedLayout header="Loans & Debts Management">
            <div className="space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Borrowed & Lent Money
                        </h1>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                            Track borrowed debts, money lent to others, and synchronize repayments directly with bank accounts
                        </p>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shrink-0">
                        <PlusCircle className="w-4 h-4" /> Add Loan Record
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Borrowed Summary */}
                    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/20 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                                <ArrowDownRight className="w-4 h-4" /> Total Borrowed (Outstanding Debt)
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 uppercase">
                                You Owe
                            </span>
                        </div>
                        <div className="mt-4">
                            <h2 className="text-3xl font-extrabold text-rose-700 dark:text-rose-300">
                                {currencySymbol} {(summary.borrowedRemaining || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h2>
                            <div className="flex items-center justify-between text-xs text-rose-600/80 dark:text-rose-400/80 font-semibold mt-2 pt-2 border-t border-rose-500/15">
                                <span>Total Principal: {currencySymbol} {(summary.totalBorrowed || 0).toLocaleString()}</span>
                                <span>Paid: {currencySymbol} {(summary.borrowedPaid || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Lent Summary */}
                    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                                <ArrowUpRight className="w-4 h-4" /> Total Lent (Owed to You)
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 uppercase">
                                Receivable
                            </span>
                        </div>
                        <div className="mt-4">
                            <h2 className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">
                                {currencySymbol} {(summary.lentRemaining || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </h2>
                            <div className="flex items-center justify-between text-xs text-emerald-600/80 dark:text-emerald-400/80 font-semibold mt-2 pt-2 border-t border-emerald-500/15">
                                <span>Total Lent: {currencySymbol} {(summary.totalLent || 0).toLocaleString()}</span>
                                <span>Recovered: {currencySymbol} {(summary.lentPaid || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loans.length === 0 ? (
                        <Card className="col-span-full text-center py-14">
                            <HandCoins className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No active loans or debt records</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                Record money borrowed or lent, synchronize with your accounts, and track partial repayments over time.
                            </p>
                        </Card>
                    ) : (
                        loans.map((loan) => {
                            const paid = Number(loan.amount_paid || 0);
                            const total = Number(loan.amount || 0);
                            const remaining = Math.max(0, total - paid);
                            const percentage = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;
                            const isFullyPaid = remaining <= 0;

                            return (
                                <Card key={loan.id} className="relative flex flex-col justify-between">
                                    <div>
                                        {/* Badge & Actions */}
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                                                loan.type === 'borrowed'
                                                    ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                                    : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                            }`}>
                                                {loan.type === 'borrowed' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                                {loan.type === 'borrowed' ? 'Borrowed Debt' : 'Money Lent'}
                                            </span>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => openEdit(loan)}
                                                    className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                                                    title="Edit Loan Details"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(loan.id)}
                                                    className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-400 hover:text-rose-600 transition-colors"
                                                    title="Delete Record"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Title & Linked Account */}
                                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
                                            {loan.name}
                                        </h3>

                                        {loan.account && (
                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                                                <span>Linked Account: <strong>{loan.account.name}</strong></span>
                                            </div>
                                        )}

                                        {/* Progress Bar */}
                                        <div className="my-4 space-y-1.5">
                                            <div className="flex justify-between text-xs font-semibold">
                                                <span className="text-slate-400">Repayment</span>
                                                <span className="text-slate-700 dark:text-slate-300 font-mono">
                                                    {percentage}% ({currencySymbol} {paid.toLocaleString()} / {total.toLocaleString()})
                                                </span>
                                            </div>
                                            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${
                                                        isFullyPaid
                                                            ? 'bg-emerald-500'
                                                            : loan.type === 'borrowed'
                                                            ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                                                            : 'bg-gradient-to-r from-emerald-500 to-indigo-500'
                                                    }`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom Card Details & Repayment Button */}
                                    <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Due Date</span>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                                                    <Calendar className="w-3.5 h-3.5 text-indigo-500" /> {loan.due_date || 'Flexible'}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remaining</span>
                                                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                                                    {currencySymbol} {remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>

                                        {!isFullyPaid ? (
                                            <button
                                                type="button"
                                                onClick={() => openRepay(loan)}
                                                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/60 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700/60 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-2 transition-all shadow-sm"
                                            >
                                                <Coins className="w-4 h-4" />
                                                {loan.type === 'borrowed' ? 'Record Repayment (Pay Debt)' : 'Record Received Payment'}
                                            </button>
                                        ) : (
                                            <div className="py-1.5 px-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold flex items-center justify-center gap-1.5">
                                                <CheckCircle2 className="w-4 h-4" /> Fully Settled
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>

                {/* Create Loan Modal */}
                <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Loan Record">
                    <form onSubmit={submitCreate} className="space-y-4">
                        {/* Type Switcher */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
                                Loan Type
                            </label>
                            <div className="grid grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => createForm.setData('type', 'borrowed')}
                                    className={`p-3 rounded-2xl border text-left transition-all ${
                                        createForm.data.type === 'borrowed'
                                            ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 font-extrabold shadow-sm'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5 text-xs font-bold">
                                        <ArrowDownRight className="w-4 h-4" /> Borrowed Money (Debt)
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">I took a loan (I owe someone)</div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => createForm.setData('type', 'lent')}
                                    className={`p-3 rounded-2xl border text-left transition-all ${
                                        createForm.data.type === 'lent'
                                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold shadow-sm'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                    }`}
                                >
                                    <div className="flex items-center gap-1.5 text-xs font-bold">
                                        <ArrowUpRight className="w-4 h-4" /> Lent Money (Receivable)
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">I gave a loan (Someone owes me)</div>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                                Title / Person / Bank Name
                            </label>
                            <input
                                type="text"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="e.g. Bank of Africa / John Doe / Stanbic"
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                                    Total Amount ({currencySymbol})
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={createForm.data.amount}
                                    onChange={(e) => createForm.setData('amount', e.target.value)}
                                    placeholder="0.00"
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                                    Due Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={createForm.data.due_date}
                                    onChange={(e) => createForm.setData('due_date', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Account Synchronization Section */}
                        {accounts.length > 0 && (
                            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 space-y-3">
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={createForm.data.sync_account}
                                        onChange={(e) => createForm.setData('sync_account', e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                                        {createForm.data.type === 'borrowed'
                                            ? 'Deposit loan funds into account (Adds +Income)'
                                            : 'Deduct loan funds from account (Records -Expense)'}
                                    </span>
                                </label>

                                {createForm.data.sync_account && (
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                            {createForm.data.type === 'borrowed' ? 'Select Account to Receive Funds' : 'Select Account to Disburse Funds'}
                                        </label>
                                        <select
                                            value={createForm.data.accountId}
                                            onChange={(e) => createForm.setData('accountId', e.target.value)}
                                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        >
                                            {accounts.map((acc) => (
                                                <option key={acc.id} value={acc.id}>
                                                    {acc.name} ({acc.bank_name || acc.type}) — {currencySymbol} {Number(acc.balance).toLocaleString()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-2 flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={createForm.processing}>Save Loan Record</Button>
                        </div>
                    </form>
                </Modal>

                {/* Record Repayment Modal */}
                <Modal
                    isOpen={!!repayingLoan}
                    onClose={() => setRepayingLoan(null)}
                    title={repayingLoan ? (repayingLoan.type === 'borrowed' ? `Pay Debt: ${repayingLoan.name}` : `Record Received Payment: ${repayingLoan.name}`) : ''}
                >
                    {repayingLoan && (
                        <form onSubmit={submitRepayment} className="space-y-4">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Remaining Outstanding</span>
                                    <span className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
                                        {currencySymbol} {Math.max(0, Number(repayingLoan.amount) - Number(repayingLoan.amount_paid || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => repayForm.setData('repayment_amount', Math.max(0, Number(repayingLoan.amount) - Number(repayingLoan.amount_paid || 0)))}
                                    className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-500/20 transition-all"
                                >
                                    Pay In Full
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                                    Repayment Amount ({currencySymbol})
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={repayForm.data.repayment_amount}
                                    onChange={(e) => repayForm.setData('repayment_amount', e.target.value)}
                                    placeholder="Enter amount to pay"
                                    max={Math.max(0, Number(repayingLoan.amount) - Number(repayingLoan.amount_paid || 0))}
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                                {repayForm.errors.repayment_amount && (
                                    <p className="text-xs font-semibold text-rose-500 mt-1">{repayForm.errors.repayment_amount}</p>
                                )}
                            </div>

                            {/* Account Synchronization Toggle */}
                            {accounts.length > 0 && (
                                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 space-y-3">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={repayForm.data.sync_account}
                                            onChange={(e) => repayForm.setData('sync_account', e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                            {repayingLoan.type === 'borrowed'
                                                ? 'Deduct repayment from account (Records -Expense)'
                                                : 'Deposit received payment into account (Adds +Income)'}
                                        </span>
                                    </label>

                                    {repayForm.data.sync_account && (
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                                                Select Account
                                            </label>
                                            <select
                                                value={repayForm.data.accountId}
                                                onChange={(e) => repayForm.setData('accountId', e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            >
                                                {accounts.map((acc) => (
                                                    <option key={acc.id} value={acc.id}>
                                                        {acc.name} ({acc.bank_name || acc.type}) — {currencySymbol} {Number(acc.balance).toLocaleString()}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="pt-2 flex justify-end gap-3">
                                <Button type="button" variant="secondary" onClick={() => setRepayingLoan(null)}>Cancel</Button>
                                <Button type="submit" disabled={repayForm.processing}>
                                    Confirm Repayment
                                </Button>
                            </div>
                        </form>
                    )}
                </Modal>

                {/* Edit Loan Modal */}
                <Modal isOpen={!!editingLoan} onClose={() => setEditingLoan(null)} title="Edit Loan Record">
                    <form onSubmit={submitUpdate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Title / Party Name</label>
                            <input
                                type="text"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Total Loan Amount ({currencySymbol})</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editForm.data.amount}
                                    onChange={(e) => editForm.setData('amount', e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Amount Paid So Far ({currencySymbol})</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editForm.data.amount_paid}
                                    onChange={(e) => editForm.setData('amount_paid', e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Due Date</label>
                            <input
                                type="date"
                                value={editForm.data.due_date}
                                onChange={(e) => editForm.setData('due_date', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div className="pt-2 flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={() => setEditingLoan(null)}>Cancel</Button>
                            <Button type="submit" disabled={editForm.processing}>Save Changes</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
