import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/Button';
import { User, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <GuestLayout>
            <div className="mb-6">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Welcome back</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Sign in to your money manager account
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Username
                    </label>
                    <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                            type="text"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            placeholder="e.g. default_user"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                        />
                    </div>
                    {errors.username && (
                        <p className="text-xs font-semibold text-rose-500 mt-1">{errors.username}</p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                        />
                    </div>
                    {errors.password && (
                        <p className="text-xs font-semibold text-rose-500 mt-1">{errors.password}</p>
                    )}
                </div>

                <div className="flex items-center justify-between text-xs font-semibold">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded-lg text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
                        />
                        Remember me
                    </label>
                    <Link href="/forgot-password" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        Forgot password?
                    </Link>
                </div>

                <Button type="submit" disabled={processing} className="w-full justify-center group gap-2 mt-2">
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="pt-4 text-center border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-500">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        Create one now
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
