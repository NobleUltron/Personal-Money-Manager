import React from 'react';
import { useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/Button';
import { Lock, KeyRound } from 'lucide-react';

export default function ResetPassword({ token, username }) {
    const { data, setData, post, processing, errors } = useForm({
        token: token,
        username: username,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/reset-password');
    };

    return (
        <GuestLayout>
            <div className="mb-6">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Create New Password</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Enter your username and choose a new password
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Username
                    </label>
                    <input
                        type="text"
                        value={data.username}
                        onChange={(e) => setData('username', e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    {errors.username && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.username}</p>}
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        New Password
                    </label>
                    <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Minimum 6 characters"
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                    {errors.password && <p className="text-xs font-semibold text-rose-500 mt-1">{errors.password}</p>}
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Re-type new password"
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                </div>

                <Button type="submit" disabled={processing} className="w-full justify-center gap-2 mt-2">
                    Reset Password
                    <KeyRound className="w-4 h-4" />
                </Button>
            </form>
        </GuestLayout>
    );
}
