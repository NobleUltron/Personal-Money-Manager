import React, { useState, useEffect } from 'react';
import { Transaction } from '../App';
import { v4 as uuidv4 } from 'uuid';

interface TransactionFormProps {
  onAddTransaction: (transaction: Transaction) => void;
  accountId: string;
  formatNumber: (value: number) => string;
}

const DEPOSIT_CATEGORIES = ['Salary', 'Business', 'Investment', 'Gifts', 'Savings', 'Other'];
const WITHDRAWAL_CATEGORIES = [
  'Food',
  'Rent',
  'Utilities',
  'Transport',
  'Shopping',
  'Healthcare',
  'Entertainment',
  'Other'
];

const TransactionForm: React.FC<TransactionFormProps> = ({
  onAddTransaction,
  accountId,
  formatNumber
}) => {
  const [type, setType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Salary');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Update default category when transaction type changes
  useEffect(() => {
    if (type === 'deposit') {
      setCategory('Salary');
    } else {
      setCategory('Food');
    }
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!date) {
      setError('Please select a date');
      return;
    }
    if (type === 'withdrawal' && !reason.trim()) {
      setError('Please provide a reason or note for this withdrawal');
      return;
    }

    // Create new transaction
    const newTransaction: Transaction = {
      id: uuidv4(),
      accountId,
      type,
      amount: parseFloat(amount),
      date,
      category,
      reason: reason.trim() ? reason.trim() : undefined
    };

    // Add transaction
    onAddTransaction(newTransaction);

    // Reset form fields
    setAmount('');
    setReason('');
    setSuccess(
      `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} of UGX ${formatNumber(
        parseFloat(amount)
      )} recorded successfully!`
    );

    // Clear success message after 3 seconds
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  const currentCategories = type === 'deposit' ? DEPOSIT_CATEGORIES : WITHDRAWAL_CATEGORIES;

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 mb-6">
        Add New Transaction
      </h2>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 p-4 rounded-xl mb-6 text-sm font-medium animate-fade-in">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30 p-4 rounded-xl mb-6 text-sm font-medium animate-fade-in">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Transaction Type Selection */}
        <div>
          <label className="block text-base font-bold text-slate-700 dark:text-slate-300 mb-2.5">
            Transaction Type
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setType('deposit')}
              className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-base transition-all border ${
                type === 'deposit'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30 shadow-sm ring-1 ring-emerald-500/10'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}>
              Deposit
            </button>
            <button
              type="button"
              onClick={() => setType('withdrawal')}
              className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-base transition-all border ${
                type === 'withdrawal'
                  ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30 shadow-sm ring-1 ring-rose-500/10'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}>
              Withdrawal
            </button>
          </div>
        </div>

        {/* Amount & Date Input Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="amount" className="block text-base font-bold text-slate-700 dark:text-slate-300 mb-2.5">
              Amount (UGX)
            </label>
            <input
              type="number"
              id="amount"
              className="w-full p-3.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="1"
              min="1"
              placeholder="e.g. 50,000"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-base font-bold text-slate-700 dark:text-slate-300 mb-2.5">
              Date
            </label>
            <input
              type="date"
              id="date"
              className="w-full p-3.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Category & Reason Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-base font-bold text-slate-700 dark:text-slate-300 mb-2.5">
              Category
            </label>
            <select
              id="category"
              className="w-full p-3.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={category}
              onChange={(e) => setCategory(e.target.value)}>
              {currentCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="reason" className="block text-base font-bold text-slate-700 dark:text-slate-300 mb-2.5">
              Details / Note {type === 'deposit' && <span className="text-slate-400 font-normal">(Optional)</span>}
            </label>
            <input
              type="text"
              id="reason"
              className="w-full p-3.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white text-base focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={type === 'deposit' ? 'e.g. Project Bonus' : 'e.g. Electricity, Lunch'}
              required={type === 'withdrawal'}
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className={`w-full py-4 px-5 rounded-xl text-white font-extrabold text-base shadow-lg transition-all interactive-hover mt-3 ${
            type === 'deposit'
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10'
              : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/10'
          }`}>
          Record {type === 'deposit' ? 'Deposit' : 'Withdrawal'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;