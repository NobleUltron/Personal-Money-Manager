import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Wallet, RefreshCw, List, LogOut, DatabaseIcon, Settings, BarChart3, HandCoins, Landmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar() {
  const { user, logout } = useAuth();

  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/accounts', icon: Landmark, label: 'Bank Accounts' },
    { to: '/transactions', icon: List, label: 'Transactions' },
    { to: '/budgets', icon: Wallet, label: 'Budgets' },
    { to: '/subscriptions', icon: RefreshCw, label: 'Subscriptions' },
    { to: '/loans', icon: HandCoins, label: 'Loans' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-64 hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <DatabaseIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 dark:from-indigo-400 dark:via-blue-400 dark:to-violet-400">
            PMM
          </h1>
        </div>

        <nav className="flex flex-col gap-2">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-200 dark:border-slate-800">
        <Link to="/settings" className="block mb-2 group">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
            <div className="h-8 w-8 rounded-full bg-indigo-200 dark:bg-indigo-800 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold group-hover:scale-105 transition-transform overflow-hidden">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                user?.username.charAt(0).toUpperCase()
              )}
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-300 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{user?.username}</span>
          </div>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
