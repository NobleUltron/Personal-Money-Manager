import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Palette, Database, AlertTriangle, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api';

export function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  
  // Profile State
  const [username, setUsername] = useState(user?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Increased to 5MB since we shrink it anyway
        setProfileMsg({ text: 'Image must be less than 5MB', type: 'error' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 256;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          setProfilePicture(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Appearance State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'USD');
  const [accent, setAccent] = useState(localStorage.getItem('accent') || 'indigo');

  useEffect(() => {
    localStorage.setItem('currency', currency);
    localStorage.setItem('accent', accent);
    // You could dynamically apply CSS variables for accent here if fully implemented
  }, [currency, accent]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ text: '', type: '' });
    
    try {
      const res = await apiFetch('update_profile', {
        method: 'POST',
        body: JSON.stringify({
          username: username !== user?.username ? username : '',
          currentPassword,
          newPassword,
          profilePicture: profilePicture !== user?.profilePicture ? profilePicture : ''
        })
      });
      
      setProfileMsg({ text: res.message || 'Profile updated!', type: 'success' });
      if (res.user) {
        updateUser(res.user);
      }
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setProfileMsg({ text: err.message || String(err), type: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleThemeToggle = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleDeleteAccount = async () => {
    const pwd = prompt('WARNING: This will permanently delete your account and all data. Enter your password to confirm:');
    if (!pwd) return;

    try {
      await apiFetch('delete_user', {
        method: 'POST',
        body: JSON.stringify({ password: pwd })
      });
      alert('Account deleted successfully.');
      logout();
    } catch (err: any) {
      alert(err.message || String(err));
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className="text-3xl font-extrabold mb-8">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Profile Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
            <User className="h-6 w-6 text-indigo-500" />
            <h2 className="text-xl font-bold">Profile & Security</h2>
          </div>

          <div className="mb-6 flex flex-col items-center">
            <div className="relative group">
              <div className="h-24 w-24 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-indigo-500">{username.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 h-8 w-8 bg-indigo-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-indigo-700 transition-colors">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
            <p className="text-xs text-slate-400 mt-3 font-medium">JPG, GIF or PNG. Max size of 5MB</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-medium transition-colors" 
              />
            </div>
            
            <div className="pt-2">
              <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">New Password <span className="text-slate-400 font-normal">(optional)</span></label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="Leave blank to keep current"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-medium transition-colors" 
              />
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <label className="block text-sm font-bold mb-1 text-slate-700 dark:text-slate-300">Current Password <span className="text-red-500">*</span></label>
              <input 
                type="password" 
                required
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                placeholder="Required to save changes"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-medium transition-colors" 
              />
            </div>

            {profileMsg.text && (
              <div className={`p-3 rounded-lg text-sm font-bold ${profileMsg.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
                {profileMsg.text}
              </div>
            )}

            <button disabled={profileLoading} type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 mt-4">
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </motion.div>

        {/* Appearance Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
          
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
              <Palette className="h-6 w-6 text-indigo-500" />
              <h2 className="text-xl font-bold">Appearance</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">Theme</label>
                <div className="flex gap-3">
                  <button onClick={() => handleThemeToggle('light')} className={`flex-1 py-3 rounded-xl font-bold transition-all border ${theme === 'light' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-400' : 'bg-transparent border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'}`}>
                    Light
                  </button>
                  <button onClick={() => handleThemeToggle('dark')} className={`flex-1 py-3 rounded-xl font-bold transition-all border ${theme === 'dark' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-400' : 'bg-transparent border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800'}`}>
                    Dark
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-3 text-slate-700 dark:text-slate-300">Default Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 outline-none focus:border-indigo-500 font-bold">
                  <option value="USD" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">USD ($)</option>
                  <option value="EUR" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">EUR (€)</option>
                  <option value="GBP" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">GBP (£)</option>
                  <option value="UGX" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">UGX (USh)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-red-200 dark:border-red-900/30">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Danger Zone</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6 font-medium">Once you delete your account, there is no going back. All your financial data, accounts, and subscriptions will be permanently wiped.</p>
            <button onClick={handleDeleteAccount} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 font-bold rounded-xl transition-all">
              Delete Account
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
