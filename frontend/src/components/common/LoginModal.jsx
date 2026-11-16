import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { PRESET_USERS } from '../../utils/constants';
import { Sprout, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

export function LoginModal({ isOpen, onClose }) {
  const { login, currentUser } = useUser();
  const { showToast } = useToast();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(username, password);
      showToast(`Welcome back, ${username}!`);
      onClose();
    } catch (err) {
      showToast(err.userMessage || 'Login failed. Check credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickPreset = (preset) => {
    setUsername(preset.username);
    setPassword(preset.defaultPass);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 sm:p-8 space-y-6 animate-scale-up">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white mx-auto shadow-md shadow-emerald-500/20">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Sign In to Shah<span className="text-emerald-600">TradeApp</span>
          </h2>
          <p className="text-xs text-slate-500">
            Authenticated via Spring Security HTTP Basic Auth
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin, user1, user2..."
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Quick 1-Click Fill:
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {PRESET_USERS.map((preset) => (
                <button
                  type="button"
                  key={preset.username}
                  onClick={() => handleQuickPreset(preset)}
                  className={`py-1 text-[11px] font-semibold rounded-lg border transition ${
                    username === preset.username
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {preset.username}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition disabled:opacity-50 mt-4"
          >
            {submitting ? 'Verifying...' : 'Sign In to Ledger'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
