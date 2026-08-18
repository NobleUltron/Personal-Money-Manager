import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../api';
import { Plus, Trash2, Calendar } from 'lucide-react';

export function SubscriptionsPage({ data, refreshData }: { data: any, refreshData: () => void }) {
  const { subscriptions, accounts } = data;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [nextDueDate, setNextDueDate] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');

  React.useEffect(() => {
    if (!accountId && accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('add_subscription', {
        method: 'POST',
        body: JSON.stringify({
          id: Date.now().toString(),
          accountId,
          name,
          amount: parseFloat(amount),
          frequency,
          next_due_date: nextDueDate,
        })
      });
      setIsModalOpen(false);
      refreshData();
      setName('');
      setAmount('');
      setNextDueDate('');
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this subscription?')) return;
    try {
      await apiFetch('delete_subscription', {
        method: 'POST',
        body: JSON.stringify({ id })
      });
      refreshData();
    } catch (err) {
      alert(err);
    }
  };

  const totalMonthly = subscriptions.reduce((acc: number, sub: any) => {
    let amt = parseFloat(sub.amount);
    if (sub.frequency === 'yearly') amt /= 12;
    if (sub.frequency === 'weekly') amt *= 4.33;
    return acc + amt;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold">Subscriptions</h1>
        <button onClick={() => setIsModalOpen(true)} disabled={accounts.length === 0} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 disabled:opacity-50">
          <Plus className="h-5 w-5" /> New Subscription
        </button>
      </div>

      <div className="glass-card p-6 rounded-2xl flex items-center gap-4 border border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/5">
        <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
          <Calendar className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <p className="text-sm text-slate-500 font-bold">Estimated Monthly Cost</p>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
            ${totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {subscriptions.length > 0 ? subscriptions.map((s: any) => (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={s.id} className="glass-card p-6 rounded-2xl relative group">
              <button onClick={() => handleDelete(s.id)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="h-5 w-5" />
              </button>
              <h3 className="text-xl font-bold mb-1 pr-8">{s.name}</h3>
              <p className="text-3xl font-extrabold mb-4">
                ${parseFloat(s.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                <span className="text-base text-slate-500 font-medium">/{s.frequency}</span>
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-bold">
                <Calendar className="h-4 w-4" /> Next Due: {s.next_due_date}
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-12 text-center text-slate-500 font-bold">No subscriptions tracked yet.</div>
          )}
      </div>

      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-start justify-center pt-12 px-4 pb-12 overflow-y-auto bg-slate-950/60 backdrop-blur-sm text-slate-900 dark:text-slate-100">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-md rounded-3xl p-8 shrink-0">
                <h2 className="text-2xl font-extrabold mb-6">Track Subscription</h2>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Account</label>
                    <select required value={accountId} onChange={(e) => setAccountId(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-bold">
                      {accounts.map((a: any) => <option key={a.id} value={a.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Service Name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500" placeholder="e.g. Netflix, Gym" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Amount ($)</label>
                    <input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Billing Frequency</label>
                    <select required value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500">
                      <option value="weekly" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Weekly</option>
                      <option value="monthly" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Monthly</option>
                      <option value="yearly" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Next Due Date</label>
                    <input type="date" required value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500" />
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
