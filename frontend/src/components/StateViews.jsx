import React from "react";
import { Loader2, AlertCircle, Inbox } from "lucide-react";

export const Loading = ({ label = "Loading..." }) => (
  <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
    <Loader2 className="animate-spin" size={20} />
    <span className="text-sm">{label}</span>
  </div>
);

export const ErrorState = ({ message = "Something went wrong.", onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
    <AlertCircle className="text-red-500" size={28} />
    <p className="text-sm text-slate-500 max-w-sm">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary text-sm">
        Try again
      </button>
    )}
  </div>
);

export const EmptyState = ({ title = "Nothing here yet", subtitle, action }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
    <Inbox className="text-slate-300 dark:text-slate-700" size={32} />
    <div>
      <p className="font-medium text-slate-600 dark:text-slate-300">{title}</p>
      {subtitle && <p className="text-sm text-slate-400 mt-1 max-w-sm">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const StatusBadge = ({ status }) => {
  const map = {
    uploaded: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    processing: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    indexed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  };
  return <span className={`badge ${map[status] || map.uploaded}`}>{status}</span>;
};
