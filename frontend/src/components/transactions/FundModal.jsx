import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { transactionApi } from '../../api/transactionApi';
import { formatCurrency } from '../../utils/formatters';
import { Wallet, AlertCircle } from 'lucide-react';

export function FundModal({ isOpen, onClose, onSuccess }) {
  const { currentUser } = useUser();
  const { showToast } = useToast();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      showToast('Fund amount must be greater than 0.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await transactionApi.recordFund({
        userId: currentUser.id,
        amount: parseFloat(amount),
        description: description.trim() || undefined,
      });

      showToast(`Capital adjustment of ${formatCurrency(amount)} recorded successfully!`);
      onClose();
      onSuccess?.();
    } catch (err) {
      showToast(err.userMessage || 'Failed to record fund transaction.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Capital Injection / Fund"
      subtitle="Inject working capital or credit adjustment into the trading ledger"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Capital Amount (₹) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 500000.00"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Description / Source */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Source / Remarks
          </label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Bank credit limit deposit, partner capital injection"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/30 transition disabled:opacity-50"
          >
            <Wallet className="w-4 h-4" />
            {submitting ? 'Recording...' : 'Deposit Capital'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
