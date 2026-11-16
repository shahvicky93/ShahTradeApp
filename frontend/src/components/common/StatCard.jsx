import React from 'react';

export function StatCard({ title, value, subtitle, icon: Icon, color = 'emerald', trend }) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100',
      value: 'text-emerald-950',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-rose-100',
      value: 'text-rose-950',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100',
      value: 'text-amber-950',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100',
      value: 'text-blue-950',
    },
    slate: {
      bg: 'bg-slate-100 text-slate-600',
      border: 'border-slate-200',
      value: 'text-slate-900',
    },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className={`bg-white rounded-2xl p-5 border ${scheme.border} shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
          {title}
        </span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${scheme.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className={`text-2xl font-bold tracking-tight ${scheme.value}`}>
        {value}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          {trend && <span className="font-semibold text-emerald-600">{trend}</span>}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
