import React from 'react';
import { useForm, Link, Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Button } from '@/Components/Button';
import { ShieldCheck, KeyRound, RefreshCcw, ArrowRight } from 'lucide-react';

export default function TwoFactorChallenge() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const { post: postResend, processing: resending } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post('/two-factor-challenge');
    };

    const handleResend = (e) => {
        e.preventDefault();
        postResend('/two-factor/resend');
    };

    return (
        <GuestLayout>
            <Head title="Two-Factor Authentication" />
            <div className="mb-6 text-center">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-6 h-6 stroke-[2]" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Two-Factor Authentication</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Enter the 6-digit security code sent to your registered email
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider text-center">
                        Security Verification Code
                    </label>
                    <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                            type="text"
                            maxLength={6}
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value.replace(/\D/g, ''))}
                            placeholder="123456"
                            autoFocus
                            required
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl text-center text-xl font-extrabold tracking-[0.5em] text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors"
                        />
                    </div>
                    {errors.code && (
                        <p className="text-xs font-semibold text-rose-500 mt-1.5 text-center">{errors.code}</p>
                    )}
                </div>

                <Button type="submit" disabled={processing || data.code.length !== 6} className="w-full justify-center group gap-2">
                    Verify Code
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resending}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
                    >
                        <RefreshCcw className="w-3.5 h-3.5" /> Resend Code
                    </button>
                    <Link href="/login" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        Cancel Login
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
