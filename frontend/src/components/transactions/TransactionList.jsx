import React, { useState, useEffect, useMemo } from 'react';
import { transactionApi } from '../../api/transactionApi';
import { TypeBadge, StatusBadge } from '../common/Badge';
import { formatCurrency, formatQuantity, formatDateTime } from '../../utils/formatters';
import { TRANSACTION_TYPES } from '../../utils/constants';
import {
  Search,
  RefreshCw,
  FileSpreadsheet,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Wallet,
  Plus,
} from 'lucide-react';

export function TransactionList({ onOpenActionModal }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let data;
      if (selectedType === 'ALL') {
        data = await transactionApi.listAll();
      } else {
        data = await transactionApi.listByType(selectedType);
      }
      // Sort newest first
      data.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedType]);

  // Client-side search filtering
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter((t) => {
      const matchDealer = t.dealerName?.toLowerCase().includes(q);
      const matchItem = t.itemName?.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchUser = t.username?.toLowerCase().includes(q);
      const matchCat = t.expenseCategory?.toLowerCase().includes(q);
      return matchDealer || matchItem || matchDesc || matchUser || matchCat;
    });
  }, [transactions, searchQuery]);

  // Overall financial summary for filtered list
  const summary = useMemo(() => {
    let debits = 0;
    let credits = 0;
    let expenses = 0;
    let funds = 0;

    filteredTransactions.forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.transactionType === 'DEBIT') debits += amt;
      else if (t.transactionType === 'CREDIT') credits += amt;
      else if (t.transactionType === 'EXPENSE') expenses += amt;
      else if (t.transactionType === 'FUND') funds += amt;
    });

    return { debits, credits, expenses, funds, count: filteredTransactions.length };
  }, [filteredTransactions]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Primary Action Bar - Buy stands out as mostly used, Sell & others easily accessible on all screen sizes */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Main Action Buttons Grid */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 flex-1">
            {/* Standout Buy Button - Visually prominent primary CTA */}
            <button
              onClick={() => onOpenActionModal('DEBIT')}
              className="col-span-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/25 active:scale-95 transition"
              title="Procure commodity with tare cut (Debit)"
            >
              <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span>+ Buy (Debit)</span>
            </button>

            {/* Sell Button */}
            <button
              onClick={() => onOpenActionModal('CREDIT')}
              className="col-span-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition"
              title="Sell commodity to dealer with billing (Credit)"
            >
              <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Sell (Credit)</span>
            </button>

            {/* Expense Button */}
            <button
              onClick={() => onOpenActionModal('EXPENSE')}
              className="col-span-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-200/80 active:scale-95 transition"
              title="Record operational expense"
            >
              <Receipt className="w-4 h-4 text-amber-600" />
              <span>Expense</span>
            </button>

            {/* Fund Button */}
            <button
              onClick={() => onOpenActionModal('FUND')}
              className="col-span-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-semibold text-xs border border-blue-200/80 active:scale-95 transition"
              title="Record capital fund addition or withdrawal"
            >
              <Wallet className="w-4 h-4 text-blue-600" />
              <span>Fund</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Unified Ledger
          </div>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase truncate">
              Debits (Buying)
            </div>
            <div className="text-sm sm:text-base font-bold text-rose-700 truncate">
              {formatCurrency(summary.debits)}
            </div>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase truncate">
              Credits (Sales)
            </div>
            <div className="text-sm sm:text-base font-bold text-emerald-700 truncate">
              {formatCurrency(summary.credits)}
            </div>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase truncate">
              Expenses
            </div>
            <div className="text-sm sm:text-base font-bold text-amber-700 truncate">
              {formatCurrency(summary.expenses)}
            </div>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 uppercase truncate">
              Capital Funds
            </div>
            <div className="text-sm sm:text-base font-bold text-blue-700 truncate">
              {formatCurrency(summary.funds)}
            </div>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        {/* Type Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              selectedType === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({transactions.length})
          </button>

          {Object.entries(TRANSACTION_TYPES).map(([typeKey, conf]) => (
            <button
              key={typeKey}
              onClick={() => setSelectedType(typeKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                selectedType === typeKey
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {conf.shortLabel}
            </button>
          ))}
        </div>

        {/* Search Input & Refresh Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dealer, item, notes..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
            />
          </div>

          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition shrink-0"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Ledger Table Container */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3 sm:py-3.5 sm:px-4">Date / Time</th>
                <th className="py-3 px-2 sm:py-3.5 sm:px-3">Type</th>
                <th className="py-3 px-3 sm:py-3.5 sm:px-4">Commodity / Particulars</th>
                <th className="py-3 px-2 sm:py-3.5 sm:px-3 text-right">Quantities & Rates</th>
                <th className="py-3 px-3 sm:py-3.5 sm:px-4 text-right">Amount (₹)</th>
                <th className="py-3 px-2 sm:py-3.5 sm:px-3">Status</th>
                <th className="py-3 px-2 sm:py-3.5 sm:px-3 text-right">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading && filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                    Loading transactions...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => {
                  const isDebit = txn.transactionType === 'DEBIT';
                  const isCredit = txn.transactionType === 'CREDIT';
                  const isExpense = txn.transactionType === 'EXPENSE';
                  const isFund = txn.transactionType === 'FUND';

                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/80 transition">
                      {/* Date */}
                      <td className="py-3 px-3 sm:py-3.5 sm:px-4 whitespace-nowrap text-slate-500 font-normal">
                        {formatDateTime(txn.transactionDate)}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3 px-2 sm:py-3.5 sm:px-3 whitespace-nowrap">
                        <TypeBadge type={txn.transactionType} />
                      </td>

                      {/* Particulars */}
                      <td className="py-3 px-3 sm:py-3.5 sm:px-4">
                        {isDebit && (
                          <div>
                            <span className="font-bold text-slate-900">{txn.itemName}</span>
                            {txn.description && (
                              <p className="text-[11px] text-slate-400 truncate max-w-xs">{txn.description}</p>
                            )}
                          </div>
                        )}

                        {isCredit && (
                          <div>
                            <div className="font-bold text-slate-900">
                              {txn.dealerName} <span className="font-normal text-slate-500 text-[11px]">({txn.itemName})</span>
                            </div>
                            {(txn.loadingCost > 0 || txn.carrierCharges > 0) && (
                              <div className="text-[10px] text-slate-500">
                                Ops: Loading ₹{txn.loadingCost || 0} + Freight ₹{txn.carrierCharges || 0}
                              </div>
                            )}
                            {txn.description && (
                              <p className="text-[11px] text-slate-400 truncate max-w-xs">{txn.description}</p>
                            )}
                          </div>
                        )}

                        {isExpense && (
                          <div>
                            <span className="font-bold text-slate-900">{txn.expenseCategory?.replace('_', ' ')}</span>
                            {txn.description && (
                              <p className="text-[11px] text-slate-400 truncate max-w-xs">{txn.description}</p>
                            )}
                          </div>
                        )}

                        {isFund && (
                          <div>
                            <span className="font-bold text-slate-900">Capital Injection</span>
                            {txn.description && (
                              <p className="text-[11px] text-slate-400 truncate max-w-xs">{txn.description}</p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Quantities & Rates */}
                      <td className="py-3 px-2 sm:py-3.5 sm:px-3 text-right whitespace-nowrap">
                        {isDebit && (
                          <div>
                            <div className="font-semibold text-slate-900">
                              Net: {formatQuantity(txn.netQty)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Gross: {txn.grossQty} | Tare: -{txn.tareWeight}kg @ ₹{txn.ratePerUnit}/kg
                            </div>
                          </div>
                        )}

                        {isCredit && (
                          <div>
                            <div className="font-semibold text-slate-900">
                              Net: {formatQuantity(txn.netQty)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Rate: ₹{txn.ratePerUnit}/kg
                            </div>
                          </div>
                        )}

                        {(isExpense || isFund) && (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3 sm:py-3.5 sm:px-4 text-right whitespace-nowrap font-bold text-sm">
                        <span
                          className={
                            isDebit
                              ? 'text-rose-700'
                              : isCredit
                              ? 'text-emerald-700'
                              : isExpense
                              ? 'text-amber-700'
                              : 'text-blue-700'
                          }
                        >
                          {formatCurrency(txn.amount)}
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="py-3 px-2 sm:py-3.5 sm:px-3 whitespace-nowrap">
                        {isCredit && txn.paymentStatus ? (
                          <StatusBadge status={txn.paymentStatus} />
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Operator */}
                      <td className="py-3 px-2 sm:py-3.5 sm:px-3 text-right whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-mono">
                          {txn.username}
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
