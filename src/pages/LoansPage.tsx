import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../api';
import { Plus, Trash2, Edit2, HandCoins, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';

export function LoansPage({ data, refreshData }: { data: any, refreshData: () => void }) {
  const { loans } = data;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState('borrowed'); // 'borrowed' (I owe money) or 'lent' (Money owed to me)
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Payment State
  const [paymentAmount, setPaymentAmount] = useState('');
  const [activeLoan, setActiveLoan] = useState<any>(null);

  const totalBorrowed = loans?.filter((l: any) => l.type === 'borrowed').reduce((acc: number, l: any) => acc + (l.amount - l.amount_paid), 0) || 0;
  const totalLent = loans?.filter((l: any) => l.type === 'lent').reduce((acc: number, l: any) => acc + (l.amount - l.amount_paid), 0) || 0;

  const openNewModal = () => {
    setEditingId(null);
    setType('borrowed');
    setName('');
    setAmount('');
    setDueDate('');
    setIsModalOpen(true);
  };

  const openEditModal = (loan: any) => {
    setEditingId(loan.id);
    setType(loan.type);
    setName(loan.name);
    setAmount(loan.amount.toString());
    setDueDate(loan.due_date || '');
    setIsModalOpen(true);
  };

  const openPaymentModal = (loan: any) => {
    setActiveLoan(loan);
    setPaymentAmount('');
    setIsPaymentModalOpen(true);
  };

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = editingId ? 'update_loan' : 'add_loan';
      const payload: any = {
        id: editingId || Date.now().toString(),
        type,
        name,
        amount: parseFloat(amount),
        due_date: dueDate || null
      };

      if (editingId) {
        // preserve existing amount_paid on edit
        const existingLoan = loans.find((l: any) => l.id === editingId);
        payload.amount_paid = existingLoan ? existingLoan.amount_paid : 0;
      } else {
        payload.amount_paid = 0;
      }

      await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setIsModalOpen(false);
      refreshData();
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeLoan) return;
    setLoading(true);
    try {
      const newAmountPaid = activeLoan.amount_paid + parseFloat(paymentAmount);
      
      await apiFetch('update_loan', {
        method: 'POST',
        body: JSON.stringify({
          ...activeLoan,
          amount_paid: newAmountPaid
        })
      });
      setIsPaymentModalOpen(false);
      refreshData();
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this loan?')) return;
    try {
      await apiFetch('delete_loan', {
        method: 'POST',
        body: JSON.stringify({ id })
      });
      refreshData();
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <HandCoins className="h-8 w-8 text-indigo-500" />
            Loans & Debts
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Track money you owe and money owed to you</p>
        </div>
        <button onClick={openNewModal} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2">
          <Plus className="h-5 w-5" /> New Loan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
            <ArrowDownRight className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Borrowed (I Owe)</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">${totalBorrowed.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
            <ArrowUpRight className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Lent (Owed to Me)</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">${totalLent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-8">
        {loans && loans.length > 0 ? loans.map((loan: any, i: number) => {
          const isBorrowed = loan.type === 'borrowed';
          const percentage = Math.min((loan.amount_paid / loan.amount) * 100, 100);
          const remaining = loan.amount - loan.amount_paid;
          const isSettled = remaining <= 0;

          return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} key={loan.id} className="glass-card p-6 rounded-2xl relative group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 ${isBorrowed ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                    {isBorrowed ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                    {isBorrowed ? 'Borrowed' : 'Lent'}
                  </div>
                  <h3 className="text-xl font-bold">{loan.name}</h3>
                  {loan.due_date && <p className="text-sm text-slate-500 font-medium mt-1 border border-slate-200 dark:border-slate-800 rounded-lg inline-block px-2 py-0.5">Due: {new Date(loan.due_date).toLocaleDateString()}</p>}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(loan)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(loan.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-sm font-bold text-slate-500">Paid so far</p>
                  <p className="text-lg font-black text-slate-700 dark:text-slate-300">${loan.amount_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-500">Total Amount</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">${loan.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${isSettled ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex justify-between items-center">
                {isSettled ? (
                  <span className="text-sm font-bold text-emerald-500 flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Fully Settled</span>
                ) : (
                  <span className="text-sm font-bold text-slate-500 flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500"></span> ${remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })} remaining</span>
                )}

                {!isSettled && (
                  <button onClick={() => openPaymentModal(loan)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Record Payment
                  </button>
                )}
              </div>
            </motion.div>
          );
        }) : (
          <div className="col-span-full py-16 text-center glass-card rounded-2xl flex flex-col items-center justify-center">
            <HandCoins className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-xl font-bold text-slate-500">No loans tracked yet.</p>
            <p className="text-slate-400 font-medium">Add a loan to start tracking money you owe or are owed.</p>
          </div>
        )}
      </div>

      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-start justify-center pt-12 px-4 pb-12 overflow-y-auto bg-slate-950/60 backdrop-blur-sm text-slate-900 dark:text-slate-100">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-md rounded-3xl p-8 shrink-0">
                <h2 className="text-2xl font-extrabold mb-6">{editingId ? 'Edit Loan' : 'Add Loan'}</h2>
                <form onSubmit={handleAddOrUpdate} className="space-y-4">
                  <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
                    <button type="button" onClick={() => setType('borrowed')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${type === 'borrowed' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>I Borrowed</button>
                    <button type="button" onClick={() => setType('lent')} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${type === 'lent' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>I Lent</button>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Name / Person</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-bold" placeholder="e.g. John Doe, Car Loan" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Total Amount ($)</label>
                    <input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-bold" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Due Date (Optional)</label>
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-bold text-slate-800 dark:text-slate-200" />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 py-3 font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">{editingId ? 'Save Changes' : 'Add Loan'}</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {createPortal(
        <AnimatePresence>
          {isPaymentModalOpen && activeLoan && (
            <div className="fixed inset-0 z-[100] flex items-start justify-center pt-12 px-4 pb-12 overflow-y-auto bg-slate-950/60 backdrop-blur-sm text-slate-900 dark:text-slate-100">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-md rounded-3xl p-8 shrink-0">
                <h2 className="text-2xl font-extrabold mb-2">Record Payment</h2>
                <p className="text-slate-500 font-medium mb-6">How much was paid towards <strong>{activeLoan.name}</strong>?</p>
                <form onSubmit={handleRecordPayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Payment Amount ($)</label>
                    <input autoFocus type="number" step="0.01" max={activeLoan.amount - activeLoan.amount_paid} required value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-bold" placeholder={`Max: ${(activeLoan.amount - activeLoan.amount_paid).toFixed(2)}`} />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="flex-1 py-3 font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                    <button type="submit" disabled={loading || !paymentAmount} className="flex-1 py-3 font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">Record</button>
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
