import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardHeader, CardTitle } from '@/Components/Card';
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

export default function Index({ categoryBreakdown = [], monthlyTrends = [] }) {
    const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6', '#10b981'];

    return (
        <AuthenticatedLayout header="Financial Analytics">
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Cash Flow & Spending Analytics
                </h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                    Visual insights into monthly cash flow, savings rate, and category distribution
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Cash Flow Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-600" /> Monthly Cash Flow Trends
                        </CardTitle>
                    </CardHeader>
                    <div className="h-72">
                        {monthlyTrends.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-slate-400">
                                No monthly cash flow data available yet.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyTrends}>
                                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val}`} />
                                    <Tooltip formatter={(val) => `$${Number(val).toLocaleString()}`} />
                                    <Bar dataKey="deposits" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                                    <Bar dataKey="withdrawals" name="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                {/* Category Breakdown Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-indigo-600" /> Category Expense Distribution
                        </CardTitle>
                    </CardHeader>
                    <div className="h-72">
                        {categoryBreakdown.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-xs text-slate-400">
                                No expense category data recorded yet.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryBreakdown} layout="vertical">
                                    <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val}`} />
                                    <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={11} width={100} />
                                    <Tooltip formatter={(val) => `$${Number(val).toLocaleString()}`} />
                                    <Bar dataKey="amount" fill="#6366f1" radius={[0, 6, 6, 0]}>
                                        {categoryBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
