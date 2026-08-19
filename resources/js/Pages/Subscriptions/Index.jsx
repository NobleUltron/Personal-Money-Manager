import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { Modal } from '@/Components/Modal';
import { useForm, Head } from '@inertiajs/react';
import {
    CalendarCheck,
    PlusCircle,
    Calendar,
    RefreshCw,
    Trash2,
    Edit3,
    CreditCard,
    Building2,
    Sparkles,
    Tag
} from 'lucide-react';

const CATEGORIES = [
    'Streaming & Entertainment',
    'Software & SaaS',
    'Utilities & Bills',
    'Gym & Fitness',
    'News & Media',
    'Cloud & Hosting',
    'Insurance',
    'Telecom & Internet',
    'Other'
];

export default function Index({ subscriptions = [], accounts = [], monthlyTotal = 0, currencySymbol = 'UGX' }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState(null);

    // Create Form
    const createForm = useForm({
        accountId: accounts[0]?.id || '',
        name: '',
        amount: '',
        frequency: 'monthly',
        next_due_date: new Date().toISOString().split('T')[0],
        category: 'Streaming & Entertainment',
    });

    // Edit Form
    const editForm = useForm({
        accountId: '',
        name: '',
        amount: '',
        frequency: 'monthly',
        next_due_date: '',
        category: '',
    });

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post('/subscriptions', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                createForm.reset();
            }
        });
    };

    const submitUpdate = (e) => {
        e.preventDefault();
        editForm.put(`/subscriptions/${editingSubscription.id}`, {
            onSuccess: () => {
                setEditingSubscription(null);
                editForm.reset();
            }
        });
    };

    const openEdit = (sub) => {
        setEditingSubscription(sub);
        editForm.setData({
            accountId: sub.accountId || (accounts[0]?.id || ''),
            name: sub.name,
            amount: sub.amount,
            frequency: sub.frequency || 'monthly',
            next_due_date: sub.next_due_date || new Date().toISOString().split('T')[0],
            category: sub.category || 'Streaming & Entertainment',
        });
    };

    const handleDelete = (id) => {
        if (confirm('Cancel tracking for this recurring subscription?')) {
            createForm.delete(`/subscriptions/${id}`);
        }
    };

    return (
        <AuthenticatedLayout header="Recurring Subscriptions">
            <Head title="Subscriptions" />

            <div className="space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                            Subscriptions & Recurring Bills
                        </h1>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                            Track and manage monthly SaaS, entertainment, utility bills, and membership auto-renewals
                        </p>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shrink-0">
                        <PlusCircle className="w-4 h-4" /> Add Subscription
                    </Button>
                </div>

                {/* Total Monthly Projection Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white shadow-xl shadow-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-100 flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-300" /> Projected Monthly Expense
                        </span>
                        <h2 className="text-3xl font-extrabold mt-1">
                            {currencySymbol} {monthlyTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-sm font-semibold opacity-80">/ month</span>
                        </h2>
                        <p className="text-xs text-indigo-100/80 mt-1 font-medium">
                            Calculated across {subscriptions.length} active recurring subscription{subscriptions.length === 1 ? '' : 's'}
                        </p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                        <RefreshCw className="w-6 h-6 animate-spin-slow" />
                    </div>
                </div>

                {/* Subscriptions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subscriptions.length === 0 ? (
                        <Card className="col-span-full text-center py-14">
                            <CalendarCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No active subscriptions tracked</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                Add recurring bills like Netflix, Spotify, Gym memberships, or cloud hosting to track renewal dates.
                            </p>
                        </Card>
                    ) : (
                        subscriptions.map((sub) => (
                            <Card key={sub.id} className="relative flex flex-col justify-between">
                                <div>
                                    {/* Header Badge & Action Buttons */}
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                            {sub.frequency}
                                        </span>

                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => openEdit(sub)}
                                                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                                title="Edit Subscription"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(sub.id)}
                                                className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-400 hover:text-rose-600 transition-colors"
                                                title="Delete Subscription"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Name & Category */}
                                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
                                        {sub.name}
                                    </h3>
                                    
                                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                                        <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-[11px]">
                                            <Tag className="w-3 h-3 text-indigo-500" />
                                            {sub.category}
                                        </span>
                                        {sub.account && (
                                            <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-[11px]">
                                                <Building2 className="w-3 h-3 text-indigo-500" />
                                                {sub.account.name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Due Date & Cost */}
                                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Next Renewal</span>
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                                            <Calendar className="w-3.5 h-3.5 text-indigo-500" /> {sub.next_due_date}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cost</span>
                                        <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                                            {currencySymbol} {Number(sub.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>

                {/* Add Subscription Modal */}
                <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Subscription">
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                                Subscription Name
                            </label>
                            <input
                                type="text"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="e.g. Netflix / Spotify / Claude / ChatGPT"
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                            {createForm.errors.name && <p className="text-xs text-rose-500 mt-1 font-semibold">{createForm.errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                                    Amount ({currencySymbol})
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
                                {createForm.errors.amount && <p className="text-xs text-rose-500 mt-1 font-semibold">{createForm.errors.amount}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                                    Billing Frequency
                                </label>
                                <select
                                    value={createForm.data.frequency}
                                    onChange={(e) => createForm.setData('frequency', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                                    Category
                                </label>
                                <select
                                    value={createForm.data.category}
                                    onChange={(e) => createForm.setData('category', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                                    Next Due / Renewal Date
                                </label>
                                <input
                                    type="date"
                                    value={createForm.data.next_due_date}
                                    onChange={(e) => createForm.setData('next_due_date', e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                                Deduct From Account
                            </label>
                            <select
                                value={createForm.data.accountId}
                                onChange={(e) => createForm.setData('accountId', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            >
                                {accounts.map((acc) => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.name} ({acc.bank_name || acc.type})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-2 flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={createForm.processing}>Save Subscription</Button>
                        </div>
                    </form>
                </Modal>

                {/* Edit Subscription Modal */}
                <Modal isOpen={!!editingSubscription} onClose={() => setEditingSubscription(null)} title="Edit Subscription">
                    {editingSubscription && (
                        <form onSubmit={submitUpdate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                                    Subscription Name
                                </label>
                                <input
                                    type="text"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    required
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                                {editForm.errors.name && <p className="text-xs text-rose-500 mt-1 font-semibold">{editForm.errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                                        Amount ({currencySymbol})
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editForm.data.amount}
                                        onChange={(e) => editForm.setData('amount', e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                    {editForm.errors.amount && <p className="text-xs text-rose-500 mt-1 font-semibold">{editForm.errors.amount}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                                        Billing Frequency
                                    </label>
                                    <select
                                        value={editForm.data.frequency}
                                        onChange={(e) => editForm.setData('frequency', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                        <option value="weekly">Weekly</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                                        Category
                                    </label>
                                    <select
                                        value={editForm.data.category}
                                        onChange={(e) => editForm.setData('category', e.target.value)}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    >
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                                        Next Due / Renewal Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editForm.data.next_due_date}
                                        onChange={(e) => editForm.setData('next_due_date', e.target.value)}
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
                                    Deduct From Account
                                </label>
                                <select
                                    value={editForm.data.accountId}
                                    onChange={(e) => editForm.setData('accountId', e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                >
                                    {accounts.map((acc) => (
                                        <option key={acc.id} value={acc.id}>
                                            {acc.name} ({acc.bank_name || acc.type})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <Button type="button" variant="secondary" onClick={() => setEditingSubscription(null)}>Cancel</Button>
                                <Button type="submit" disabled={editForm.processing}>Update Subscription</Button>
                            </div>
                        </form>
                    )}
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
