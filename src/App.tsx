import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Auth } from './pages/Auth';
import { AppShell } from './AppShell';

// Wrapper to protect routes
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#faf9f6] dark:bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  return children;
};

const AuthRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#faf9f6] dark:bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>;
  if (user) return <Navigate to="/" />;
  return children;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
          <Route path="/*" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}