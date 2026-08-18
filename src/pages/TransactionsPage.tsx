import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../api';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit2, Settings } from 'lucide-react';

export function TransactionsPage({ data, refreshData }: { data: any, refreshData: () => void }) {
  const { accounts, transactions } = data;
  const [selectedAccount, setSelectedAccount] = useState<string>(accounts[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!selectedAccount && accounts.length > 0) {
      setSelectedAccount(accounts[0].id);
    }
  }, [accounts, selectedAccount]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState('withdrawal');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Groceries');
  const [reason, setReason] = useState('');


  const openNewModal = () => {
    setEditingId(null);
    setType('withdrawal');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('Groceries');
    setReason('');
    setIsModalOpen(true);
  };

  const openEditModal = (t: any) => {
    setEditingId(t.id);
    setType(t.type);
    setAmount(t.amount.toString());
    setDate(t.date);
    setCategory(t.category);
    setReason(t.reason || '');
    setIsModalOpen(true);
  };

  const expenseCategories = ['Groceries', 'Dining Out', 'Rent / Mortgage', 'Utilities', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Subscriptions', 'Other Expense'];
  const incomeCategories = ['Salary', 'Freelance', 'Investments', 'Gifts', 'Refunds', 'Other Income'];
  
  const currentCategories = type === 'withdrawal' ? expenseCategories : incomeCategories;

  React.useEffect(() => {
    if (type === 'withdrawal' && !expenseCategories.includes(category)) {
      setCategory(expenseCategories[0]);
    } else if (type === 'deposit' && !incomeCategories.includes(category)) {
      setCategory(incomeCategories[0]);
    }
  }, [type]);

  const accountTransactions = transactions.filter((t: any) => t.accountId === selectedAccount);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = editingId ? 'update_transaction' : 'add_transaction';
      await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          id: editingId || Date.now().toString(),
          accountId: selectedAccount,
          type,
          amount: parseFloat(amount),
          date,
          category,
          reason
        })
      });
      setIsModalOpen(false);
      refreshData();
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await apiFetch('delete_transaction', {
        method: 'POST',
        body: JSON.stringify({ id })
      });
      refreshData();
    } catch (err) {
      alert(err);
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-extrabold">Transactions</h1>
        <button onClick={openNewModal} disabled={!selectedAccount} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 disabled:opacity-50">
          <Plus className="h-5 w-5" /> New Transaction
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
        <select 
          value={selectedAccount} 
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="flex-1 bg-transparent px-4 py-2 font-bold outline-none text-slate-800 dark:text-slate-200"
        >
          {accounts.length === 0 && <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">No Accounts</option>}
          {accounts.map((acc: any) => (
            <option key={acc.id} value={acc.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{acc.name}</option>
          ))}
        </select>
        <Link to="/accounts" className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
          <Settings className="h-4 w-4" /> Manage Accounts
        </Link>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {accountTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {accountTransactions.map((t: any) => (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex flex-col">
                  <span className="font-bold text-lg">{t.category}</span>
                  <span className="text-sm text-slate-500">{t.reason || 'No description'} • {t.date}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-extrabold text-lg ${t.type === 'deposit' ? 'text-emerald-500' : 'text-slate-800 dark:text-slate-200'}`}>
                    {t.type === 'deposit' ? '+' : '-'}${parseFloat(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <button onClick={() => openEditModal(t)} className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors">
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-slate-500 font-bold">No transactions found for this account.</div>
        )}
      </div>

      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-start justify-center pt-12 px-4 pb-12 overflow-y-auto bg-slate-950/60 backdrop-blur-sm text-slate-900 dark:text-slate-100">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-md rounded-3xl p-8 shrink-0">
                <h2 className="text-2xl font-extrabold mb-6">{editingId ? 'Edit Transaction' : 'Add Transaction'}</h2>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                    <button type="button" onClick={() => setType('withdrawal')} className={`flex-1 py-2 rounded-lg font-bold transition-all ${type === 'withdrawal' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}>Expense</button>
                    <button type="button" onClick={() => setType('deposit')} className={`flex-1 py-2 rounded-lg font-bold transition-all ${type === 'deposit' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}>Income</button>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Amount ($)</label>
                    <input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Category</label>
                    <select required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-bold text-slate-800 dark:text-slate-200">
                      {currentCategories.map(cat => (
                        <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Date</label>
                    <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Description (Optional)</label>
                    <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500" />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 py-3 font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">Save</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}


    </div>
  );
}
