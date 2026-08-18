import React, { useState, useEffect } from 'react';
import { Transaction } from '../App';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  SearchIcon,
  PencilIcon,
  TrashIcon,
  PrinterIcon
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  formatNumber: (value: number) => string;
  onUpdateTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (transactionId: string) => void;
  onPrint?: () => void;
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

const getCategoryPillClass = (category: string) => {
  const c = category.toLowerCase();
  const base = "px-2.5 py-1 text-xs font-bold rounded-full border ";
  if (c === 'salary') {
    return base + "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20";
  } else if (c === 'business') {
    return base + "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/20";
  } else if (c === 'investment') {
    return base + "bg-teal-50 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/20";
  } else if (c === 'gifts') {
    return base + "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/20";
  } else if (c === 'savings') {
    return base + "bg-lime-50 dark:bg-lime-950/30 text-lime-600 dark:text-lime-400 border-lime-100 dark:border-lime-900/20";
  } else if (c === 'food') {
    return base + "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/20";
  } else if (c === 'rent') {
    return base + "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/20";
  } else if (c === 'utilities') {
    return base + "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/20";
  } else if (c === 'transport') {
    return base + "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/20";
  } else if (c === 'shopping') {
    return base + "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/20";
  } else if (c === 'healthcare') {
    return base + "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/20";
  } else if (c === 'entertainment') {
    return base + "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/20";
  }
  return base + "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800";
};

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  formatNumber,
  onUpdateTransaction,
  onDeleteTransaction,
  onPrint
}) => {
  const [filter, setFilter] = useState<'all' | 'deposits' | 'withdrawals'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);

  const currentBalance = transactions.reduce((acc, t) => t.type === 'deposit' ? acc + t.amount : acc - t.amount, 0);

  // Edit form state
  const [editType, setEditType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editReason, setEditReason] = useState('');

  // Update default edit category when edit type changes
  useEffect(() => {
    if (editingTransaction) {
      if (editType === editingTransaction.type) {
        setEditCategory(editingTransaction.category || 'Other');
      } else {
        setEditCategory(editType === 'deposit' ? 'Salary' : 'Food');
      }
    }
  }, [editType, editingTransaction]);

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get unique categories from current transactions for filter dropdown
  const uniqueCategories = Array.from(
    new Set(transactions.map((t) => t.category).filter(Boolean))
  ) as string[];

  // Filter transactions based on type, category, and search term
  const filteredTransactions = sortedTransactions.filter((transaction) => {
    // Filter by type
    if (filter === 'deposits' && transaction.type !== 'deposit') return false;
    if (filter === 'withdrawals' && transaction.type !== 'withdrawal') return false;

    // Filter by category
    if (categoryFilter !== 'all' && transaction.category !== categoryFilter) return false;

    // Filter by search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesReason = transaction.reason?.toLowerCase().includes(lowerSearchTerm);
      const matchesCategory = transaction.category?.toLowerCase().includes(lowerSearchTerm);
      const matchesAmount = transaction.amount.toString().includes(searchTerm);
      const matchesDate = transaction.date.includes(searchTerm);
      return matchesReason || matchesCategory || matchesAmount || matchesDate;
    }
    return true;
  });

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditType(transaction.type);
    setEditAmount(transaction.amount.toString());
    setEditDate(transaction.date);
    setEditCategory(transaction.category || 'Other');
    setEditReason(transaction.reason || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransaction && editAmount && parseFloat(editAmount) > 0) {
      const updatedTransaction: Transaction = {
        ...editingTransaction,
        type: editType,
        amount: parseFloat(editAmount),
        date: editDate,
        category: editCategory,
        reason: editType === 'withdrawal' || editReason.trim() ? editReason.trim() : undefined
      };
      onUpdateTransaction(updatedTransaction);
      setEditingTransaction(null);
    }
  };

  const confirmDelete = () => {
    if (deletingTransactionId) {
      onDeleteTransaction(deletingTransactionId);
      setDeletingTransactionId(null);
    }
  };

  const editCategories = editType === 'deposit' ? DEPOSIT_CATEGORIES : WITHDRAWAL_CATEGORIES;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 print:hidden">
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">
          Transaction History
        </h2>
        {onPrint && (
          <button
            onClick={onPrint}
            className="flex items-center gap-2 text-sm font-bold py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-800 rounded-xl interactive-hover shadow-sm dark:shadow-none hover:shadow transition-shadow print:hidden">
            <PrinterIcon className="h-5 w-5" />
            <span>Print Transactions</span>
          </button>
        )}
      </div>

      {/* Filters Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 print:hidden">
        {/* Search */}
        <div className="relative md:col-span-5">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="pl-12 w-full p-3.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white text-base focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:shadow-sm dark:focus:shadow-none outline-none"
            placeholder="Search details, category, amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 md:col-span-4 p-0.5 bg-slate-100 dark:bg-slate-900">
          <button
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-extrabold transition-all ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            onClick={() => setFilter('all')}>
            All
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-extrabold transition-all ${
              filter === 'deposits'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            onClick={() => setFilter('deposits')}>
            Deposits
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-extrabold transition-all ${
              filter === 'withdrawals'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            onClick={() => setFilter('withdrawals')}>
            Withdrawals
          </button>
        </div>

        {/* Category Filter Dropdown */}
        <div className="md:col-span-3">
          <select
            className="w-full p-3.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white text-base font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Print-only Balance Header */}
      <div className="hidden print:block mb-8 pb-6 border-b-2 border-slate-200">
        <h1 className="text-lg font-bold text-slate-500 uppercase tracking-wider mb-1">Available Balance</h1>
        <p className="text-4xl font-black text-slate-900">UGX {formatNumber(currentBalance)}</p>
      </div>

      {/* Transactions Table */}
      {filteredTransactions.length > 0 ? (
        <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm print:border-none print:shadow-none">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900/60">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider print:hidden">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-950 divide-y divide-slate-100 dark:divide-slate-800/50">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-base">
                      <div className="flex items-center">
                        {transaction.type === 'deposit' ? (
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
                            <ArrowUpIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center">
                            <ArrowDownIcon className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                          </div>
                        )}
                        <span className="ml-2.5 font-bold text-slate-800 dark:text-slate-300">
                          {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getCategoryPillClass(transaction.category || 'Other')}>
                        {transaction.category || 'Other'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-slate-700 dark:text-slate-350 font-bold">
                      {transaction.reason || '-'}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-base font-black">
                      <span className={transaction.type === 'deposit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {transaction.type === 'deposit' ? '+' : '-'}UGX {formatNumber(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium print:hidden">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(transaction)}
                          className="p-2 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors"
                          title="Edit transaction">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setDeletingTransactionId(transaction.id)}
                          className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-rose-600 dark:text-rose-400 transition-colors"
                          title="Delete transaction">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/10">
          <p className="text-slate-500 dark:text-slate-400 font-extrabold text-base">No transactions found</p>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-5">Edit Transaction</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-base font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Type
                </label>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditType('deposit')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-base font-extrabold transition-all border ${
                      editType === 'deposit'
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20 shadow-sm ring-1 ring-emerald-500/10'
                        : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}>
                    Deposit
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType('withdrawal')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-base font-extrabold transition-all border ${
                      editType === 'withdrawal'
                        ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/20 shadow-sm ring-1 ring-rose-500/10'
                        : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}>
                    Withdrawal
                  </button>
                </div>
              </div>

              {/* Amount and Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editAmount" className="block text-base font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Amount (UGX)
                  </label>
                  <input
                    type="number"
                    id="editAmount"
                    className="w-full p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white text-base focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="editDate" className="block text-base font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    id="editDate"
                    className="w-full p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white text-base focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="editCategory" className="block text-base font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category
                </label>
                <select
                  id="editCategory"
                  className="w-full p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white text-base focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}>
                  {editCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Details / Notes */}
              <div>
                <label htmlFor="editReason" className="block text-base font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Details / Note {editType === 'deposit' && <span className="text-slate-400 font-normal">(Optional)</span>}
                </label>
                <input
                  type="text"
                  id="editReason"
                  className="w-full p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white text-base focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  required={editType === 'withdrawal'}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  className="py-3 px-5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-base font-bold"
                  onClick={() => setEditingTransaction(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-3 px-5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-extrabold shadow-md shadow-indigo-600/10 text-base">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTransactionId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Delete Transaction</h2>
            <p className="text-slate-500 dark:text-slate-400 text-base mb-5 font-semibold">
              Are you sure you want to delete this transaction? This action cannot be undone and will permanently remove this record from the database.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="py-3 px-5 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-base font-bold"
                onClick={() => setDeletingTransactionId(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="py-3 px-5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-extrabold shadow-md shadow-rose-600/10 text-base"
                onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;