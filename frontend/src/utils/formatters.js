/**
 * Formats a number or string as Indian Rupee currency (₹).
 */
export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0.00';
  }
  const num = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Formats a quantity with unit (e.g. "500.00 KG").
 */
export function formatQuantity(qty, unit = 'KG') {
  if (qty === undefined || qty === null || isNaN(qty)) {
    return `0.00 ${unit}`;
  }
  const num = Number(qty);
  return `${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`;
}

/**
 * Formats an ISO datetime string into readable Indian format.
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats an ISO date into "YYYY-MM-DD" for HTML date inputs.
 */
export function toInputDate(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * First day of current month in "YYYY-MM-DD".
 */
export function getFirstDayOfMonth() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
}
