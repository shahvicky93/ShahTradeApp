import React, { useState, useEffect } from 'react';
import { reportApi } from '../../api/reportApi';
import { StatCard } from '../common/StatCard';
import { formatCurrency, formatQuantity, getFirstDayOfMonth, toInputDate } from '../../utils/formatters';
import {
  Calendar,
  RefreshCw,
  TrendingUp,
  Receipt,
  Truck,
  ArrowUpRight,
  ShoppingBag,
  Award,
} from 'lucide-react';

export function ProfitReportView() {
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(toInputDate());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async (start, end) => {
    setLoading(true);
    try {
      const data = await reportApi.getProfitReport(start, end);
      setReport(data);
    } catch (err) {
      console.error('Failed to fetch profit report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(startDate, endDate);
  }, [startDate, endDate]);

  const profitMargin = report?.totalRevenue > 0
    ? ((report.totalProfit / report.totalRevenue) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">Settled Bills Profit Report</h2>
          <p className="text-xs text-slate-500">
            Realized margins on fully settled bills (Selling Revenue − Weighted Avg Buying Cost − Operational Charges)
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

      {/* 4 Summary StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Selling Revenue"
          value={formatCurrency(report?.totalRevenue || 0)}
          subtitle="Net Qty × Selling Rate"
          icon={ArrowUpRight}
          color="blue"
        />

        <StatCard
          title="Weighted Buying Cost"
          value={formatCurrency(report?.totalBuyingCost || 0)}
          subtitle="Net Qty × Avg Buy Rate"
          icon={ShoppingBag}
          color="amber"
        />

        <StatCard
          title="Operational Charges"
          value={formatCurrency(report?.totalOperationalCost || 0)}
          subtitle="Loading & Carrier Freight"
          icon={Truck}
          color="rose"
        />

        <StatCard
          title="Realized Net Profit"
          value={formatCurrency(report?.totalProfit || 0)}
          subtitle={`Margin: ${profitMargin}% on sales`}
          trend={`${profitMargin}% margin`}
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Settled Bills Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Settled Bill Line Items ({report?.lineItems?.length || 0})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Only FULLY_PAID bills appear in profit reports
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Txn #</th>
                <th className="py-3 px-4">Dealer / Commodity</th>
                <th className="py-3 px-3 text-right">Net Qty</th>
                <th className="py-3 px-3 text-right">Sell vs Buy Rate</th>
                <th className="py-3 px-3 text-right">Revenue (₹)</th>
                <th className="py-3 px-3 text-right">Buy Cost (₹)</th>
                <th className="py-3 px-3 text-right">Ops (₹)</th>
                <th className="py-3 px-4 text-right">Net Profit (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                    Calculating profit margins...
                  </td>
                </tr>
              ) : !report?.lineItems || report.lineItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No settled bills found for the selected date range.
                  </td>
                </tr>
              ) : (
                report.lineItems.map((item) => {
                  const isPositive = Number(item.profit) >= 0;
                  return (
                    <tr key={item.transactionId} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        #{item.transactionId}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.dealerName}</div>
                        <div className="text-[11px] text-slate-500">{item.itemName}</div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-semibold text-slate-800">
                        {formatQuantity(item.netQty)}
                      </td>

                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="text-emerald-700 font-bold">₹{item.sellingRate}/kg</div>
                        <div className="text-[10px] text-amber-700">Avg Buy: ₹{item.avgBuyingRate}/kg</div>
                      </td>

                      <td className="py-3.5 px-3 text-right font-semibold text-slate-800">
                        {formatCurrency(item.sellingRevenue)}
                      </td>

                      <td className="py-3.5 px-3 text-right text-slate-600">
                        {formatCurrency(item.buyingCost)}
                      </td>

                      <td className="py-3.5 px-3 text-right text-slate-500 text-[11px]">
                        <div>{formatCurrency(item.operationalCost)}</div>
                        {(item.loadingCost > 0 || item.carrierCharges > 0) && (
                          <div className="text-[9px] text-slate-400">
                            L: ₹{item.loadingCost} | C: ₹{item.carrierCharges}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-xl text-xs ${
                            isPositive
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {formatCurrency(item.profit)}
                        </span>
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
