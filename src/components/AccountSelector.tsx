import React, { useState } from 'react';
import { Account } from '../App';
import { PencilIcon, TrashIcon } from 'lucide-react';

interface AccountSelectorProps {
  accounts: Account[];
  currentAccountId: string;
  onSelectAccount: (accountId: string) => void;
  onUpdateAccount: (accountId: string, newName: string) => void;
  onDeleteAccount: (accountId: string) => void;
  accountTransactionCounts: {
    accountId: string;
    count: number;
  }[];
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  currentAccountId,
  onSelectAccount,
  onUpdateAccount,
  onDeleteAccount,
  accountTransactionCounts
}) => {
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);

  const handleEditClick = (account: Account, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAccountId(account.id);
    setEditingName(account.name);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccountId && editingName.trim()) {
      onUpdateAccount(editingAccountId, editingName.trim());
      setEditingAccountId(null);
      setEditingName('');
    }
  };

  const handleDeleteClick = (accountId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingAccountId(accountId);
  };

  const confirmDelete = () => {
    if (deletingAccountId) {
      onDeleteAccount(deletingAccountId);
      setDeletingAccountId(null);
    }
  };

  const getTransactionCount = (accountId: string) => {
    return accountTransactionCounts.find((a) => a.accountId === accountId)?.count || 0;
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {accounts.map((account) => {
          const isActive = account.id === currentAccountId;
          const count = getTransactionCount(account.id);

          return (
            <div
              key={account.id}
              onClick={() => onSelectAccount(account.id)}
              className={`p-5 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[120px] interactive-hover hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none ${
                isActive
                  ? 'border-2 border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-md shadow-indigo-500/10 dark:shadow-none'
                  : 'border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30 hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}>
              <div className="flex justify-between items-start w-full gap-2">
                <span className="block font-extrabold text-slate-800 dark:text-slate-200 text-base truncate max-w-[130px]">
                  {account.name}
                </span>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={(e) => handleEditClick(account, e)}
                    className="p-2 hover:bg-indigo-100 dark:hover:bg-slate-800 rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors"
                    title="Rename Account">
                    <PencilIcon className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(account.id, e)}
                    className="p-2 hover:bg-rose-100 dark:hover:bg-rose-950/30 rounded-lg text-rose-600 dark:text-rose-400 transition-colors"
                    title="Delete Account">
                    <TrashIcon className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Active
                </span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                  {count} transaction{count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Account Modal */}
      {editingAccountId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Edit Account Name</h2>
            <form onSubmit={handleSaveEdit}>
              <div className="mb-5">
                <label
                  htmlFor="editAccountName"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  id="editAccountName"
                  className="w-full p-3 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="py-2.5 px-4 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium"
                  onClick={() => setEditingAccountId(null)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-md shadow-indigo-600/10 text-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAccountId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Delete Account</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
              Are you sure you want to delete this account? This will also delete all{' '}
              <span className="font-bold text-rose-500">{getTransactionCount(deletingAccountId)}</span>{' '}
              transaction(s) associated with it. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                className="py-2.5 px-4 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium"
                onClick={() => setDeletingAccountId(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="py-2.5 px-4 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-semibold shadow-md shadow-rose-600/10 text-sm"
                onClick={confirmDelete}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountSelector;