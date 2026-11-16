import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../context/ToastContext';
import { transactionApi } from '../../api/transactionApi';
import { formatCurrency, formatQuantity } from '../../utils/formatters';
import { PAYMENT_STATUSES } from '../../utils/constants';
import { ArrowUpRight, Calculator, AlertCircle } from 'lucide-react';

export function CreditModal({ isOpen, onClose, onSuccess }) {
  const { currentUser, items } = useUser();
  const { showToast } = useToast();

  const [dealerName, setDealerName] = useState('');
  const [itemId, setItemId] = useState('');
  const [grossQty, setGrossQty] = useState('');
  const [netQty, setNetQty] = useState('');
  const [ratePerUnit, setRatePerUnit] = useState('');
  const [loadingCost, setLoadingCost] = useState('0');
  const [carrierCharges, setCarrierCharges] = useState('0');
  const [paymentStatus, setPaymentStatus] = useState('FULLY_PAID');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (items?.length > 0 && !itemId) {
      setItemId(items[0].id);
    }
  }, [items, itemId]);

  // When grossQty changes, if netQty is empty or equal to previous gross, default it
  const handleGrossChange = (val) => {
    setGrossQty(val);
    if (!netQty || netQty === grossQty) {
      setNetQty(val);
    }
  };

  // Live calculation: Total = (netQty * rate) + loadingCost + carrierCharges
  const { baseAmount, totalBillAmount } = useMemo(() => {
    const n = parseFloat(netQty) || 0;
    const r = parseFloat(ratePerUnit) || 0;
    const lc = parseFloat(loadingCost) || 0;
    const cc = parseFloat(carrierCharges) || 0;

    const base = n * r;
    const total = base + lc + cc;

    return {
      baseAmount: base,
      totalBillAmount: total,
    };
  }, [netQty, ratePerUnit, loadingCost, carrierCharges]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!dealerName.trim()) {
      showToast('Dealer or buyer name is required.', 'error');
      return;
    }
    if (!itemId) {
      showToast('Please select a commodity.', 'error');
      return;
    }
    if (!grossQty || parseFloat(grossQty) <= 0) {
      showToast('Gross quantity must be greater than 0.', 'error');
      return;
    }
    if (!netQty || parseFloat(netQty) <= 0) {
      showToast('Net quantity must be greater than 0.', 'error');
      return;
    }
    if (!ratePerUnit || parseFloat(ratePerUnit) <= 0) {
      showToast('Rate per unit must be greater than 0.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await transactionApi.recordCredit({
        dealerName: dealerName.trim(),
        itemId: Number(itemId),
        userId: currentUser.id,
        grossQty: parseFloat(grossQty),
        netQty: parseFloat(netQty),
        ratePerUnit: parseFloat(ratePerUnit),
        loadingCost: parseFloat(loadingCost || 0),
        carrierCharges: parseFloat(carrierCharges || 0),
        paymentStatus,
        description: description.trim() || undefined,
      });

      showToast(`Sale bill to "${dealerName}" recorded successfully!`);
      onClose();
      onSuccess?.();
    } catch (err) {
      showToast(err.userMessage || 'Failed to record credit transaction.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedItem = items.find((i) => i.id === Number(itemId));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Sale / Bill (Credit)"
      subtitle="Generate dealer billing with operational charges (loading & carrier freight)"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dealer Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Dealer / Buyer Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={dealerName}
            onChange={(e) => setDealerName(e.target.value)}
            placeholder="e.g. Sharma Traders, Rajkot"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            required
          />
        </div>

        {/* Item Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Commodity Sold <span className="text-rose-500">*</span>
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

        {/* Quantities & Rate */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gross Qty ({selectedItem?.unit || 'KG'}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.01"
              value={grossQty}
              onChange={(e) => handleGrossChange(e.target.value)}
              placeholder="e.g. 205"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Net Qty ({selectedItem?.unit || 'KG'}) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              min="0.01"
              value={netQty}
              onChange={(e) => setNetQty(e.target.value)}
              placeholder="e.g. 200"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Selling Rate (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={ratePerUnit}
              onChange={(e) => setRatePerUnit(e.target.value)}
              placeholder="e.g. 42.00"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
        </div>

        {/* Operational Costs Grid */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Loading Charges (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={loadingCost}
              onChange={(e) => setLoadingCost(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Carrier / Freight (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={carrierCharges}
              onChange={(e) => setCarrierCharges(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
          </div>
        </div>

        {/* Payment Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Payment Status <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(PAYMENT_STATUSES).map(([key, conf]) => (
              <button
                type="button"
                key={key}
                onClick={() => setPaymentStatus(key)}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border transition ${
                  paymentStatus === key
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {conf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100 flex items-center justify-between">
          <div className="space-y-0.5 text-xs text-slate-600">
            <div>
              Produce: <span className="font-semibold text-slate-800">{formatCurrency(baseAmount)}</span>
            </div>
            <div>
              Operational Costs: <span className="font-semibold text-slate-800">{formatCurrency(parseFloat(loadingCost || 0) + parseFloat(carrierCharges || 0))}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Total Invoice Amount
            </div>
            <div className="text-xl font-extrabold text-emerald-950">
              {formatCurrency(totalBillAmount)}
            </div>
          </div>
        </div>

        {/* Description / Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Invoice Notes / Delivery Location
          </label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Dispatched via truck GJ-03-AB-1234, delivered to godown #2"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 transition disabled:opacity-50"
          >
            <ArrowUpRight className="w-4 h-4" />
            {submitting ? 'Recording...' : 'Confirm Sale Bill'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
