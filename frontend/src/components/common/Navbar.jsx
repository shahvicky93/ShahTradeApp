import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import {
  Sprout,
  ChevronDown,
  FileText,
  BarChart3,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Wallet,
  LogOut,
  User,
  Shield,
} from 'lucide-react';

export function Navbar({ activeTab, setActiveTab, onOpenActionModal }) {
  const { currentUser, logout } = useUser();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
              <Sprout className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 leading-tight">
                Shah<span className="text-emerald-600">TradeApp</span>
              </div>
              <div className="hidden xs:block text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-slate-500">
                Agri Trading & Inventory
              </div>
            </div>
          </div>

          {/* Navigation Tabs - Desktop (Hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'ledger'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              Unified Ledger
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'reports'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Reports Engine
            </button>

            <button
              onClick={() => setActiveTab('master')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'master'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              Commodities
            </button>
          </nav>

          {/* Actions & User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Action Buttons - Visible across both mobile and desktop */}
            <div className="flex items-center gap-1.5">
              {/* Standout Primary Buy Button */}
              <button
                onClick={() => onOpenActionModal('DEBIT')}
                className="flex items-center gap-1 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/20 active:scale-95 transition"
                title="Procure commodity with tare deduction (Buy)"
              >
                <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Buy</span>
                <span className="hidden sm:inline">(Debit)</span>
              </button>

              {/* Sell Button */}
              <button
                onClick={() => onOpenActionModal('CREDIT')}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-sm active:scale-95 transition"
                title="Sell commodity to dealer with billing (Sell)"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Sell</span>
                <span className="hidden sm:inline">(Credit)</span>
              </button>

              {/* Secondary Actions (Visible on tablets and larger) */}
              <button
                onClick={() => onOpenActionModal('EXPENSE')}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition"
                title="Record operational expense"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Expense</span>
              </button>

              <button
                onClick={() => onOpenActionModal('FUND')}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
                title="Capital deposit or withdrawal"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Fund</span>
              </button>
            </div>

            {/* Current User Profile & Sign Out (No user switching permitted) */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen((o) => !o)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100 transition text-xs font-medium text-slate-700"
                aria-label="User profile menu"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs uppercase">
                  {currentUser?.username?.[0] || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-slate-800 leading-none">
                    {currentUser?.username || 'User'}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold uppercase mt-0.5">
                    {currentUser?.role?.replace('ROLE_', '') || 'USER'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-scale-up">
                  {/* Logged in User Information */}
                  <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm uppercase">
                        {currentUser?.username?.[0] || 'U'}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-slate-900 text-xs truncate">
                          {currentUser?.username}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold uppercase">
                          <Shield className="w-3 h-3" />
                          {currentUser?.role?.replace('ROLE_', '') || 'USER'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-slate-400">
                      Active Authenticated Session
                    </div>
                  </div>

                  {/* Sign Out Action Only */}
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs flex items-center gap-2 text-rose-600 hover:bg-rose-50 font-semibold transition"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs (Shown on screens < md) */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-slate-100 text-xs font-semibold gap-1">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-center transition ${
              activeTab === 'ledger'
                ? 'bg-emerald-100 text-emerald-900 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Ledger
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-center transition ${
              activeTab === 'reports'
                ? 'bg-emerald-100 text-emerald-900 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('master')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-center transition ${
              activeTab === 'master'
                ? 'bg-emerald-100 text-emerald-900 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Commodities
          </button>
        </div>
      </div>
    </header>
  );
}
