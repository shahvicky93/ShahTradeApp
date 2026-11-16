import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { transactionApi } from '../../api/transactionApi';
import { formatCurrency, formatQuantity } from '../../utils/formatters';
import { ArrowDownLeft, AlertCircle, Calculator } from 'lucide-react';

export function DebitModal({ isOpen, onClose, onSuccess }) {
  const { currentUser, items } = useUser();
  const { showToast } = useToast();

  const [itemId, setItemId] = useState('');
  const [grossQty, setGrossQty] = useState('');
  const [tareWeight, setTareWeight] = useState('5.00'); // Default common 5kg bag cut
  const [ratePerUnit, setRatePerUnit] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auto-select first item if available
  React.useEffect(() => {
    if (items?.length > 0 && !itemId) {
      setItemId(items[0].id);
    }
  }, [items, itemId]);

  // Real-time calculations
  const { netQty, totalAmount, isValidTare } = useMemo(() => {
    const g = parseFloat(grossQty) || 0;
    const t = parseFloat(tareWeight) || 0;
    const r = parseFloat(ratePerUnit) || 0;

    const net = g - t;
    const total = net > 0 ? net * r : 0;
    const valid = g > 0 && net > 0;

    return {
      netQty: net > 0 ? net : 0,
      totalAmount: total,
      isValidTare: t >= 0 && (g === 0 || t < g),
    };
  }, [grossQty, tareWeight, ratePerUnit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!itemId) {
      showToast('Please select a commodity.', 'error');
      return;
    }
    if (!grossQty || parseFloat(grossQty) <= 0) {
      showToast('Gross quantity must be greater than 0.', 'error');
      return;
    }
    if (!isValidTare) {
      showToast('Tare weight cannot be greater than or equal to gross quantity.', 'error');
      return;
    }
    if (!ratePerUnit || parseFloat(ratePerUnit) <= 0) {
      showToast('Rate per unit must be greater than 0.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await transactionApi.recordDebit({
        itemId: Number(itemId),
        userId: currentUser.id,
        grossQty: parseFloat(grossQty),
        tareWeight: parseFloat(tareWeight || 0),
        ratePerUnit: parseFloat(ratePerUnit),
        description: description.trim() || undefined,
      });

      showToast('Buying (Debit) transaction recorded successfully!');
      onClose();
      onSuccess?.();
    } catch (err) {
      showToast(err.userMessage || 'Failed to record debit transaction.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedItem = items.find((i) => i.id === Number(itemId));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Purchase (Debit)"
      subtitle="Procure agricultural inventory with tare deduction & rate calculation"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Item Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Commodity / Produce <span className="text-rose-500">*</span>
          </label>
          <select
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            required
          >
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.unit})
              </option>
            ))}
          </select>
        </div>

        {/* Quantities Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gross Quantity ({selectedItem?.unit || 'KG'}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.01"
              value={grossQty}
              onChange={(e) => setGrossQty(e.target.value)}
              placeholder="e.g. 500"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tare Cut / Bag Cut ({selectedItem?.unit || 'KG'}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={tareWeight}
              onChange={(e) => setTareWeight(e.target.value)}
              placeholder="e.g. 5"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
        </div>

        {/* Rate Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Rate per {selectedItem?.unit || 'KG'} (₹) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={ratePerUnit}
            onChange={(e) => setRatePerUnit(e.target.value)}
            placeholder="e.g. 35.00"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50/50 border border-rose-100 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-rose-800 font-medium">
              <Calculator className="w-3.5 h-3.5" />
              Calculated Net Weight:
            </div>
            <div className="text-sm font-bold text-slate-800">
              {formatQuantity(netQty, selectedItem?.unit || 'KG')}
            </div>
            <div className="text-[11px] text-slate-500">
              (Gross {grossQty || 0} − Tare {tareWeight || 0})
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Total Payable
            </div>
            <div className="text-xl font-extrabold text-rose-950">
              {formatCurrency(totalAmount)}
            </div>
          </div>
        </div>

        {/* Description / Mandi Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Notes / Mandi Remarks
          </label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Purchased rice from Rajkot APMC mandi, 50 bags"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          ></textarea>
        </div>

        {/* Operator Audit Note */}
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
            disabled={submitting || !isValidTare}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30 transition disabled:opacity-50"
          >
            <ArrowDownLeft className="w-4 h-4" />
            {submitting ? 'Recording...' : 'Confirm Purchase'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
