import React, { useState, useEffect } from 'react';
import { reportApi } from '../../api/reportApi';
import { StatCard } from '../common/StatCard';
import { formatCurrency, toInputDate } from '../../utils/formatters';
import {
  Calendar,
  RefreshCw,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Scale,
  TrendingUp,
  Receipt,
} from 'lucide-react';

export function DailyReportView() {
  const [selectedDate, setSelectedDate] = useState(toInputDate());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async (date) => {
    setLoading(true);
    try {
      const data = await reportApi.getDailyReport(date);
      setReport(data);
    } catch (err) {
      console.error('Failed to fetch daily report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(selectedDate);
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      {/* Date Picker Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Daily Balance & Cash Movement</h2>
          <p className="text-xs text-slate-500">
            Calculates opening balance, today's trading inflows & outflows, and closing balance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded-xl bg-slate-50/50 text-xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none"
            />
          </div>

          <button
            onClick={() => fetchReport(selectedDate)}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Summary StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Opening Balance"
          value={formatCurrency(report?.openingBalance || 0)}
          subtitle="Net accumulated funds before date"
          icon={Wallet}
          color="blue"
        />

        <StatCard
          title="Day's Total Inflow"
          value={formatCurrency(report?.totalInflow || 0)}
          subtitle={`Credits: ${formatCurrency(report?.dayCredits || 0)} | Funds: ${formatCurrency(report?.dayFunds || 0)}`}
          icon={ArrowUpRight}
          color="emerald"
        />

        <StatCard
          title="Day's Total Outflow"
          value={formatCurrency(report?.totalOutflow || 0)}
          subtitle={`Debits: ${formatCurrency(report?.dayDebits || 0)} | Exp: ${formatCurrency(report?.dayExpenses || 0)}`}
          icon={ArrowDownLeft}
          color="rose"
        />

        <StatCard
          title="Closing Balance"
          value={formatCurrency(report?.closingBalance || 0)}
          subtitle="Opening + Inflow − Outflow"
          icon={Scale}
          color="emerald"
        />
      </div>

      {/* Detailed Flow Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inflows breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Day Inflows Breakdown
            </h3>
            <span className="text-xs font-bold text-emerald-700">
              {formatCurrency(report?.totalInflow || 0)}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Sales Realization (Credits)</div>
                  <div className="text-[10px] text-slate-500">Revenue from commodities sold</div>
                </div>
              </div>
              <div className="text-xs font-bold text-emerald-800">
                {formatCurrency(report?.dayCredits || 0)}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50/50 border border-blue-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Capital Additions (Funds)</div>
                  <div className="text-[10px] text-slate-500">Working capital or cash deposits</div>
                </div>
              </div>
              <div className="text-xs font-bold text-blue-800">
                {formatCurrency(report?.dayFunds || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Outflows breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Day Outflows Breakdown
            </h3>
            <span className="text-xs font-bold text-rose-700">
              {formatCurrency(report?.totalOutflow || 0)}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/50 border border-rose-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Purchases (Debits)</div>
                  <div className="text-[10px] text-slate-500">Commodity procurement payments</div>
                </div>
              </div>
              <div className="text-xs font-bold text-rose-800">
                {formatCurrency(report?.dayDebits || 0)}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/50 border border-amber-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Expenses & Freight</div>
                  <div className="text-[10px] text-slate-500">Delivery, household, vehicle, etc.</div>
                </div>
              </div>
              <div className="text-xs font-bold text-amber-800">
                {formatCurrency(report?.dayExpenses || 0)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
