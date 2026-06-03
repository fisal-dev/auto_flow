import React, { createContext, useContext, useState, useRef } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import Button from "./Button";
import Card from "./Card";

const ConfirmContext = createContext(null);

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside <ConfirmProvider>");
  return ctx;
};

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    type: "warning" // warning, danger, info
  });

  const resolverRef = useRef(null);

  const confirm = (options = {}) => {
    setState({
      isOpen: true,
      title: options.title || "Are you sure?",
      message: options.message || "",
      confirmText: options.confirmText || "Confirm",
      cancelText: options.cancelText || "Cancel",
      type: options.type || "warning"
    });
    return new Promise((resolve) => {
      resolverRef.current = resolve;
    });
  };

  const handleCancel = () => {
    setState(prev => ({ ...prev, isOpen: false }));
    if (resolverRef.current) resolverRef.current(false);
  };

  const handleConfirm = () => {
    setState(prev => ({ ...prev, isOpen: false }));
    if (resolverRef.current) resolverRef.current(true);
  };

  const getTypeStyles = (type) => {
    if (type === 'danger') return { icon: Trash2, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
    if (type === 'warning') return { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    return { icon: AlertTriangle, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' };
  };

  const styles = getTypeStyles(state.type);
  const IconComponent = styles.icon;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {state.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCancel} />

          {/* Modal content */}
          <div className="relative w-full max-w-[440px] animate-scale-in">
            <Card variant="bordered" className="bg-surface/95 border-white/10 shadow-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none -mr-10 -mt-10" />
              
              <div className="flex gap-4">
                <div className={`p-3 rounded-xl ${styles.bg} ${styles.border} border shrink-0 h-max`}>
                  <IconComponent className={`w-5 h-5 ${styles.color}`} />
                </div>
                
                <div className="flex-grow space-y-2">
                  <h3 className="text-lg font-extrabold text-foreground tracking-tight">{state.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{state.message}</p>
                </div>

                <button 
                  onClick={handleCancel} 
                  className="shrink-0 p-1 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="secondary" onClick={handleCancel}>
                  {state.cancelText}
                </Button>
                <Button 
                  variant={state.type === 'danger' ? 'danger' : 'primary'} 
                  onClick={handleConfirm}
                >
                  {state.confirmText}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
