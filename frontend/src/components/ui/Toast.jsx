import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

// ─── Context ────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

// ─── Hook ────────────────────────────────────────────────────────────────────
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
};

// ─── Config ──────────────────────────────────────────────────────────────────
const VARIANTS = {
  success: {
    icon: CheckCircle2,
    bar: "bg-emerald-500",
    icon_cls: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
  },
  error: {
    icon: XCircle,
    bar: "bg-rose-500",
    icon_cls: "text-rose-400",
    border: "border-rose-500/30",
    bg: "bg-rose-500/10",
    text: "text-rose-300",
  },
  warning: {
    icon: AlertTriangle,
    bar: "bg-amber-500",
    icon_cls: "text-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
  },
  info: {
    icon: Info,
    bar: "bg-indigo-500",
    icon_cls: "text-indigo-400",
    border: "border-indigo-500/30",
    bg: "bg-indigo-500/10",
    text: "text-indigo-300",
  },
};

// ─── Single Toast Item ────────────────────────────────────────────────────────
const ToastItem = ({ toast, onRemove }) => {
  const v = VARIANTS[toast.type] || VARIANTS.info;
  const Icon = v.icon;

  return (
    <div
      className={`
        relative flex items-start gap-3 w-full max-w-sm rounded-xl border
        ${v.border} ${v.bg}
        px-4 py-3.5 shadow-2xl shadow-black/40
        backdrop-blur-md
        animate-slide-in-right
      `}
      style={{ minWidth: "280px" }}
    >
      {/* Accent bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-full ${v.bar}`} />

      {/* Icon */}
      <div className={`shrink-0 mt-0.5 ${v.icon_cls}`}>
        <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
      </div>

      {/* Message */}
      <p className={`flex-1 text-sm font-medium leading-snug ${v.text}`}>
        {toast.message}
      </p>

      {/* Close */}
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 p-0.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/10 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-[2px] rounded-b-xl ${v.bar} opacity-40`}
        style={{
          animation: `toast-shrink ${toast.duration}ms linear forwards`,
        }}
      />
    </div>
  );
};

// ─── Provider ────────────────────────────────────────────────────────────────
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = ++counter.current;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      setTimeout(() => remove(id), duration);
    },
    [remove]
  );

  // Convenience shorthands
  toast.success = (msg, dur) => toast(msg, "success", dur);
  toast.error   = (msg, dur) => toast(msg, "error",   dur);
  toast.warning = (msg, dur) => toast(msg, "warning",  dur);
  toast.info    = (msg, dur) => toast(msg, "info",     dur);

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast portal – fixed top-right */}
      <div
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
