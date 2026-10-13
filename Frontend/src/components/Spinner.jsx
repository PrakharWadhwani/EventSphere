import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

export const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
    {label}
  </div>
);

export const ErrorBanner = ({ message }) =>
  message ? (
    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
      <p className="text-xs text-rose-300 font-medium leading-relaxed">{message}</p>
    </div>
  ) : null;

export const EmptyState = ({ title, children }) => (
  <div className="py-12 px-6 text-center border border-dashed border-slate-800 rounded-2xl">
    <p className="text-sm font-semibold text-slate-300">{title}</p>
    {children && <p className="text-xs text-slate-500 mt-1">{children}</p>}
  </div>
);
