import React from 'react';
import { Link } from '@inertiajs/react';
import { Wallet } from 'lucide-react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/15 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white mb-4">
                        <Wallet className="w-7 h-7 stroke-[2.2]" />
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        Personal Money Manager
                    </h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                        SaaS Wealth & Expense Tracker
                    </p>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-soft rounded-3xl p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
