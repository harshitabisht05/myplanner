import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useTheme } from './ThemeContext';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const { theme } = useTheme();

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const showError = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const showInfo = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  const isGta = theme === 'gta';

  return (
    <ToastContext.Provider value={{ addToast, removeToast, showSuccess, showError, showInfo }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-cozy-lg border transition-all animate-in fade-in slide-in-from-bottom-5 duration-300 ${
              isGta
                ? 'bg-slate-950/95 border-emerald-500/60 text-slate-100 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : toast.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                : toast.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                : 'bg-planner-card border-planner-border text-planner-text'
            }`}
          >
            {toast.type === 'success' && (
              <CheckCircle2 className={`w-5 h-5 shrink-0 ${isGta ? 'text-emerald-400' : 'text-emerald-500'}`} />
            )}
            {toast.type === 'error' && (
              <AlertCircle className={`w-5 h-5 shrink-0 ${isGta ? 'text-rose-400' : 'text-rose-500'}`} />
            )}
            {toast.type === 'info' && (
              <Info className={`w-5 h-5 shrink-0 ${isGta ? 'text-sky-400' : 'text-planner-primary'}`} />
            )}

            <div className="flex-1 text-sm font-semibold leading-snug">
              {isGta && toast.type === 'error' && (
                <span className="block text-xs font-black uppercase text-rose-400 tracking-wider mb-0.5">
                  MISSION FAILED
                </span>
              )}
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-planner-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
