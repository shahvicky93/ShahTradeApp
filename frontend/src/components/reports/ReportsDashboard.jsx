import React, { useState } from 'react';
import { DailyReportView } from './DailyReportView';
import { ProfitReportView } from './ProfitReportView';
import { PendingFundsView } from './PendingFundsView';
import { ExpenseReportView } from './ExpenseReportView';
import { Calendar, TrendingUp, Clock, Receipt } from 'lucide-react';

export function ReportsDashboard() {
  const [activeReportTab, setActiveReportTab] = useState('daily');

  const reportTabs = [
    { id: 'daily', label: 'Daily Balance & Flow', icon: Calendar },
    { id: 'profit', label: 'Settled Bills Profit', icon: TrendingUp },
    { id: 'pending', label: 'Pending Dealer Funds', icon: Clock },
    { id: 'expenses', label: 'Categorized Expenses', icon: Receipt },
  ];

  return (
    <div className="space-y-6">
      {/* Subtabs Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm">
        {reportTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReportTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Report View Content */}
      {activeReportTab === 'daily' && <DailyReportView />}
      {activeReportTab === 'profit' && <ProfitReportView />}
      {activeReportTab === 'pending' && <PendingFundsView />}
      {activeReportTab === 'expenses' && <ExpenseReportView />}
    </div>
  );
}
