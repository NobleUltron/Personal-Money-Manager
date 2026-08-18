import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../api';
import { Plus, Trash2, Edit2, Landmark, CreditCard, Wallet, RefreshCw } from 'lucide-react';

export function AccountsPage({ data, refreshData }: { data: any, refreshData: () => void }) {
  const { accounts, transactions } = data;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [type, setType] = useState('Checking');
  const [initialBalance, setInitialBalance] = useState('');

  // Transfer State
  const [sourceAcc, setSourceAcc] = useState('');
  const [targetAcc, setTargetAcc] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculate true balances for each account
  const accountBalances = useMemo(() => {
    const balances = new Map<string, number>();
    accounts.forEach((a: any) => balances.set(a.id, a.initial_balance || 0));
    
    transactions.forEach((t: any) => {
      if (!t.accountId) return;
      const amount = t.type === 'deposit' ? t.amount : -t.amount;
      balances.set(t.accountId, (balances.get(t.accountId) || 0) + amount);
    });
    
    return accounts.map((a: any) => ({
      ...a,
      balance: balances.get(a.id) || 0
    }));
  }, [accounts, transactions]);

  const totalBalance = accountBalances.reduce((sum: number, acc: any) => sum + acc.balance, 0);

  const openNewModal = () => {
    setEditingId(null);
    setName('');
    setBankName('');
    setAccountNumber('');
    setType('Checking');
    setInitialBalance('');
    setIsModalOpen(true);
  };

  const openEditModal = (acc: any) => {
    setEditingId(acc.id);
    setName(acc.name);
    setBankName(acc.bank_name || '');
    setAccountNumber(acc.account_number || '');
    setType(acc.type || 'Checking');
    setInitialBalance(acc.initial_balance?.toString() || '0');
    setIsModalOpen(true);
  };

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = editingId ? 'update_account' : 'add_account';
      const payload = {
        id: editingId || Date.now().toString(),
        name,
        bank_name: bankName,
        account_number: accountNumber,
        type,
        initial_balance: parseFloat(initialBalance) || 0
      };

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

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceAcc === targetAcc) {
      alert("Source and destination accounts must be different.");
      return;
    }
    setLoading(true);
    try {
      await apiFetch('add_transfer', {
        method: 'POST',
        body: JSON.stringify({
          sourceAccountId: sourceAcc,
          targetAccountId: targetAcc,
          amount: parseFloat(transferAmount),
          date: transferDate,
          reason: 'Transfer'
        })
      });
      setIsTransferOpen(false);
      refreshData();
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account? All associated transactions will also be permanently deleted!')) return;
    try {
      await apiFetch('delete_account', {
        method: 'POST',
        body: JSON.stringify({ id })
      });
      refreshData();
    } catch (err) {
      alert(err);
    }
  };

  const getIconForType = (accType: string) => {
    switch (accType) {
      case 'Savings': return <Wallet className="h-6 w-6 text-emerald-500" />;
      case 'Credit': return <CreditCard className="h-6 w-6 text-rose-500" />;
      default: return <Landmark className="h-6 w-6 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <Landmark className="h-8 w-8 text-indigo-500" />
            Bank Accounts
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage your bank details and internal transfers</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setSourceAcc(''); setTargetAcc(''); setTransferAmount(''); setIsTransferOpen(true); }} className="px-5 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5" /> Transfer
          </button>
          <button onClick={openNewModal} className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2">
            <Plus className="h-5 w-5" /> Add Account
          </button>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Net Worth</p>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white">
            ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {accountBalances.map((acc: any, i: number) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} key={acc.id} className="glass-card p-6 rounded-2xl relative group flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {getIconForType(acc.type)}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{acc.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">{acc.bank_name || 'No Bank Specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(acc)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-colors">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => handleDelete(acc.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-auto">
              {acc.account_number && typeof acc.account_number === 'string' && (
                <div className="mb-4 font-mono text-sm tracking-widest text-slate-400 dark:text-slate-500">
                  •••• {acc.account_number.slice(-4)}
                </div>
              )}
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md inline-block mb-1">
                    {acc.type || 'Checking'}
                  </div>
                </div>
                <div className={`text-2xl font-black ${acc.balance < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                  ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {accounts.length === 0 && (
          <div className="col-span-full py-16 text-center glass-card rounded-2xl flex flex-col items-center justify-center">
            <Landmark className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-xl font-bold text-slate-500">No accounts tracked yet.</p>
          </div>
        )}
      </div>

      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-start justify-center pt-12 px-4 pb-12 overflow-y-auto bg-slate-950/60 backdrop-blur-sm text-slate-900 dark:text-slate-100">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-md rounded-3xl p-8 shrink-0">
                <h2 className="text-2xl font-extrabold mb-6">{editingId ? 'Edit Account' : 'Add Account'}</h2>
                <form onSubmit={handleAddOrUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Account Nickname</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-bold" placeholder="e.g. Main Checking, Emergency Fund" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-1">Bank Name</label>
                      <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-bold" placeholder="e.g. Chase" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">Account Number</label>
                      <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-bold" placeholder="Last 4 digits" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-1">Type</label>
                      <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-bold">
                        <option value="Checking" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Checking</option>
                        <option value="Savings" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Savings</option>
                        <option value="Credit" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Credit Card</option>
                        <option value="Investment" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Investment</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-1">Initial Balance ($)</label>
                      <input type="number" step="0.01" required value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-bold" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 py-3 font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">{editingId ? 'Save Changes' : 'Add Account'}</button>
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
          {isTransferOpen && (
            <div className="fixed inset-0 z-[100] flex items-start justify-center pt-12 px-4 pb-12 overflow-y-auto bg-slate-950/60 backdrop-blur-sm text-slate-900 dark:text-slate-100">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-md rounded-3xl p-8 shrink-0">
                <h2 className="text-2xl font-extrabold mb-6">Transfer Funds</h2>
                <form onSubmit={handleTransfer} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">From Account</label>
                    <select required value={sourceAcc} onChange={(e) => setSourceAcc(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-bold">
                      <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Select source...</option>
                      {accounts.map((a: any) => (
                        <option key={a.id} value={a.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{a.name} ({a.bank_name})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">To Account</label>
                    <select required value={targetAcc} onChange={(e) => setTargetAcc(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-bold">
                      <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Select destination...</option>
                      {accounts.map((a: any) => (
                        <option key={a.id} value={a.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{a.name} ({a.bank_name})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Amount ($)</label>
                    <input type="number" step="0.01" required value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-bold" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Date</label>
                    <input type="date" required value={transferDate} onChange={(e) => setTransferDate(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-bold text-slate-800 dark:text-slate-200" />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setIsTransferOpen(false)} className="flex-1 py-3 font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 py-3 font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">Transfer</button>
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
