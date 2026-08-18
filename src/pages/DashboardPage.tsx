import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6'];

export function DashboardPage({ data }: { data: any, refreshData: () => void }) {
  const { accounts, transactions } = data;

  const totalBalance = useMemo(() => {
    const initial = accounts.reduce((sum: number, a: any) => sum + (a.initial_balance || 0), 0);
    return initial + transactions.reduce((acc: number, t: any) => {
      return t.type === 'deposit' ? acc + t.amount : acc - t.amount;
    }, 0);
  }, [accounts, transactions]);

  const accountBalances = useMemo(() => {
    const balances = new Map<string, number>();
    accounts.forEach((a: any) => balances.set(a.id, a.initial_balance || 0));
    
    transactions.forEach((t: any) => {
      if (!t.accountId) return;
      const amount = t.type === 'deposit' ? t.amount : -t.amount;
      balances.set(t.accountId, (balances.get(t.accountId) || 0) + amount);
    });
    
    return accounts.map((a: any) => ({
      ...a,
      balance: balances.get(a.id) || 0
    }));
  }, [accounts, transactions]);

  const monthlyIncome = useMemo(() => {
    const thisMonth = new Date().getMonth();
    return transactions.reduce((acc: number, t: any) => {
      if (t.type === 'deposit' && new Date(t.date).getMonth() === thisMonth) {
        return acc + t.amount;
      }
      return acc;
    }, 0);
  }, [transactions]);

  const monthlyExpense = useMemo(() => {
    const thisMonth = new Date().getMonth();
    return transactions.reduce((acc: number, t: any) => {
      if (t.type === 'withdrawal' && new Date(t.date).getMonth() === thisMonth) {
        return acc + t.amount;
      }
      return acc;
    }, 0);
  }, [transactions]);

  // Chart Data preparation
  const chartData = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let balance = accounts.reduce((sum: number, a: any) => sum + (a.initial_balance || 0), 0);
    return sorted.map((t) => {
      balance += t.type === 'deposit' ? t.amount : -t.amount;
      return {
        date: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        balance: balance
      };
    });
  }, [accounts, transactions]);

  const categoryData = useMemo(() => {
    const exp = transactions.filter((t: any) => t.type === 'withdrawal');
    const map = new Map<string, number>();
    exp.forEach((t: any) => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const formatCurrency = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 text-slate-500 mb-2 font-bold">
            <Wallet className="h-5 w-5 text-indigo-500" /> Total Balance
          </div>
          <div className="text-4xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(totalBalance)}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 text-slate-500 mb-2 font-bold">
            <ArrowUpRight className="h-5 w-5 text-emerald-500" /> Monthly Income
          </div>
          <div className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(monthlyIncome)}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 text-slate-500 mb-2 font-bold">
            <ArrowDownRight className="h-5 w-5 text-rose-500" /> Monthly Expenses
          </div>
          <div className="text-4xl font-extrabold text-rose-600 dark:text-rose-400">
            {formatCurrency(monthlyExpense)}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6 rounded-2xl h-96 flex flex-col">
          <h2 className="text-xl font-bold mb-6">Balance History</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
                <XAxis dataKey="date" strokeOpacity={0.5} tick={{ fontSize: 12 }} />
                <YAxis strokeOpacity={0.5} tick={{ fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6 rounded-2xl h-96 flex flex-col">
          <h2 className="text-xl font-bold mb-6">Spending by Category</h2>
          <div className="flex-1 min-h-0 flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 font-medium">No expense data to display</div>
            )}
          </div>
        </motion.div>
      </div>
      <div className="mt-12">
        <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3">
          <Wallet className="h-6 w-6 text-indigo-500" />
          Your Accounts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {accountBalances.map((acc: any, i: number) => (
            <motion.div key={acc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * (i % 4) }} className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-default">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="font-bold text-slate-500 dark:text-slate-400 mb-2">{acc.name}</h3>
              <div className={`text-3xl font-black ${acc.balance < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                {formatCurrency(acc.balance)}
              </div>
            </motion.div>
          ))}
          {accounts.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-500 font-medium glass-card rounded-2xl">
              No accounts found. Create one in the Bank Accounts page.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
