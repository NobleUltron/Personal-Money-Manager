import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DatabaseIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const action = isLogin ? 'login' : 'register';
      const data = await apiFetch(action, {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-slate-950 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-800"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
            <DatabaseIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
            Personal Money Manager
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {isLogin ? 'Welcome back! Please login.' : 'Create your account to get started.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-semibold mb-6 border border-red-100 dark:border-red-500/20 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-800 dark:text-slate-100 font-medium transition-all"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-800 dark:text-slate-100 font-medium transition-all"
              placeholder="Enter your password"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold shadow-lg shadow-indigo-500/25 interactive-hover disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
