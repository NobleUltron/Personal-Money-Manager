import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { useForm } from '@inertiajs/react';
import {
    User,
    Mail,
    Lock,
    Upload,
    ShieldCheck,
    ShieldAlert,
    Globe,
    Check,
    Download,
    Database,
    RefreshCw,
    FileJson,
    FolderUp
} from 'lucide-react';

export default function Index({ user = {} }) {
    const form = useForm({
        username: user.username || '',
        email: user.email || '',
        currency: user.currency || 'UGX',
        currency_symbol: user.currencySymbol || 'UGX',
        profile_picture: user.profilePicture || '',
        current_password: '',
        new_password: '',
    });

    const twoFactorForm = useForm({
        enable: !user.twoFactorEnabled,
    });

    const restoreForm = useForm({
        backup_file: null,
    });

    const [isRestoring, setIsRestoring] = useState(false);

    const currencies = [
        { code: 'UGX', symbol: 'UGX', name: 'Ugandan Shilling', flag: '🇺🇬' },
        { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
        { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
        { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
        { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪' },
        { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦' },
        { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
        { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
        { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
    ];

    const selectCurrency = (c) => {
        form.setData((prev) => ({
            ...prev,
            currency: c.code,
            currency_symbol: c.symbol,
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 250;
                    const MAX_HEIGHT = 250;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
                    form.setData('profile_picture', compressedBase64);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const submitSettings = (e) => {
        e.preventDefault();
        form.post('/settings', {
            preserveScroll: true,
        });
    };

    const toggle2FA = (e) => {
        e.preventDefault();
        twoFactorForm.post('/two-factor/toggle', {
            preserveScroll: true,
        });
    };

    const handleRestoreFile = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (confirm(`Are you sure you want to restore data from "${file.name}"? This will import all accounts, transactions, and goals.`)) {
                setIsRestoring(true);
                const formData = new FormData();
                formData.append('backup_file', file);

                restoreForm.setData('backup_file', file);
                restoreForm.post('/settings/backup/import', {
                    onFinish: () => setIsRestoring(false),
                });
            }
        }
    };

    return (
        <AuthenticatedLayout header="Account & System Settings">
            <div className="max-w-4xl space-y-6 sm:space-y-8">
                {/* Main Settings Card */}
                <Card>
                    <form onSubmit={submitSettings} className="space-y-6">
                        <div>
                            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Profile & Preferences
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Update your account details, default currency, and profile avatar
                            </p>
                        </div>

                        {/* Avatar Upload */}
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-extrabold text-xl flex items-center justify-center overflow-hidden shadow-md shrink-0">
                                {form.data.profile_picture ? (
                                    <img src={form.data.profile_picture} alt="Avatar Preview" className="h-full w-full object-cover" />
                                ) : (
                                    user.username?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer shadow-sm transition-all">
                                    <Upload className="w-4 h-4 text-indigo-500" /> Upload Avatar
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>
                                <p className="text-[11px] text-slate-400 mt-1.5">
                                    Supports JPG, PNG or WEBP (Max 2MB)
                                </p>
                            </div>
                        </div>

                        {/* Currency Switcher */}
                        <div>
                            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                <Globe className="w-4 h-4 text-indigo-500" /> Primary Currency Preference
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                                {currencies.map((c) => {
                                    const isSelected = form.data.currency === c.code;
                                    return (
                                        <button
                                            key={c.code}
                                            type="button"
                                            onClick={() => selectCurrency(c)}
                                            className={`p-3 rounded-2xl border text-left transition-all relative ${
                                                isSelected
                                                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-extrabold shadow-sm'
                                                    : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-base">{c.flag}</span>
                                                {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                                            </div>
                                            <div className="mt-1">
                                                <div className="text-xs font-bold">{c.code} ({c.symbol})</div>
                                                <div className="text-[10px] text-slate-400 truncate">{c.name}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Inputs Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                                    Username
                                </label>
                                <div className="relative">
                                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                    <input
                                        type="text"
                                        value={form.data.username}
                                        onChange={(e) => form.setData('username', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                {form.errors.username && <p className="text-xs font-semibold text-rose-500 mt-1">{form.errors.username}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>
                                {form.errors.email && <p className="text-xs font-semibold text-rose-500 mt-1">{form.errors.email}</p>}
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                                Change Password (Optional)
                            </h4>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                    <input
                                        type="password"
                                        value={form.data.current_password}
                                        onChange={(e) => form.setData('current_password', e.target.value)}
                                        placeholder="Enter current password to verify"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                                {form.errors.current_password && <p className="text-xs font-semibold text-rose-500 mt-1">{form.errors.current_password}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                                    <input
                                        type="password"
                                        value={form.data.new_password}
                                        onChange={(e) => form.setData('new_password', e.target.value)}
                                        placeholder="Minimum 6 characters"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                                {form.errors.new_password && <p className="text-xs font-semibold text-rose-500 mt-1">{form.errors.new_password}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={form.processing}>
                                Save Settings
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* 2FA Security Card */}
                <Card>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${
                                user.twoFactorEnabled
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                            }`}>
                                {user.twoFactorEnabled ? <ShieldCheck className="w-6 h-6 stroke-[2]" /> : <ShieldAlert className="w-6 h-6 stroke-[2]" />}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {user.twoFactorEnabled
                                        ? `Active: Sends a 6-digit security code to ${user.email || user.username} upon login.`
                                        : 'Disabled: Enable to add an extra layer of protection to your account.'}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={toggle2FA}>
                            <Button
                                type="submit"
                                variant={user.twoFactorEnabled ? 'secondary' : 'primary'}
                                disabled={twoFactorForm.processing}
                            >
                                {user.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                            </Button>
                        </form>
                    </div>
                </Card>

                {/* Data Backup & Disaster Recovery Card */}
                <Card>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                    <Database className="w-6 h-6 stroke-[2]" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Data Backup & Disaster Recovery</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Export a complete JSON backup of your financial database or restore previous data
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            {/* Export Button */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between space-y-3">
                                <div>
                                    <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                                        <FileJson className="w-4 h-4 text-indigo-500" /> Export Full Backup
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Download all your accounts, transactions, budgets, subscriptions, loans, and goals as a portable JSON file.
                                    </p>
                                </div>
                                <a
                                    href="/settings/backup/export"
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition-all text-center"
                                >
                                    <Download className="w-4 h-4" /> Download Backup (JSON)
                                </a>
                            </div>

                            {/* Restore Button */}
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between space-y-3">
                                <div>
                                    <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                                        <FolderUp className="w-4 h-4 text-purple-500" /> Restore Data
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        Upload a previously exported JSON backup file to restore accounts, ledgers, and financial milestones.
                                    </p>
                                </div>
                                <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs cursor-pointer shadow-sm transition-all text-center">
                                    <RefreshCw className={`w-4 h-4 text-purple-500 ${isRestoring ? 'animate-spin' : ''}`} />
                                    {isRestoring ? 'Restoring Data...' : 'Restore from JSON File'}
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleRestoreFile}
                                        disabled={isRestoring}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
