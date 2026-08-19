import React from 'react';
import { useForm, Link, Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/Button';
import { User, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPassword() {
    const { data, setData, post, processing, errors } = useForm({
        username: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />
            <div className="mb-6">
                <Link href="/login" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-3">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Reset Password</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Enter your username to receive a secure password reset link
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
                            placeholder="Enter your username"
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                        />
                    </div>
                    {errors.username && (
                        <p className="text-xs font-semibold text-rose-500 mt-1">{errors.username}</p>
                    )}
                </div>

                <Button type="submit" disabled={processing} className="w-full justify-center gap-2 mt-2">
                    Send Reset Link
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </GuestLayout>
    );
}
