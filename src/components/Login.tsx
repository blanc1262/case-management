import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User } from '../types';
import { User as UserIcon } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    const storedAccounts = localStorage.getItem('accounts');
    const accounts: User[] = storedAccounts ? JSON.parse(storedAccounts) : [];

    const account = accounts.find(
      (acc) => acc.username.toLowerCase() === username.toLowerCase() && acc.password === password
    );

    if (account) {
      localStorage.setItem('loggedInUser', JSON.stringify(account));
      navigate('/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen pastel-gradient-login flex justify-center items-center p-4">
      <div className="w-full max-w-[420px] glass-card p-10 rounded-3xl animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-4 shadow-sm">
            <UserIcon size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Please enter your details to sign in</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="primary-btn bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-200 hover:shadow-blue-300"
          >
            Sign In
          </button>
          
          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-center text-sm font-medium animate-fade-in border border-rose-100">
              {error}
            </div>
          )}
        </form>

        <div className="text-center mt-8 space-y-3">
          <p className="text-slate-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
              Create one now
            </Link>
          </p>
          <a href="#" className="block text-slate-400 text-xs font-medium hover:text-slate-600 transition-colors">
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
};
