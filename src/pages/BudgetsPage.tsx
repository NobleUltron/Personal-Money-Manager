import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../api';
import { Plus, Trash2 } from 'lucide-react';

export function BudgetsPage({ data, refreshData }: { data: any, refreshData: () => void }) {
  const { budgets, transactions } = data;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const currentMonth = new Date().getMonth();
  
  // Calculate spent amounts per category for the current month
  const categorySpent = transactions.reduce((acc: any, t: any) => {
    if (t.type === 'withdrawal' && new Date(t.date).getMonth() === currentMonth) {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
    }
    return acc;
  }, {});

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('add_budget', {
        method: 'POST',
        body: JSON.stringify({
          id: Date.now().toString(),
          category,
          amount: parseFloat(amount),
        })
      });
      setIsModalOpen(false);
      refreshData();
      setCategory('');
      setAmount('');
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this budget?')) return;
    try {
      await apiFetch('delete_budget', {
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold">Monthly Budgets</h1>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2">
          <Plus className="h-5 w-5" /> New Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {budgets.length > 0 ? budgets.map((b: any) => {
          const spent = categorySpent[b.category] || 0;
          const percentage = Math.min((spent / b.amount) * 100, 100);
          const isOver = spent > b.amount;

          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={b.id} className="glass-card p-6 rounded-2xl relative group">
              <button onClick={() => handleDelete(b.id)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="h-5 w-5" />
              </button>
              <h3 className="text-xl font-bold mb-1">{b.category}</h3>
              <p className="text-sm text-slate-500 font-medium mb-4">
                ${spent.toLocaleString(undefined, { minimumFractionDigits: 2 })} / ${b.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${isOver ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {isOver && <p className="text-xs text-red-500 mt-2 font-bold flex items-center gap-1">Over budget by ${(spent - b.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>}
            </motion.div>
          );
        }) : (
          <div className="col-span-full py-12 text-center text-slate-500 font-bold">No budgets set yet.</div>
        )}
      </div>

      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-start justify-center pt-12 px-4 pb-12 overflow-y-auto bg-slate-950/60 backdrop-blur-sm text-slate-900 dark:text-slate-100">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-md rounded-3xl p-8 shrink-0">
                <h2 className="text-2xl font-extrabold mb-6">Add Budget</h2>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Category</label>
                    <input type="text" required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500" placeholder="e.g. Groceries" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Monthly Limit ($)</label>
                    <input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500" />
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
