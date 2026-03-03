import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User } from '../types';
import { UserPlus } from 'lucide-react';

export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const storedAccounts = localStorage.getItem('accounts');
    const accounts: User[] = storedAccounts ? JSON.parse(storedAccounts) : [];

    if (accounts.some((acc) => acc.username.toLowerCase() === username.toLowerCase())) {
      setError('Username already exists.');
      return;
    }

    accounts.push({ username, password });
    localStorage.setItem('accounts', JSON.stringify(accounts));

    setSuccess('✅ Your Account Has Successfully Been Created!');
    setUsername('');
    setPassword('');
    setConfirmPassword('');

    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <div className="min-h-screen pastel-gradient-register flex justify-center items-center p-4">
      <div className="w-full max-w-[440px] glass-card p-10 rounded-3xl animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl mb-4 shadow-sm">
            <UserPlus size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800">Create Account</h2>
          <p className="text-slate-500 mt-2">Join our administrative network</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Username</label>
            <input
              type="text"
              placeholder="Choose a username"
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
              placeholder="Create a password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              className="input-field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="primary-btn bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-200 hover:shadow-emerald-300 mt-4"
          >
            Create Account
          </button>

          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-center text-sm font-medium animate-fade-in border border-rose-100">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl text-center text-sm font-bold animate-fade-in border border-emerald-100">
              {success}
            </div>
          )}
        </form>

        <div className="text-center mt-8">
          <Link to="/" className="text-slate-500 text-sm font-medium hover:text-emerald-600 transition-colors">
            Already have an account? <span className="text-emerald-600 font-bold">Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
