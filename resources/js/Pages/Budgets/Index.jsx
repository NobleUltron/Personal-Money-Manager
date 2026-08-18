import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardHeader, CardTitle } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { Modal } from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { PieChart, PlusCircle, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';

export default function Index({ budgets = [] }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const form = useForm({
        category: 'Food & Dining',
        amount: '',
    });

    const categories = ['Food & Dining', 'Utilities', 'Entertainment', 'Shopping', 'Travel', 'Health', 'Other'];

    const submitCreate = (e) => {
        e.preventDefault();
        form.post('/budgets', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                form.reset();
            }
        });
    };

    const handleDelete = (id) => {
        if (confirm('Remove budget limit for this category?')) {
            form.delete(`/budgets/${id}`);
        }
    };

    return (
        <AuthenticatedLayout header="Category Budgets">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Monthly Budgets
                    </h1>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                        Control category spending and receive over-budget alerts
                    </p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                    <PlusCircle className="w-4 h-4" /> Set Budget Limit
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.length === 0 ? (
                    <Card className="col-span-full text-center py-12">
                        <PieChart className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No monthly budgets set</h3>
                        <p className="text-xs text-slate-400 mt-1">Set monthly budget limits for categories like Dining, Utilities, and Entertainment.</p>
                    </Card>
                ) : (
                    budgets.map((b) => {
                        const isOver = b.spent > b.amount;
                        const isClose = b.percentage >= 85 && !isOver;

                        return (
                            <Card key={b.id} className="relative">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{b.category}</h3>
                                    <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-400 hover:text-rose-600">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-baseline justify-between mb-2">
                                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                                        ${b.spent.toLocaleString()}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        Limit: ${b.amount.toLocaleString()}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${
                                            isOver
                                                ? 'bg-rose-500'
                                                : isClose
                                                ? 'bg-amber-500'
                                                : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                        }`}
                                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                                    ></div>
                                </div>

                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className={isOver ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500'}>
                                        {isOver ? `Over by $${(b.spent - b.amount).toLocaleString()}` : `$${b.remaining.toLocaleString()} remaining`}
                                    </span>
                                    <span className="text-slate-400 font-mono">{b.percentage}% spent</span>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Set Budget Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Set Category Budget">
                <form onSubmit={submitCreate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Category</label>
                        <select
                            value={form.data.category}
                            onChange={(e) => form.setData('category', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Monthly Budget Limit ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={form.data.amount}
                            onChange={(e) => form.setData('amount', e.target.value)}
                            placeholder="e.g. 500.00"
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={form.processing}>Save Budget</Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
