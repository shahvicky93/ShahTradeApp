import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { transactionApi } from '../../api/transactionApi';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import { Receipt, AlertCircle } from 'lucide-react';

export function ExpenseModal({ isOpen, onClose, onSuccess }) {
  const { currentUser } = useUser();
  const { showToast } = useToast();

  const [expenseCategory, setExpenseCategory] = useState(EXPENSE_CATEGORIES[0].value);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      showToast('Expense amount must be greater than 0.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await transactionApi.recordExpense({
        userId: currentUser.id,
        expenseCategory,
        amount: parseFloat(amount),
        description: description.trim() || undefined,
      });

      showToast(`Expense of ${formatCurrency(amount)} recorded successfully!`);
      onClose();
      onSuccess?.();
    } catch (err) {
      showToast(err.userMessage || 'Failed to record expense.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Expense"
      subtitle="Track operational costs, mandi transport, or personal expenditures"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Expense Head / Category <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {EXPENSE_CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat.value}
                onClick={() => setExpenseCategory(cat.value)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition ${
                  expenseCategory === cat.value
                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="truncate">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Amount (₹) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 2500.00"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Description / Reason
          </label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Truck freight from godown to mandi, or fuel for car"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          ></textarea>
        </div>

        {/* Operator Note */}
        <div className="text-xs text-slate-500 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
          Recorded by: <span className="font-semibold text-slate-700">{currentUser?.username}</span>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/30 transition disabled:opacity-50"
          >
            <Receipt className="w-4 h-4" />
            {submitting ? 'Recording...' : 'Log Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
