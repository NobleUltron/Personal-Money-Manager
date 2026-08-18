import React from 'react';

export function Card({ children, className = '', ...props }) {
    return (
        <div
            className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-soft transition-all duration-300 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className = '' }) {
    return (
        <div className={`flex items-center justify-between mb-6 ${className}`}>
            {children}
        </div>
    );
}

export function CardTitle({ children, className = '' }) {
    return (
        <h3 className={`text-base font-bold tracking-tight text-slate-900 dark:text-white ${className}`}>
            {children}
        </h3>
    );
}
