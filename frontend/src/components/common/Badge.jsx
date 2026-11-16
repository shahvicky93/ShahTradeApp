import React from 'react';
import { TRANSACTION_TYPES, PAYMENT_STATUSES } from '../../utils/constants';

export function TypeBadge({ type }) {
  const conf = TRANSACTION_TYPES[type] || {
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    dotColor: 'bg-slate-400',
    shortLabel: type,
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${conf.badgeColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${conf.dotColor}`}></span>
      {conf.shortLabel}
    </span>
  );
}

export function StatusBadge({ status }) {
  const conf = PAYMENT_STATUSES[status] || {
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
    label: status,
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${conf.badgeColor}`}>
      {conf.label}
    </span>
  );
}
