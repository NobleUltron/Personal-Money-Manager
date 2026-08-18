import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardHeader, CardTitle } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { Modal } from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import {
    ArrowLeftRight,
    PlusCircle,
    MinusCircle,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownLeft,
    Trash2,
    Edit2,
    Calendar
} from 'lucide-react';

export default function Index({ transactions = [], accounts = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedType, setSelectedType] = useState('ALL');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [modalType, setModalType] = useState('deposit');
    const [editingTransaction, setEditingTransaction] = useState(null);

    const form = useForm({
        accountId: accounts[0]?.id || '',
        type: 'deposit',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        reason: '',
        category: 'Salary',
    });

    const categories = ['Salary', 'Food & Dining', 'Utilities', 'Entertainment', 'Savings', 'Investment', 'Other'];

    const filteredTransactions = transactions.filter((t) => {
        const matchesSearch = (t.reason || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (t.category || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
        const matchesType = selectedType === 'ALL' || t.type === selectedType;
        return matchesSearch && matchesCategory && matchesType;
    });

    const openAddModal = (type) => {
        setModalType(type);
        form.setData({
            accountId: accounts[0]?.id || '',
            type: type,
            amount: '',
            date: new Date().toISOString().split('T')[0],
            reason: '',
            category: type === 'deposit' ? 'Salary' : 'Food & Dining',
        });
        setIsAddModalOpen(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        form.post('/transactions', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                form.reset();
            }
        });
    };

    const submitUpdate = (e) => {
        e.preventDefault();
        form.put(`/transactions/${editingTransaction.id}`, {
            onSuccess: () => {
                setEditingTransaction(null);
                form.reset();
            }
        });
    };

    const handleDelete = (id) => {
        if (confirm('Delete this transaction?')) {
            form.delete(`/transactions/${id}`);
        }
    };

    return (
        <AuthenticatedLayout header="Transaction Ledger">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Transactions
                    </h1>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                        Track and audit all deposits and withdrawals
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => openAddModal('deposit')} className="gap-2 shadow-glow-indigo">
                        <PlusCircle className="w-4 h-4" /> Deposit
                    </Button>
                    <Button variant="secondary" onClick={() => openAddModal('withdrawal')} className="gap-2">
                        <MinusCircle className="w-4 h-4 text-rose-500" /> Expense
                    </Button>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <Card className="!p-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search description or category..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="ALL">All Types</option>
                            <option value="deposit">Deposits Only</option>
                            <option value="withdrawal">Withdrawals Only</option>
                        </select>

                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="ALL">All Categories</option>
                            {categories.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Transactions Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                                <th className="pb-3 px-2">Type</th>
                                <th className="pb-3 px-2">Account</th>
                                <th className="pb-3 px-2">Description</th>
                                <th className="pb-3 px-2">Category</th>
                                <th className="pb-3 px-2">Date</th>
                                <th className="pb-3 px-2 text-right">Amount</th>
                                <th className="pb-3 px-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                                        No transactions match your search filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="py-3.5 px-2">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                t.type === 'deposit'
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                            }`}>
                                                {t.type === 'deposit' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                                                {t.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-2 font-bold text-slate-700 dark:text-slate-300">
                                            {t.account?.name || 'Account'}
                                        </td>
                                        <td className="py-3.5 px-2 font-bold text-slate-900 dark:text-white">
                                            {t.reason || 'Transaction'}
                                        </td>
                                        <td className="py-3.5 px-2 text-slate-500 dark:text-slate-400">
                                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold">
                                                {t.category}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-2 text-slate-500 dark:text-slate-400">
                                            {t.date}
                                        </td>
                                        <td className={`py-3.5 px-2 text-right font-extrabold ${
                                            t.type === 'deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                                        }`}>
                                            {t.type === 'deposit' ? '+' : '-'}${Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="py-3.5 px-2 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handleDelete(t.id)} className="p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-400 hover:text-rose-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add Transaction Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={`Add ${modalType === 'deposit' ? 'Deposit' : 'Expense'}`}>
                <form onSubmit={submitCreate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Account</label>
                        <select
                            value={form.data.accountId}
                            onChange={(e) => form.setData('accountId', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name}</option>
                            ))}
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
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Reason / Description</label>
                        <input
                            type="text"
                            value={form.data.reason}
                            onChange={(e) => form.setData('reason', e.target.value)}
                            placeholder="e.g. Salary, Utilities, Grocery"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
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
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Transaction Date</label>
                        <div className="relative flex items-center">
                            <Calendar className="w-4 h-4 text-indigo-500 absolute left-3.5 pointer-events-none" />
                            <input
                                type="date"
                                value={form.data.date}
                                onChange={(e) => form.setData('date', e.target.value)}
                                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                className="w-full pl-10 pr-4 py-3 min-h-[46px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white dark:[color-scheme:dark] focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                            />
                        </div>
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant={modalType === 'deposit' ? 'primary' : 'danger'} disabled={form.processing}>
                            Save {modalType === 'deposit' ? 'Deposit' : 'Expense'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
