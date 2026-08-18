import React, { useState } from 'react';
import { Transaction, Account } from '../App';
import { ArrowUpIcon, ArrowDownIcon, CalendarIcon, AlertCircleIcon } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  formatNumber: (value: number) => string;
  currentAccount?: Account;
}

// Predefined budget targets for categories (in UGX)
const BUDGETS: Record<string, number> = {
  Food: 300000,
  Rent: 800000,
  Utilities: 150000,
  Transport: 200000,
  Shopping: 400000,
  Healthcare: 250000,
  Entertainment: 200000,
  Other: 150000
};

// Colors for category breakdown
const CATEGORY_COLORS: Record<string, string> = {
  Food: '#f59e0b',          // Amber
  Rent: '#3b82f6',          // Blue
  Utilities: '#eab308',     // Yellow
  Transport: '#6366f1',     // Indigo
  Shopping: '#a855f7',      // Purple
  Healthcare: '#f43f5e',    // Rose
  Entertainment: '#0ea5e9', // Sky
  Other: '#64748b'          // Slate
};

const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  formatNumber,
  currentAccount
}) => {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [hoveredTrendPoint, setHoveredTrendPoint] = useState<{
    date: string;
    balance: number;
    x: number;
    y: number;
  } | null>(null);

  // 1. Calculations
  const balance = transactions.reduce((total, transaction) => {
    return transaction.type === 'deposit' ? total + transaction.amount : total - transaction.amount;
  }, 0);

  const totalDeposits = transactions
    .filter((t) => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter((t) => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  // Group withdrawals by category
  const expenseByCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === 'withdrawal')
    .forEach((t) => {
      const cat = t.category || 'Other';
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + t.amount;
    });

  const totalExpenses = Object.values(expenseByCategory).reduce((sum, val) => sum + val, 0);

  // Prepare data for Donut Chart
  const donutData = Object.entries(expenseByCategory).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpenses > 0 ? amount / totalExpenses : 0,
    color: CATEGORY_COLORS[category] || '#94a3b8'
  })).sort((a, b) => b.amount - a.amount);

  // Prepare data for Balance Trend over time
  // Sort oldest to newest to compute running balance
  const timelineData = [...transactions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let runningSum = 0;
  const balanceTrendPoints = timelineData.map((t) => {
    runningSum = t.type === 'deposit' ? runningSum + t.amount : runningSum - t.amount;
    return {
      date: t.date,
      balance: runningSum
    };
  });

  // Keep last 10 points for visibility, or group by day
  const trendPoints = balanceTrendPoints.slice(-10);

  // Donut chart path logic
  let accumulatedPercent = 0;
  const radius = 60;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Balance Summary Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-sm font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {currentAccount?.name || 'Account'} Account
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-slate-950 dark:text-white mt-1.5">
            UGX {formatNumber(balance)}
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1.5">
            Current Available Balance • {transactions.length} transactions
          </p>
        </div>

        {/* Deposit/Withdrawal grid summary */}
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <div className="flex-1 md:flex-initial p-4 md:px-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/20 flex items-center gap-3.5 min-w-max">
            <div className="h-11 w-11 shrink-0 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ArrowUpIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Inflow</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">UGX {formatNumber(totalDeposits)}</span>
            </div>
          </div>
          <div className="flex-1 md:flex-initial p-4 md:px-6 rounded-2xl bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/20 flex items-center gap-3.5 min-w-max">
            <div className="h-11 w-11 shrink-0 rounded-xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <ArrowDownIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Outflow</span>
              <span className="text-base font-extrabold text-rose-600 dark:text-rose-400 whitespace-nowrap">UGX {formatNumber(totalWithdrawals)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Balance Trend Line Chart (7 cols) */}
        <div className="md:col-span-7 bg-white dark:bg-slate-900/35 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <CalendarIcon className="h-5 w-5 text-indigo-500" />
              Balance History Trend
            </h3>
            <span className="text-sm font-medium text-slate-400 dark:text-slate-500 block mb-6">Showing running balance of last 10 active records</span>
          </div>

          {trendPoints.length > 1 ? (
            <div className="relative w-full h-[150px] mt-auto">
              <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="balanceTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* SVG path building */}
                {(() => {
                  const paddingX = 20;
                  const paddingY = 15;
                  const chartW = 500 - paddingX * 2;
                  const chartH = 150 - paddingY * 2;

                  const minB = Math.min(...trendPoints.map((p) => p.balance), 0);
                  const maxB = Math.max(...trendPoints.map((p) => p.balance), 1000);
                  const range = maxB - minB || 1000;

                  const points = trendPoints.map((p, idx) => {
                    const x = paddingX + (idx / (trendPoints.length - 1)) * chartW;
                    const y = paddingY + chartH - ((p.balance - minB) / range) * chartH;
                    return { x, y, balance: p.balance, date: p.date };
                  });

                  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                  const areaPath = `${linePath} L ${points[points.length - 1].x} 150 L ${points[0].x} 150 Z`;

                  return (
                    <>
                      {/* Area Fill */}
                      <path d={areaPath} fill="url(#balanceTrendGradient)" />
                      {/* Stroke Line */}
                      <path
                        d={linePath}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-draw"
                      />
                      {/* Interactivity Overlay */}
                      {points.map((p, idx) => (
                        <circle
                          key={idx}
                          cx={p.x}
                          cy={p.y}
                          r={hoveredTrendPoint?.date === p.date ? "6" : "3.5"}
                          fill={hoveredTrendPoint?.date === p.date ? "#6366f1" : "#ffffff"}
                          stroke="#6366f1"
                          strokeWidth="2.5"
                          className="transition-all cursor-pointer"
                          onMouseEnter={() =>
                            setHoveredTrendPoint({ date: p.date, balance: p.balance, x: p.x, y: p.y })
                          }
                          onMouseLeave={() => setHoveredTrendPoint(null)}
                        />
                      ))}
                    </>
                  );
                })()}
              </svg>

              {/* Tooltip Overlay */}
              {hoveredTrendPoint && (
                <div
                  className="absolute bg-slate-900 text-white dark:bg-white dark:text-slate-900 py-1.5 px-3 rounded-lg text-xs font-bold shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all"
                  style={{
                    left: `${(hoveredTrendPoint.x / 500) * 100}%`,
                    top: `${(hoveredTrendPoint.y / 150) * 100 - 10}px`
                  }}>
                  <p className="opacity-80 font-normal">{new Date(hoveredTrendPoint.date).toLocaleDateString()}</p>
                  <p className="mt-0.5 text-sm font-extrabold">UGX {formatNumber(hoveredTrendPoint.balance)}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[120px] flex items-center justify-center text-slate-400 dark:text-slate-555 text-sm">
              Add more transactions to view balance trends
            </div>
          )}
        </div>

        {/* Expenses Donut Chart (5 cols) */}
        <div className="md:col-span-5 bg-white dark:bg-slate-900/35 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between items-center min-h-[300px]">
          <div className="w-full">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200 mb-1">
              Expenses Breakdown
            </h3>
            <span className="text-sm font-medium text-slate-400 dark:text-slate-500 block mb-4">Hover slices for values</span>
          </div>

          {totalExpenses > 0 ? (
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                {donutData.map((d, index) => {
                  const percent = d.percentage;
                  const dashArray = circumference;
                  const dashOffset = circumference * (1 - percent);
                  const rotation = accumulatedPercent * 360;
                  accumulatedPercent += percent;

                  const isHovered = hoveredSlice === d.category;

                  return (
                    <circle
                      key={index}
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke={d.color}
                      strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                      strokeDasharray={dashArray}
                      strokeDashoffset={dashOffset}
                      transform={`rotate(${rotation} 80 80)`}
                      className="transition-all duration-300 cursor-pointer"
                      style={{ strokeLinecap: percent > 0.03 ? 'round' : 'butt' }}
                      onMouseEnter={() => setHoveredSlice(d.category)}
                      onMouseLeave={() => setHoveredSlice(null)}
                    />
                  );
                })}
              </svg>

              {/* Central Text Label */}
              <div className="absolute text-center flex flex-col items-center justify-center p-2 pointer-events-none">
                {hoveredSlice ? (
                  <>
                    <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block truncate max-w-24">
                      {hoveredSlice}
                    </span>
                    <span className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                      {Math.round(
                        (donutData.find((d) => d.category === hoveredSlice)?.percentage || 0) * 100
                      )}
                      %
                    </span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                      UGX {formatNumber(donutData.find((d) => d.category === hoveredSlice)?.amount || 0)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Total Spend
                    </span>
                    <span className="text-base font-black text-slate-905 dark:text-white mt-0.5 block truncate max-w-[120px]">
                      UGX {formatNumber(totalExpenses)}
                    </span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="h-[120px] flex items-center justify-center text-slate-400 dark:text-slate-555 text-sm">
              No withdrawals recorded yet
            </div>
          )}

          {/* Simple Legend */}
          {totalExpenses > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-4 w-full">
              {donutData.slice(0, 4).map((d) => (
                <div key={d.category} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full block" style={{ backgroundColor: d.color }} />
                  <span className="text-xs font-bold text-slate-650 dark:text-slate-400">
                    {d.category}
                  </span>
                </div>
              ))}
              {donutData.length > 4 && (
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-400 block" />
                  <span className="text-xs font-bold text-slate-650 dark:text-slate-400">
                    Other
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category Budgets & Spending Targets */}
      <div className="bg-white dark:bg-slate-900/35 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800">
        <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-300 mb-4 flex items-center gap-1.5">
          <AlertCircleIcon className="h-5 w-5 text-amber-500" />
          Spending vs Budget Goal Limits
        </h3>
        
        {totalExpenses > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(expenseByCategory).map(([category, amount]) => {
              const limit = BUDGETS[category] || 150000;
              const ratio = amount / limit;
              const percent = Math.min(Math.round(ratio * 100), 200);
              
              // Progress bar color based on percentage
              let barColor = "bg-indigo-600 dark:bg-indigo-500";
              if (ratio >= 1.0) {
                barColor = "bg-rose-500";
              } else if (ratio >= 0.8) {
                barColor = "bg-amber-500";
              } else {
                barColor = "bg-emerald-500";
              }

              return (
                <div key={category} className="space-y-2 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/25">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{category}</span>
                    <span className="text-slate-600 dark:text-slate-400 font-bold">
                      UGX {formatNumber(amount)} / {formatNumber(limit)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden relative">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className={ratio >= 1.0 ? 'text-rose-500' : 'text-slate-400'}>
                      {ratio >= 1.0 ? 'Over budget target!' : `${Math.round(100 - ratio * 100)}% budget remaining`}
                    </span>
                    <span className="text-slate-500 dark:text-slate-450">{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-450 dark:text-slate-555 text-sm">
            Start recording withdrawals with categories to see your budget tracking limits
          </div>
        )}
      </div>

      {/* Recent Transactions List */}
      {recentTransactions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-300">
            Recent Activities
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {recentTransactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-4 border border-slate-200/50 dark:border-slate-800/60 bg-white/50 dark:bg-slate-950/25 rounded-xl hover:bg-white/80 dark:hover:bg-slate-900/10 transition-colors">
                <div className="flex items-center">
                  {t.type === 'deposit' ? (
                    <div className="h-9 w-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mr-3">
                      <ArrowUpIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  ) : (
                    <div className="h-9 w-9 rounded-lg bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center mr-3">
                      <ArrowDownIcon className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                      {t.type === 'deposit' ? 'Inflow' : 'Outflow'} • {t.category || 'Other'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      {new Date(t.date).toLocaleDateString()}
                      {t.reason && ` - ${t.reason}`}
                    </div>
                  </div>
                </div>
                <div
                  className={`text-base font-extrabold ${
                    t.type === 'deposit'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                  {t.type === 'deposit' ? '+' : '-'}UGX {formatNumber(t.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;