import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    TrendingUp,
    TrendingDown,
    Calendar,
    Flame,
    PieChart as PieChartIcon,
    Wallet,
    Info,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    Check,
    CreditCard,
    Building2,
    SlidersHorizontal,
    Lightbulb,
    Target
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const PIE_COLORS = [
    '#38bdf8', // Cyan/Sky
    '#818cf8', // Indigo
    '#a78bfa', // Violet
    '#f472b6', // Pink
    '#fbbf24', // Amber
    '#34d399', // Emerald
    '#fb7185', // Rose
    '#60a5fa', // Blue
];

export default function Index({
    accounts = [],
    overview = {},
    dailyTrend = [],
    categoryBreakdown = [],
    accountsComparison = [],
    budgets = [],
    daysRemainingInMonth = 13,
    currencySymbol = 'UGX',
    userName = 'Noble'
}) {
    // Selected Account filter (null means All Trackers)
    const [selectedAccountId, setSelectedAccountId] = useState(null);
    const [timeframe, setTimeframe] = useState('1M'); // '7D', '1M', '3M'

    // Format number to compact (e.g. 60000 -> 60k)
    const formatCompact = (val) => {
        const num = Number(val);
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
        return num.toLocaleString();
    };

    // Filtered data based on selected account
    const filteredDailyTrend = useMemo(() => {
        let trend = dailyTrend;
        if (timeframe === '7D') {
            trend = trend.slice(-7);
        }

        if (!selectedAccountId) {
            return trend;
        }

        return trend.map(item => ({
            ...item,
            amount: item.accountSpending?.[selectedAccountId] || 0
        }));
    }, [dailyTrend, selectedAccountId, timeframe]);

    // Filtered total and peak calculation
    const currentTotal = useMemo(() => {
        return filteredDailyTrend.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    }, [filteredDailyTrend]);

    const currentDailyAvg = useMemo(() => {
        const count = filteredDailyTrend.length || 1;
        return Math.round(currentTotal / count);
    }, [filteredDailyTrend, currentTotal]);

    const currentPeak = useMemo(() => {
        let maxAmt = 0;
        let peakDate = null;
        filteredDailyTrend.forEach(item => {
            if (item.amount > maxAmt) {
                maxAmt = item.amount;
                peakDate = item.label;
            }
        });
        return { amount: maxAmt, date: peakDate || 'N/A' };
    }, [filteredDailyTrend]);

    // Active trackers label
    const activeTrackerLabel = selectedAccountId
        ? accounts.find(a => a.id === selectedAccountId)?.name || 'Selected Tracker'
        : `${accounts.length} Trackers`;

    return (
        <AuthenticatedLayout header="Financial Analytics">
            <Head title="Analytics" />

            <div className="max-w-5xl mx-auto space-y-6 pb-12">
                {/* Top Tracker Filter Pills */}
                {accounts.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        <button
                            type="button"
                            onClick={() => setSelectedAccountId(null)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                                selectedAccountId === null
                                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 ring-2 ring-sky-400/40'
                                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
                            }`}
                        >
                            {selectedAccountId === null && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            All Accounts & Trackers
                        </button>

                        {accounts.map(acc => {
                            const isSelected = selectedAccountId === acc.id;
                            return (
                                <button
                                    key={acc.id}
                                    type="button"
                                    onClick={() => setSelectedAccountId(isSelected ? null : acc.id)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                                        isSelected
                                            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 ring-2 ring-sky-400/40'
                                            : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
                                    }`}
                                >
                                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                    {acc.name}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* 1. Overview Card */}
                <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-extrabold text-white tracking-tight">Overview</h2>
                            <Info className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <span>{activeTrackerLabel}</span>
                            <span>•</span>
                            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                                <button
                                    onClick={() => setTimeframe('7D')}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${timeframe === '7D' ? 'bg-sky-500 text-white' : 'text-slate-400'}`}
                                >
                                    7D
                                </button>
                                <button
                                    onClick={() => setTimeframe('1M')}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${timeframe === '1M' ? 'bg-sky-500 text-white' : 'text-slate-400'}`}
                                >
                                    1M
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 3 Metric Tiles in Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        {/* Total Spending */}
                        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <span className="h-5 w-5 rounded-full bg-slate-700/60 flex items-center justify-center text-slate-300 text-[10px]">
                                    {currencySymbol.substring(0, 1)}
                                </span>
                                Total
                            </div>
                            <div className="mt-3">
                                <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                                    {currencySymbol} {currentTotal.toLocaleString()}
                                </div>
                                <div className="flex items-center gap-1 text-xs font-bold text-rose-400 mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                    <span>{overview.spendingChangePct >= 0 ? `${overview.spendingChangePct}% more` : `${Math.abs(overview.spendingChangePct)}% less`}</span>
                                </div>
                            </div>
                        </div>

                        {/* Daily Average */}
                        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                Daily Avg
                            </div>
                            <div className="mt-3">
                                <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                                    {currencySymbol} {currentDailyAvg.toLocaleString()}
                                </div>
                                <div className="flex items-center gap-1 text-xs font-bold text-rose-400 mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                    <span>{overview.spendingChangePct >= 0 ? `${overview.spendingChangePct}% more` : `${Math.abs(overview.spendingChangePct)}% less`}</span>
                                </div>
                            </div>
                        </div>

                        {/* Peak Day */}
                        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <Flame className="w-4 h-4 text-amber-400" />
                                Peak Day {currentPeak.date !== 'N/A' && `(${currentPeak.date})`}
                            </div>
                            <div className="mt-3">
                                <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                                    {currencySymbol} {currentPeak.amount.toLocaleString()}
                                </div>
                                <div className="flex items-center gap-1 text-xs font-bold text-rose-400 mt-1">
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                    <span>Highest Outflow</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Spending Trend (Neon Glowing Area Curve) */}
                <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h2 className="text-lg font-extrabold text-white tracking-tight">Spending Trend</h2>
                        <span className="text-xs font-medium text-slate-400">
                            {overview.dateRange || 'Last 30 Days'}
                        </span>
                    </div>

                    <div className="h-64 sm:h-72 w-full pt-2">
                        {filteredDailyTrend.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-slate-500">
                                No spending records found for this period.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={filteredDailyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="cyanGlow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="label"
                                        stroke="#475569"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={8}
                                    />
                                    <YAxis
                                        stroke="#475569"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => `${currencySymbol}${formatCompact(val)}`}
                                    />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="p-3 rounded-2xl bg-slate-950/95 border border-cyan-500/30 text-white shadow-xl backdrop-blur-xl">
                                                        <span className="text-[10px] uppercase font-bold text-cyan-400 block">{label}</span>
                                                        <span className="text-base font-extrabold text-white mt-0.5 block font-mono">
                                                            {currencySymbol} {Number(payload[0].value).toLocaleString()}
                                                        </span>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#06b6d4"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#cyanGlow)"
                                        dot={false}
                                        activeDot={{ r: 6, fill: '#38bdf8', stroke: '#0891b2', strokeWidth: 3 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="text-center text-[11px] font-semibold text-slate-500 flex items-center justify-center gap-1.5 pt-1">
                        <span>⇆</span> Swipe horizontally / Hover across days to inspect spending peaks
                    </div>
                </div>

                {/* 3. Categories Breakdown (Donut + Progress Bars) */}
                <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-5">
                    <h2 className="text-lg font-extrabold text-white tracking-tight">Categories</h2>

                    {categoryBreakdown.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-500">
                            No category spending data available yet.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Donut Chart & Legend */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
                                <div className="h-44 w-44 shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryBreakdown}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={45}
                                                outerRadius={70}
                                                paddingAngle={3}
                                                dataKey="amount"
                                            >
                                                {categoryBreakdown.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="transparent" />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Legend List */}
                                <div className="space-y-2.5 w-full max-w-xs">
                                    {categoryBreakdown.slice(0, 5).map((cat, index) => (
                                        <div key={cat.category} className="flex items-center justify-between text-xs font-bold text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full shrink-0"
                                                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                                                ></div>
                                                <span className="truncate">{cat.category}</span>
                                            </div>
                                            <span className="font-mono text-slate-400">{cat.percentage}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Proportion Bars */}
                            <div className="space-y-3.5 pt-4 border-t border-slate-800/80">
                                {categoryBreakdown.map((cat, index) => (
                                    <div key={cat.category} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                                            <span className="flex items-center gap-1.5">
                                                <span
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                                                ></span>
                                                {cat.category}
                                            </span>
                                            <span className="font-mono text-white">
                                                {currencySymbol} {cat.amount.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${cat.percentage}%`,
                                                    backgroundColor: PIE_COLORS[index % PIE_COLORS.length]
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. Smart Insights */}
                <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-4">
                    <div>
                        <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-400" /> Smart Insights
                        </h2>
                        <p className="text-xs text-slate-400 font-semibold mt-1">
                            Hello, {userName} 👋
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Insight 1 */}
                        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-white">Spending Pace</h4>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {overview.spendingChangePct >= 0
                                        ? `You spent ${overview.spendingChangePct}% more compared to your last 30-day period.`
                                        : `Great job! You spent ${Math.abs(overview.spendingChangePct)}% less than the last period.`}
                                </p>
                            </div>
                        </div>

                        {/* Insight 2 */}
                        {categoryBreakdown.length > 0 && (
                            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-start gap-3">
                                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
                                    <PieChartIcon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white">Primary Expense Driver</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        <strong className="text-white">{categoryBreakdown[0].category}</strong> is your highest expense, taking <strong className="text-sky-400">{categoryBreakdown[0].percentage}%</strong> of total outflows.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Insight 3 */}
                        {currentPeak.date !== 'N/A' && (
                            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-start gap-3">
                                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                                    <Flame className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-white">Peak Outflow Day</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">
                                        Your highest spending occurred on <strong className="text-white">{currentPeak.date}</strong> ({currencySymbol} {currentPeak.amount.toLocaleString()}).
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Insight 4 */}
                        <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                                <Lightbulb className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-white">Daily Spending Benchmark</h4>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Your daily average spending benchmark is <strong className="text-emerald-400">{currencySymbol} {currentDailyAvg.toLocaleString()}</strong> per day.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Budget Overview */}
                <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-extrabold text-white tracking-tight">Budget Overview</h2>
                            <Info className="w-4 h-4 text-slate-500" />
                        </div>
                        <span className="text-xs font-bold text-slate-400">
                            Monthly Budgets • Resets in {daysRemainingInMonth} day(s)
                        </span>
                    </div>

                    {budgets.length === 0 ? (
                        <div className="text-center py-8 text-xs text-slate-500">
                            No active category budgets set. Visit Budgets to set monthly limits.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {budgets.map(b => (
                                <div key={b.id} className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-extrabold text-white">{b.category}</h4>
                                        <span className="text-xs font-bold text-slate-400">
                                            {currencySymbol} {b.spent.toLocaleString()} / {currencySymbol} {b.limit.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="h-2 w-full bg-slate-700/60 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                b.isOver
                                                    ? 'bg-rose-500'
                                                    : b.percentage > 75
                                                    ? 'bg-amber-400'
                                                    : 'bg-emerald-500'
                                            }`}
                                            style={{ width: `${Math.min(100, b.percentage)}%` }}
                                        ></div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs font-medium text-slate-400">
                                        <span>
                                            {b.isOver ? (
                                                <strong className="text-rose-400">Exceeded by {currencySymbol} {(b.spent - b.limit).toLocaleString()}</strong>
                                            ) : (
                                                `Left this month: ${currencySymbol} ${b.remaining.toLocaleString()}`
                                            )}
                                        </span>
                                        <span className="font-mono text-slate-500">{b.percentage}% used</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 6. Trackers / Accounts Comparison */}
                {accountsComparison.length > 0 && (
                    <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-4">
                        <h2 className="text-lg font-extrabold text-white tracking-tight">Trackers Comparison</h2>

                        <div className="space-y-3.5">
                            {accountsComparison.map((acc, index) => (
                                <div key={acc.id} className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                                        <span className="flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5 text-sky-400" />
                                            {acc.name} ({acc.bank_name || acc.type})
                                        </span>
                                        <span className="font-mono text-white">
                                            {currencySymbol} {acc.spent.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-500"
                                            style={{ width: `${acc.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
