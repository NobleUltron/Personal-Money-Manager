import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardHeader, CardTitle } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { Modal } from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { HandCoins, PlusCircle, Calendar, Trash2, Edit3 } from 'lucide-react';

export default function Index({ loans = [], summary = {} }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingLoan, setEditingLoan] = useState(null);

    const form = useForm({
        type: 'borrowed',
        name: '',
        amount: '',
        amount_paid: '0',
        due_date: '',
    });

    const submitCreate = (e) => {
        e.preventDefault();
        form.post('/loans', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                form.reset();
            }
        });
    };

    const submitUpdate = (e) => {
        e.preventDefault();
        form.put(`/loans/${editingLoan.id}`, {
            onSuccess: () => {
                setEditingLoan(null);
                form.reset();
            }
        });
    };

    const handleDelete = (id) => {
        if (confirm('Delete loan record?')) {
            form.delete(`/loans/${id}`);
        }
    };

    const openEdit = (l) => {
        setEditingLoan(l);
        form.setData({
            type: l.type,
            name: l.name,
            amount: l.amount,
            amount_paid: l.amount_paid || '0',
            due_date: l.due_date || '',
        });
    };

    return (
        <AuthenticatedLayout header="Loans & Debts">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Borrowed & Lent Money
                    </h1>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                        Track outstanding debt repayments and money lent to friends or institutions
                    </p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                    <PlusCircle className="w-4 h-4" /> Add Loan Record
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="!bg-rose-500/10 border-rose-500/20">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Total Money Borrowed (Debt)</span>
                    <h2 className="text-3xl font-extrabold text-rose-700 dark:text-rose-300 mt-1">
                        ${(summary.borrowedRemaining || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </h2>
                    <p className="text-xs text-rose-600/80 font-semibold mt-1">Original principal: ${(summary.totalBorrowed || 0).toLocaleString()}</p>
                </Card>

                <Card className="!bg-emerald-500/10 border-emerald-500/20">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Total Money Lent (Owed to You)</span>
                    <h2 className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                        ${(summary.lentRemaining || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </h2>
                    <p className="text-xs text-emerald-600/80 font-semibold mt-1">Original lent amount: ${(summary.totalLent || 0).toLocaleString()}</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loans.length === 0 ? (
                    <Card className="col-span-full text-center py-12">
                        <HandCoins className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No active loans or debts</h3>
                        <p className="text-xs text-slate-400 mt-1">Record money borrowed or lent to keep track of partial repayments.</p>
                    </Card>
                ) : (
                    loans.map((loan) => {
                        const paid = Number(loan.amount_paid || 0);
                        const total = Number(loan.amount || 0);
                        const remaining = total - paid;
                        const percentage = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

                        return (
                            <Card key={loan.id} className="relative">
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                        loan.type === 'borrowed'
                                            ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                            : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                    }`}>
                                        {loan.type.toUpperCase()}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => openEdit(loan)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600">
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(loan.id)} className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-400 hover:text-rose-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{loan.name}</h3>

                                <div className="my-4 space-y-1.5">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-slate-400">Repayment Progress</span>
                                        <span className="text-slate-700 dark:text-slate-300 font-mono">{percentage}% ({paid.toLocaleString()} / {total.toLocaleString()})</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Due Date</span>
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                                            <Calendar className="w-3.5 h-3.5 text-indigo-500" /> {loan.due_date || 'Flexible'}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remaining</span>
                                        <span className="text-base font-extrabold text-slate-900 dark:text-white">
                                            ${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Create Loan Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Loan Record">
                <form onSubmit={submitCreate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Type</label>
                        <select
                            value={form.data.type}
                            onChange={(e) => form.setData('type', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            <option value="borrowed">I Borrowed Money (Debt)</option>
                            <option value="lent">I Lent Money (Owed to Me)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Title / Person / Bank</label>
                        <input
                            type="text"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            placeholder="e.g. Car Loan Ally Bank / Friend John"
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Total Loan Amount ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={form.data.amount}
                            onChange={(e) => form.setData('amount', e.target.value)}
                            placeholder="0.00"
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Amount Paid So Far ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={form.data.amount_paid}
                            onChange={(e) => form.setData('amount_paid', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Due Date</label>
                        <input
                            type="date"
                            value={form.data.due_date}
                            onChange={(e) => form.setData('due_date', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={form.processing}>Save Loan Record</Button>
                    </div>
                </form>
            </Modal>

            {/* Edit / Record Repayment Modal */}
            <Modal isOpen={!!editingLoan} onClose={() => setEditingLoan(null)} title="Update Loan & Record Repayment">
                <form onSubmit={submitUpdate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Title / Bank</label>
                        <input
                            type="text"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Total Loan Amount ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={form.data.amount}
                            onChange={(e) => form.setData('amount', e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Updated Total Paid ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={form.data.amount_paid}
                            onChange={(e) => form.setData('amount_paid', e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setEditingLoan(null)}>Cancel</Button>
                        <Button type="submit" disabled={form.processing}>Update Repayment</Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
