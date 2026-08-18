import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/Button';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        email: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <GuestLayout>
            <div className="mb-6">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Create Account</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Start managing your personal finances in seconds
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
                            placeholder="Choose a username"
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                        />
                    </div>
                    {errors.username && (
                        <p className="text-xs font-semibold text-rose-500 mt-1">{errors.username}</p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Email Address (For 2FA & Password Reset)
                    </label>
                    <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="your-email@example.com"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                        />
                    </div>
                    {errors.email && (
                        <p className="text-xs font-semibold text-rose-500 mt-1">{errors.email}</p>
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
                            placeholder="Minimum 6 characters"
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                        />
                    </div>
                    {errors.password && (
                        <p className="text-xs font-semibold text-rose-500 mt-1">{errors.password}</p>
                    )}
                </div>

                <Button type="submit" disabled={processing} className="w-full justify-center group gap-2 mt-2">
                    Create Account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="pt-4 text-center border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-slate-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        Sign In instead
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
