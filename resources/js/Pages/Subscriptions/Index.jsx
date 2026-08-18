import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardHeader, CardTitle } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { Modal } from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { CalendarCheck, PlusCircle, Calendar, RefreshCw, Trash2 } from 'lucide-react';

export default function Index({ subscriptions = [], accounts = [], monthlyTotal = 0 }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const form = useForm({
        accountId: accounts[0]?.id || '',
        name: '',
        amount: '',
        frequency: 'monthly',
        next_due_date: new Date().toISOString().split('T')[0],
        category: 'Entertainment',
    });

    const submitCreate = (e) => {
        e.preventDefault();
        form.post('/subscriptions', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                form.reset();
            }
        });
    };

    const handleDelete = (id) => {
        if (confirm('Cancel tracking for this subscription?')) {
            form.delete(`/subscriptions/${id}`);
        }
    };

    return (
        <AuthenticatedLayout header="Recurring Subscriptions">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Subscriptions & Recurring Bills
                    </h1>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                        Track monthly SaaS, utility, and membership auto-payments
                    </p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                    <PlusCircle className="w-4 h-4" /> Add Subscription
                </Button>
            </div>

            {/* Total Monthly Projection Banner */}
            <Card className="!bg-gradient-to-r !from-indigo-600 !via-purple-600 !to-violet-600 text-white !border-none shadow-xl shadow-indigo-500/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">Projected Monthly Total</span>
                        <h2 className="text-3xl font-extrabold mt-1">${monthlyTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} / mo</h2>
                        <p className="text-xs text-indigo-100/80 mt-1 font-medium">Across {subscriptions.length} active recurring subscriptions</p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                        <RefreshCw className="w-6 h-6" />
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptions.length === 0 ? (
                    <Card className="col-span-full text-center py-12">
                        <CalendarCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No subscriptions tracked</h3>
                        <p className="text-xs text-slate-400 mt-1">Add recurring bills like Netflix, Spotify, or Gym memberships.</p>
                    </Card>
                ) : (
                    subscriptions.map((sub) => (
                        <Card key={sub.id} className="relative">
                            <div className="flex items-center justify-between mb-3">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                    {sub.frequency}
                                </span>
                                <button onClick={() => handleDelete(sub.id)} className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-400 hover:text-rose-600">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{sub.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{sub.category} • {sub.account?.name || 'Account'}</p>

                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Next Due Date</span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                                        <Calendar className="w-3.5 h-3.5 text-indigo-500" /> {sub.next_due_date}
                                    </span>
                                </div>
                                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                                    ${Number(sub.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Add Subscription Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Subscription">
                <form onSubmit={submitCreate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Subscription Name</label>
                        <input
                            type="text"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            placeholder="e.g. Netflix / Spotify"
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Pay From Account</label>
                        <select
                            value={form.data.accountId}
                            onChange={(e) => form.setData('accountId', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Amount ($)</label>
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
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Billing Frequency</label>
                        <select
                            value={form.data.frequency}
                            onChange={(e) => form.setData('frequency', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Next Due Date</label>
                        <input
                            type="date"
                            value={form.data.next_due_date}
                            onChange={(e) => form.setData('next_due_date', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={form.processing}>Save Subscription</Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
