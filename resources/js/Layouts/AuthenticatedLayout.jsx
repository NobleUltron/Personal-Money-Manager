import React, { useState, useEffect } from 'react';
import { Link, usePage, useForm } from '@inertiajs/react';
import { Modal } from '@/Components/Modal';
import { Button } from '@/Components/Button';
import { formatMoney } from '@/Utils/formatCurrency';
import {
    LayoutDashboard,
    CreditCard,
    ArrowLeftRight,
    PieChart,
    CalendarCheck,
    HandCoins,
    Target,
    BarChart3,
    Settings,
    LogOut,
    SunIcon,
    MoonIcon,
    Wallet,
    Bell,
    ChevronDown,
    Menu,
    X,
    CheckCircle2,
    AlertCircle,
    Plus,
    PlusCircle,
    MinusCircle,
    ShieldCheck,
    ShieldAlert,
    Trophy,
    Check,
    Calendar,
    Trash2
} from 'lucide-react';

export default function AuthenticatedLayout({ children, header }) {
    const { auth, flash, notifications = [], unreadCount = 0, userAccounts = [] } = usePage().props;
    const user = auth.user;
    const currencySymbol = user?.currencySymbol || 'UGX';

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isFabOpen, setIsFabOpen] = useState(false);
    const [readIds, setReadIds] = useState([]);
    const [clearedIds, setClearedIds] = useState([]);

    // Global Modal States for FAB
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

    // Global Forms
    const transactionForm = useForm({
        accountId: userAccounts[0]?.id || '',
        type: 'deposit',
        amount: '',
        reason: '',
        category: 'Salary',
        date: new Date().toISOString().split('T')[0],
    });

    const goalForm = useForm({
        name: '',
        target_amount: '',
        current_amount: '0',
        target_date: '',
        category: 'Savings',
        color: '#6366f1',
        notes: '',
    });

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        }

        const savedRead = localStorage.getItem('read_notifications');
        if (savedRead) {
            try {
                setReadIds(JSON.parse(savedRead));
            } catch (e) {}
        }

        const savedCleared = localStorage.getItem('cleared_notifications');
        if (savedCleared) {
            try {
                setClearedIds(JSON.parse(savedCleared));
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        if (userAccounts.length > 0 && !transactionForm.data.accountId) {
            transactionForm.setData('accountId', userAccounts[0].id);
        }
    }, [userAccounts]);

    const toggleDarkMode = () => {
        const next = !isDarkMode;
        setIsDarkMode(next);
        if (next) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const markAsRead = (id) => {
        if (!readIds.includes(id)) {
            const next = [...readIds, id];
            setReadIds(next);
            localStorage.setItem('read_notifications', JSON.stringify(next));
        }
    };

    const markAllAsRead = () => {
        const allIds = notifications.map(n => n.id);
        setReadIds(allIds);
        localStorage.setItem('read_notifications', JSON.stringify(allIds));
    };

    const clearAllNotifications = () => {
        const allIds = notifications.map(n => n.id);
        setClearedIds(allIds);
        localStorage.setItem('cleared_notifications', JSON.stringify(allIds));
    };

    const activeNotifications = notifications.filter(n => !clearedIds.includes(n.id));
    const effectiveUnreadCount = activeNotifications.filter(n => !readIds.includes(n.id)).length;

    const openDepositModal = () => {
        transactionForm.setData({
            accountId: userAccounts[0]?.id || '',
            type: 'deposit',
            amount: '',
            reason: '',
            category: 'Salary',
            date: new Date().toISOString().split('T')[0],
        });
        setIsFabOpen(false);
        setIsDepositModalOpen(true);
    };

    const openExpenseModal = () => {
        transactionForm.setData({
            accountId: userAccounts[0]?.id || '',
            type: 'withdrawal',
            amount: '',
            reason: '',
            category: 'Food & Dining',
            date: new Date().toISOString().split('T')[0],
        });
        setIsFabOpen(false);
        setIsExpenseModalOpen(true);
    };

    const openGoalModal = () => {
        goalForm.reset();
        setIsFabOpen(false);
        setIsGoalModalOpen(true);
    };

    const submitTransaction = (e, type) => {
        e.preventDefault();
        transactionForm.post('/transactions', {
            onSuccess: () => {
                setIsDepositModalOpen(false);
                setIsExpenseModalOpen(false);
                transactionForm.reset();
            },
        });
    };

    const submitGoal = (e) => {
        e.preventDefault();
        goalForm.post('/goals', {
            onSuccess: () => {
                setIsGoalModalOpen(false);
                goalForm.reset();
            },
        });
    };

    const renderNotificationIcon = (iconName) => {
        switch (iconName) {
            case 'ShieldCheck': return <ShieldCheck className="w-4 h-4" />;
            case 'ShieldAlert': return <ShieldAlert className="w-4 h-4" />;
            case 'Trophy': return <Trophy className="w-4 h-4" />;
            case 'Target': return <Target className="w-4 h-4" />;
            case 'AlertCircle': return <AlertCircle className="w-4 h-4" />;
            case 'CalendarCheck': return <CalendarCheck className="w-4 h-4" />;
            default: return <Bell className="w-4 h-4" />;
        }
    };

    const depositCategories = ['Salary', 'Freelance', 'Investments', 'Business', 'Gift', 'Other Deposit'];
    const expenseCategories = ['Food & Dining', 'Groceries', 'Rent & Housing', 'Utilities', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Other Expense'];
    const goalCategories = ['Savings', 'Emergency Fund', 'Investment', 'Real Estate', 'Vehicle', 'Vacation', 'Education', 'Gadgets', 'Other'];

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Accounts', href: '/accounts', icon: CreditCard },
        { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
        { name: 'Budgets', href: '/budgets', icon: PieChart },
        { name: 'Savings Goals', href: '/goals', icon: Target },
        { name: 'Subscriptions', href: '/subscriptions', icon: CalendarCheck },
        { name: 'Loans & Debts', href: '/loans', icon: HandCoins },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const mobileBottomItems = [
        { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Accounts', href: '/accounts', icon: CreditCard },
        { name: 'Goals', href: '/goals', icon: Target },
        { name: 'Ledger', href: '/transactions', icon: ArrowLeftRight },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    const currentPath = window.location.pathname;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-300">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 sticky top-0 h-screen z-20">
                <div className="p-6 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                        <Wallet className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <div>
                        <h2 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                            MoneyManager
                        </h2>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                            SaaS Edition
                        </span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPath.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                                    isActive
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                                }`}
                            >
                                <Icon className={`w-5 h-5 stroke-[2] ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold overflow-hidden shadow-sm">
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <span>{user?.username?.charAt(0).toUpperCase()}</span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {user?.username}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                {user?.email || 'Pro Member'}
                            </p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Navigation Drawer Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>

                    <div className="relative w-72 max-w-[80%] bg-white dark:bg-slate-900 h-full p-6 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 shadow-2xl z-10 animate-in slide-in-from-left duration-200">
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-600 flex items-center justify-center text-white shadow-md">
                                        <Wallet className="w-5 h-5 stroke-[2.2]" />
                                    </div>
                                    <div>
                                        <h2 className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                                            MoneyManager
                                        </h2>
                                        <span className="text-[10px] font-semibold uppercase text-indigo-600 dark:text-indigo-400">
                                            Mobile Edition
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="space-y-1.5">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = currentPath.startsWith(item.href);
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                                                isActive
                                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-indigo-500 text-white font-bold flex items-center justify-center overflow-hidden shrink-0">
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} alt="User" className="h-full w-full object-cover" />
                                ) : (
                                    user?.username?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="truncate">
                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.username}</p>
                                <p className="text-[10px] text-slate-500 truncate">{user?.email || 'Pro Member'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Sticky Header */}
                <header className="h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-30 flex items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        {header && (
                            <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
                                {header}
                            </h1>
                        )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Dark Mode Switcher */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                            title="Toggle Theme"
                        >
                            {isDarkMode ? <SunIcon className="w-4 h-4 text-amber-400" /> : <MoonIcon className="w-4 h-4 text-indigo-600" />}
                        </button>

                        {/* Notification Bell & Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition-colors shadow-sm relative"
                                title="Notifications"
                            >
                                <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                {effectiveUnreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                                        {effectiveUnreadCount}
                                    </span>
                                )}
                            </button>

                            {isNotificationOpen && (
                                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                                        <div className="flex items-center gap-2">
                                            <Bell className="w-4 h-4 text-indigo-600" />
                                            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Notifications</h3>
                                            {effectiveUnreadCount > 0 && (
                                                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold">
                                                    {effectiveUnreadCount} unread
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {effectiveUnreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                                >
                                                    <Check className="w-3 h-3" /> Mark read
                                                </button>
                                            )}
                                            {activeNotifications.length > 0 && (
                                                <button
                                                    onClick={clearAllNotifications}
                                                    className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-3 h-3" /> Clear all
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                                        {activeNotifications.length === 0 ? (
                                            <div className="p-8 text-center text-slate-400">
                                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                                                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">No notifications right now</p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">All alerts have been cleared</p>
                                            </div>
                                        ) : (
                                            activeNotifications.map((item) => {
                                                const isRead = readIds.includes(item.id);
                                                return (
                                                    <Link
                                                        key={item.id}
                                                        href={item.link || '#'}
                                                        onClick={() => {
                                                            markAsRead(item.id);
                                                            setIsNotificationOpen(false);
                                                        }}
                                                        className={`p-4 flex items-start gap-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                                                            isRead ? 'opacity-60' : 'bg-indigo-50/30 dark:bg-indigo-950/20'
                                                        }`}
                                                    >
                                                        <div className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center ${
                                                            item.color === 'rose' ? 'bg-rose-500/10 text-rose-600' :
                                                            item.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-600' :
                                                            item.color === 'amber' ? 'bg-amber-500/10 text-amber-600' :
                                                            item.color === 'purple' ? 'bg-purple-500/10 text-purple-600' :
                                                            'bg-indigo-500/10 text-indigo-600'
                                                        }`}>
                                                            {renderNotificationIcon(item.icon)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                                    {item.title}
                                                                </p>
                                                                <span className="text-[10px] text-slate-400 shrink-0 font-medium">{item.time}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                                                {item.message}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-0.5 sm:mx-1"></div>

                        {/* User Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 p-1 pr-2 sm:pr-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                            >
                                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-xs overflow-hidden">
                                    {user?.profilePicture ? (
                                        <img src={user.profilePicture} alt="User" className="h-full w-full object-cover" />
                                    ) : (
                                        user?.username?.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden sm:inline">
                                    {user?.username}
                                </span>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                                    <Link
                                        href="/settings"
                                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        <Settings className="w-4 h-4 text-slate-400" /> Settings
                                    </Link>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left"
                                    >
                                        <LogOut className="w-4 h-4" /> Sign Out
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mx-4 md:mx-6 mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center gap-3 text-sm font-semibold animate-in slide-in-from-top-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mx-4 md:mx-6 mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 flex items-center gap-3 text-sm font-semibold animate-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                        {flash.error}
                    </div>
                )}

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
                    {children}
                </main>

                {/* Mobile Speed-Dial Floating Action Button (FAB) */}
                <div className="md:hidden fixed bottom-20 right-4 z-50 flex flex-col items-end">
                    {isFabOpen && (
                        <div className="mb-3 space-y-2 flex flex-col items-end animate-in slide-in-from-bottom-3 duration-200">
                            <button
                                onClick={openDepositModal}
                                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white shadow-lg text-xs font-extrabold hover:bg-emerald-500 transition-all"
                            >
                                <span>Record Deposit</span>
                                <div className="h-7 w-7 rounded-xl bg-white/20 flex items-center justify-center">
                                    <PlusCircle className="w-4 h-4" />
                                </div>
                            </button>

                            <button
                                onClick={openExpenseModal}
                                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-rose-600 text-white shadow-lg text-xs font-extrabold hover:bg-rose-500 transition-all"
                            >
                                <span>Log Expense</span>
                                <div className="h-7 w-7 rounded-xl bg-white/20 flex items-center justify-center">
                                    <MinusCircle className="w-4 h-4" />
                                </div>
                            </button>

                            <button
                                onClick={openGoalModal}
                                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-purple-600 text-white shadow-lg text-xs font-extrabold hover:bg-purple-500 transition-all"
                            >
                                <span>Add Savings Goal</span>
                                <div className="h-7 w-7 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Target className="w-4 h-4" />
                                </div>
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => setIsFabOpen(!isFabOpen)}
                        className={`h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-600 text-white shadow-xl shadow-indigo-500/40 flex items-center justify-center transition-transform duration-300 ${
                            isFabOpen ? 'rotate-45 bg-rose-600' : 'hover:scale-105 active:scale-95'
                        }`}
                        title="Quick Action Menu"
                    >
                        <Plus className="w-7 h-7 stroke-[2.5]" />
                    </button>
                </div>

                {/* Mobile Bottom Floating Navigation Bar */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-2 flex items-center justify-around shadow-lg">
                    {mobileBottomItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPath.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                                    isActive
                                        ? 'text-indigo-600 dark:text-indigo-400 font-extrabold scale-105'
                                        : 'text-slate-400 dark:text-slate-500 font-medium hover:text-slate-600'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                                <span className="text-[10px] mt-0.5">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Global FAB Modals */}
            {/* 1. Global Deposit Modal */}
            <Modal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} title="Record New Deposit">
                <form onSubmit={(e) => submitTransaction(e, 'deposit')} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Account</label>
                        <select
                            value={transactionForm.data.accountId}
                            onChange={(e) => transactionForm.setData('accountId', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            {userAccounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name} ({formatMoney(acc.balance ?? acc.initial_balance ?? 0, currencySymbol)})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Amount ({currencySymbol})</label>
                        <input
                            type="number"
                            step="0.01"
                            value={transactionForm.data.amount}
                            onChange={(e) => transactionForm.setData('amount', e.target.value)}
                            placeholder="0.00"
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Reason / Description</label>
                        <input
                            type="text"
                            value={transactionForm.data.reason}
                            onChange={(e) => transactionForm.setData('reason', e.target.value)}
                            placeholder="e.g. Salary / Client Payment"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Category</label>
                        <select
                            value={transactionForm.data.category}
                            onChange={(e) => transactionForm.setData('category', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            {depositCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Transaction Date</label>
                        <div className="relative flex items-center">
                            <Calendar className="w-4 h-4 text-indigo-500 absolute left-3.5 pointer-events-none" />
                            <input
                                type="date"
                                value={transactionForm.data.date}
                                onChange={(e) => transactionForm.setData('date', e.target.value)}
                                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                className="w-full pl-10 pr-4 py-3 min-h-[46px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white dark:[color-scheme:dark] focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                            />
                        </div>
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setIsDepositModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={transactionForm.processing}>Save Deposit</Button>
                    </div>
                </form>
            </Modal>

            {/* 2. Global Expense Modal */}
            <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Record New Expense">
                <form onSubmit={(e) => submitTransaction(e, 'withdrawal')} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Account</label>
                        <select
                            value={transactionForm.data.accountId}
                            onChange={(e) => transactionForm.setData('accountId', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            {userAccounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.name} ({formatMoney(acc.balance ?? acc.initial_balance ?? 0, currencySymbol)})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Amount ({currencySymbol})</label>
                        <input
                            type="number"
                            step="0.01"
                            value={transactionForm.data.amount}
                            onChange={(e) => transactionForm.setData('amount', e.target.value)}
                            placeholder="0.00"
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Reason / Description</label>
                        <input
                            type="text"
                            value={transactionForm.data.reason}
                            onChange={(e) => transactionForm.setData('reason', e.target.value)}
                            placeholder="e.g. Groceries / Electricity Bill"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Category</label>
                        <select
                            value={transactionForm.data.category}
                            onChange={(e) => transactionForm.setData('category', e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Transaction Date</label>
                        <div className="relative flex items-center">
                            <Calendar className="w-4 h-4 text-indigo-500 absolute left-3.5 pointer-events-none" />
                            <input
                                type="date"
                                value={transactionForm.data.date}
                                onChange={(e) => transactionForm.setData('date', e.target.value)}
                                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                className="w-full pl-10 pr-4 py-3 min-h-[46px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white dark:[color-scheme:dark] focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                            />
                        </div>
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setIsExpenseModalOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="danger" disabled={transactionForm.processing}>Save Expense</Button>
                    </div>
                </form>
            </Modal>

            {/* 3. Global Create Savings Goal Modal */}
            <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Create New Savings Goal">
                <form onSubmit={submitGoal} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Goal Name</label>
                        <input
                            type="text"
                            value={goalForm.data.name}
                            onChange={(e) => goalForm.setData('name', e.target.value)}
                            placeholder="e.g. New Car, Emergency Fund"
                            required
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Target Amount ({currencySymbol})</label>
                            <input
                                type="number"
                                step="0.01"
                                value={goalForm.data.target_amount}
                                onChange={(e) => goalForm.setData('target_amount', e.target.value)}
                                placeholder="5000.00"
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Initial Saved ({currencySymbol})</label>
                            <input
                                type="number"
                                step="0.01"
                                value={goalForm.data.current_amount}
                                onChange={(e) => goalForm.setData('current_amount', e.target.value)}
                                placeholder="0.00"
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Category</label>
                            <select
                                value={goalForm.data.category}
                                onChange={(e) => goalForm.setData('category', e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            >
                                {goalCategories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Target Date</label>
                            <div className="relative flex items-center">
                                <Calendar className="w-4 h-4 text-indigo-500 absolute left-3.5 pointer-events-none" />
                                <input
                                    type="date"
                                    value={goalForm.data.target_date}
                                    onChange={(e) => goalForm.setData('target_date', e.target.value)}
                                    onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                    className="w-full pl-10 pr-4 py-2.5 min-h-[46px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white dark:[color-scheme:dark] focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Notes (Optional)</label>
                        <input
                            type="text"
                            value={goalForm.data.notes}
                            onChange={(e) => goalForm.setData('notes', e.target.value)}
                            placeholder="Why is this goal important to you?"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setIsGoalModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={goalForm.processing}>Create Goal</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
