import React from 'react';

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    ...props
}) {
    const baseStyle = 'inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

    const variants = {
        primary: 'bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:opacity-95 text-white shadow-md shadow-indigo-500/25 focus:ring-indigo-500 rounded-2xl',
        secondary: 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-slate-400 rounded-2xl shadow-sm',
        danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm focus:ring-rose-500 rounded-2xl',
        ghost: 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3.5 text-base',
    };

    return (
        <button
            className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}
