import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { PRESET_USERS } from '../../utils/constants';
import {
  Sprout,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Receipt,
  Scale,
} from 'lucide-react';

export function LoginPage() {
  const { login, authError } = useUser();
  const { showToast } = useToast();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(authError || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');
    try {
      const user = await login(username.trim(), password);
      showToast(`Welcome back, ${user.username}!`);
    } catch (err) {
      setErrorMessage(err.userMessage || 'Invalid username or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickPreset = (preset) => {
    setUsername(preset.username);
    setPassword(preset.defaultPass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Decorative Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Left Side: Brand & Feature Highlights */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-700 to-green-800 p-8 text-white flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
                <Sprout className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">
                  Shah<span className="text-emerald-200">TradeApp</span>
                </h1>
                <p className="text-[11px] uppercase tracking-wider text-emerald-100/80 font-semibold">
                  Agri Trading & Inventory
                </p>
              </div>
            </div>

            {/* Tagline */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold leading-snug">
                Production-grade Agricultural Bookkeeping
              </h2>
              <p className="text-xs text-emerald-100/90 mt-2 leading-relaxed">
                Track Mandi purchases, dealer sales bills with tare deductions, operational charges, and multi-user audit trails.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="mt-8 space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-600/50 flex items-center justify-center shrink-0 mt-0.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-200" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Live Tare Weight Deduction</div>
                  <div className="text-[10px] text-emerald-100/70">Automatic bag-cut & net rate calculations</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-600/50 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-200" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Automated Profit Reports</div>
                  <div className="text-[10px] text-emerald-100/70">Weighted-average buying cost & margin analysis</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-emerald-600/50 flex items-center justify-center shrink-0 mt-0.5">
                  <Receipt className="w-3.5 h-3.5 text-emerald-200" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Daily Cash Flow & Receivables</div>
                  <div className="text-[10px] text-emerald-100/70">Opening/closing balances & dealer pending dues</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-emerald-600/60 text-[11px] text-emerald-200/80 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Secure Spring Security + Supabase PostgreSQL</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to your account</h3>
            <p className="text-xs text-slate-500 mt-1">
              Enter your operator credentials or select a quick-access profile below.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-slide-up">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin, user1, user2..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick-Access Profiles */}
            <div className="pt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Quick 1-Click Fill:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_USERS.map((preset) => {
                  const isSelected = username === preset.username;
                  return (
                    <button
                      type="button"
                      key={preset.username}
                      onClick={() => handleQuickPreset(preset)}
                      className={`py-1.5 px-2 text-xs font-semibold rounded-xl border text-center transition flex flex-col items-center gap-0.5 ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-bold">{preset.username}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{preset.role}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-lg shadow-emerald-600/30 transition disabled:opacity-50 mt-4"
            >
              {submitting ? 'Authenticating...' : 'Sign In to Ledger'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
