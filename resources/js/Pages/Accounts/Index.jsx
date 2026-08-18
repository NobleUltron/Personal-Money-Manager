import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardHeader, CardTitle } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { Modal } from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { CreditCard, PlusCircle, Building2, Hash, Trash2, Edit2 } from 'lucide-react';

export default function Index({ accounts = [] }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);

    const form = useForm({
        name: '',
        bank_name: '',
        account_number: '',
        type: 'Checking',
        initial_balance: '0',
    });

    const submitCreate = (e) => {
        e.preventDefault();
        form.post('/accounts', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                form.reset();
            }
        });
    };

    const submitUpdate = (e) => {
        e.preventDefault();
        form.put(`/accounts/${editingAccount.id}`, {
            onSuccess: () => {
                setEditingAccount(null);
                form.reset();
            }
        });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this account? All associated transactions will be permanently deleted.')) {
            form.delete(`/accounts/${id}`);
        }
    };

    const openEdit = (acc) => {
        setEditingAccount(acc);
        form.setData({
            name: acc.name,
            bank_name: acc.bank_name || '',
            account_number: acc.account_number || '',
            type: acc.type,
            initial_balance: acc.initial_balance || '0',
        });
    };

    return (
        <AuthenticatedLayout header="Financial Accounts">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Your Accounts
                    </h1>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                        Manage your bank accounts, savings, and credit cards
                    </p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                    <PlusCircle className="w-4 h-4" /> Add Account
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.length === 0 ? (
                    <Card className="col-span-full text-center py-12">
                        <CreditCard className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No accounts created yet</h3>
                        <p className="text-xs text-slate-400 mt-1">Add your checking or savings account to start tracking transactions.</p>
                    </Card>
                ) : (
                    accounts.map((acc) => (
                        <Card key={acc.id} className="relative group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(acc)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(acc.id)} className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-400 hover:text-rose-600">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{acc.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{acc.type} • {acc.bank_name || 'Personal Account'}</p>
                            {acc.account_number && (
                                <p className="text-xs text-slate-400 font-mono mt-2 flex items-center gap-1">
                                    <Hash className="w-3 h-3" /> {acc.account_number}
                                </p>
                            )}
                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Balance</span>
                                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                                    ${(acc.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Create Account Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Account">
                <form onSubmit={submitCreate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Account Name</label>
                        <input
                            type="text"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            placeholder="e.g. Primary Checking"
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Bank Name</label>
                        <input
                            type="text"
                            value={form.data.bank_name}
                            onChange={(e) => form.setData('bank_name', e.target.value)}
                            placeholder="e.g. Chase / Bank of America"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Account Number / Tag</label>
                        <input
                            type="text"
                            value={form.data.account_number}
                            onChange={(e) => form.setData('account_number', e.target.value)}
                            placeholder="e.g. **** 4920"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Account Type</label>
                        <select
                            value={form.data.type}
                            onChange={(e) => form.setData('type', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            <option value="Checking">Checking</option>
                            <option value="Savings">Savings</option>
                            <option value="Investment">Investment</option>
                            <option value="Credit Card">Credit Card</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Initial Opening Balance ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={form.data.initial_balance}
                            onChange={(e) => form.setData('initial_balance', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={form.processing}>Create Account</Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Account Modal */}
            <Modal isOpen={!!editingAccount} onClose={() => setEditingAccount(null)} title="Edit Account">
                <form onSubmit={submitUpdate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Account Name</label>
                        <input
                            type="text"
                            value={form.data.name}
                            onChange={(e) => form.setData('name', e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Bank Name</label>
                        <input
                            type="text"
                            value={form.data.bank_name}
                            onChange={(e) => form.setData('bank_name', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Account Type</label>
                        <select
                            value={form.data.type}
                            onChange={(e) => form.setData('type', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            <option value="Checking">Checking</option>
                            <option value="Savings">Savings</option>
                            <option value="Investment">Investment</option>
                            <option value="Credit Card">Credit Card</option>
                        </select>
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setEditingAccount(null)}>Cancel</Button>
                        <Button type="submit" disabled={form.processing}>Save Changes</Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
