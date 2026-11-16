import React, { useState, useEffect } from 'react';
import { reportApi } from '../../api/reportApi';
import { StatCard } from '../common/StatCard';
import { formatCurrency, getFirstDayOfMonth, toInputDate } from '../../utils/formatters';
import {
  Calendar,
  RefreshCw,
  Receipt,
  Truck,
  Home,
  User,
  Car,
  Bike,
  HelpCircle,
  PieChart,
} from 'lucide-react';

const CATEGORY_ICON_MAP = {
  DELIVERY_COST: Truck,
  HOUSEHOLD: Home,
  PERSONAL: User,
  CAR: Car,
  BIKE: Bike,
  MISCELLANEOUS: HelpCircle,
};

export function ExpenseReportView() {
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(toInputDate());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async (start, end) => {
    setLoading(true);
    try {
      const data = await reportApi.getExpenseReport(start, end);
      setReport(data);
    } catch (err) {
      console.error('Failed to fetch expense report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(startDate, endDate);
  }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Date Range Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Categorized Expense Report</h2>
          <p className="text-xs text-slate-500">
            Breakdown of overhead, delivery freight, vehicle, and personal expenditures
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 rounded-xl bg-slate-50/50 text-xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none"
            />
            <span className="text-slate-400 font-bold">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-none"
            />
          </div>

          <button
            onClick={() => fetchReport(startDate, endDate)}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Top StatCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Total Period Expenses"
          value={formatCurrency(report?.totalExpenses || 0)}
          subtitle="Combined outflows across all expense heads"
          icon={Receipt}
          color="amber"
        />

        <StatCard
          title="Active Expense Heads"
          value={report?.categories?.length || 0}
          subtitle="Categories with recorded transactions in range"
          icon={PieChart}
          color="blue"
        />
      </div>

      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {report?.categories?.map((cat) => {
          const IconComponent = CATEGORY_ICON_MAP[cat.category] || HelpCircle;
          const pct = Number(cat.percentageOfTotal) || 0;

          return (
            <div
              key={cat.category}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {cat.category.replace('_', ' ')}
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {cat.transactionCount} transaction{cat.transactionCount > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-extrabold text-slate-900">
                    {formatCurrency(cat.totalAmount)}
                  </div>
                  <div className="text-xs font-bold text-amber-700">{pct}% share</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {(!report?.categories || report.categories.length === 0) && !loading && (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-400">
          No expenses recorded for the selected date range.
        </div>
      )}
    </div>
  );
}
