import React, { useState, useEffect } from 'react';
import { reportApi } from '../../api/reportApi';
import { StatCard } from '../common/StatCard';
import { formatCurrency } from '../../utils/formatters';
import {
  RefreshCw,
  Clock,
  Building2,
  AlertTriangle,
  BadgeAlert,
  ChevronRight,
} from 'lucide-react';

export function PendingFundsView() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await reportApi.getPendingFundsReport();
      setReport(data);
    } catch (err) {
      console.error('Failed to fetch pending funds:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const totalOutstanding = Number(report?.totalOutstanding) || 0;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Pending Funds & Dealer Receivables</h2>
          <p className="text-xs text-slate-500">
            Unsettled payments from dealers with 'PENDING' or 'PARTIALLY_PAID' status
          </p>
        </div>

        <button
          onClick={fetchReport}
          disabled={loading}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Total Outstanding Receivables"
          value={formatCurrency(totalOutstanding)}
          subtitle="Total cash pending collection across dealers"
          icon={Clock}
          color="rose"
        />

        <StatCard
          title="Debtor Dealers"
          value={report?.totalDealers || 0}
          subtitle="Dealers with active unsettled credit bills"
          icon={Building2}
          color="amber"
        />
      </div>

      {/* Dealer Outstanding Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <BadgeAlert className="w-4 h-4 text-rose-600" />
            Dealer Wise Breakdown
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Sorted by outstanding volume
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Dealer Name</th>
                <th className="py-3 px-3">Pending Bills</th>
                <th className="py-3 px-3">Partially Paid Bills</th>
                <th className="py-3 px-4">Share of Receivables</th>
                <th className="py-3 px-4 text-right">Outstanding Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                    Loading pending dealer balances...
                  </td>
                </tr>
              ) : !report?.dealers || report.dealers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    🎉 All dealer bills are fully paid! No outstanding receivables.
                  </td>
                </tr>
              ) : (
                report.dealers.map((dealer, idx) => {
                  const amt = Number(dealer.totalAmount) || 0;
                  const pct = totalOutstanding > 0 ? ((amt / totalOutstanding) * 100).toFixed(1) : '0.0';

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {dealer.dealerName}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          {dealer.pendingCount} pending
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          {dealer.partiallyPaidCount} partial
                        </span>
                      </td>

                      <td className="py-3.5 px-4 w-48">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-rose-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-600">{pct}%</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold text-sm text-rose-700 whitespace-nowrap">
                        {formatCurrency(dealer.totalAmount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
