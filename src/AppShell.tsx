import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { apiFetch } from './api';

// Pages (to be created)
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { BudgetsPage } from './pages/BudgetsPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { LoansPage } from './pages/LoansPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AccountsPage } from './pages/AccountsPage';
import { SunIcon, MoonIcon, Bell, ChevronDown, User as UserIcon, Settings, LogOut } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { Link } from 'react-router-dom';
export function AppShell() {
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [data, setData] = useState<any>({
    accounts: [],
    transactions: [],
    budgets: [],
    subscriptions: [],
    loans: [],
  });

  const loadData = async () => {
    try {
      const res = await apiFetch('get_data');
      setData(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#faf9f6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        {/* Mobile header & theme toggle */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="md:hidden font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
            PMM
          </div>
          <div className="hidden md:block" />
          
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {isDarkMode ? <SunIcon className="h-5 w-5 text-amber-500" /> : <MoonIcon className="h-5 w-5 text-indigo-600" />}
            </button>

            {/* Notification Bell */}
            <button className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <Bell className="h-6 w-6" />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-slate-900"></span>
            </button>

            {/* Vertical Divider */}
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 p-1 pr-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center overflow-hidden">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-bold leading-tight">{user?.username}</div>
                  <div className="text-xs text-slate-500 font-medium">User</div>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-64 bg-slate-800 dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-700 dark:border-slate-800 z-50 overflow-hidden text-slate-200">
                    <div className="p-4 border-b border-slate-700">
                      <div className="font-bold text-white text-lg">{user?.username}</div>
                      <div className="text-sm text-slate-400">{user?.username.toLowerCase().replace(' ', '')}@example.com</div>
                      <div className="text-xs font-bold text-slate-500 uppercase mt-3 tracking-wider">JOINED RECENTLY</div>
                    </div>
                    
                    <div className="p-2">
                      <Link 
                        to="/settings" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors font-medium"
                      >
                        <UserIcon className="h-5 w-5 text-slate-400" />
                        Profile
                      </Link>
                      <Link 
                        to="/settings" 
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors font-medium"
                      >
                        <Settings className="h-5 w-5 text-slate-400" />
                        Settings
                      </Link>
                    </div>

                    <div className="p-2 border-t border-slate-700">
                      <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-slate-700 transition-colors font-medium text-red-400 hover:text-red-300"
                      >
                        <LogOut className="h-5 w-5" />
                        Log Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto animate-fade-in">
          <Routes>
            <Route path="/" element={<DashboardPage data={data} refreshData={loadData} />} />
            <Route path="/transactions" element={<TransactionsPage data={data} refreshData={loadData} />} />
            <Route path="/budgets" element={<BudgetsPage data={data} refreshData={loadData} />} />
            <Route path="/subscriptions" element={<SubscriptionsPage data={data} refreshData={loadData} />} />
            <Route path="/loans" element={<LoansPage data={data} refreshData={loadData} />} />
            <Route path="/accounts" element={<AccountsPage data={data} refreshData={loadData} />} />
            <Route path="/analytics" element={<AnalyticsPage data={data} />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
