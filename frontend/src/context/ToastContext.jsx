import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext({
  showToast: () => {},
  error: () => {},
  success: () => {},
  warning: () => {},
  info: () => {}
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, title = null, duration = 4500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, title }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    error: (msg, title) => addToast('error', msg, title),
    success: (msg, title) => addToast('success', msg, title),
    warning: (msg, title) => addToast('warning', msg, title),
    info: (msg, title) => addToast('info', msg, title)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Floating Toast Container */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const isError = t.type === 'error';
          const isSuccess = t.type === 'success';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-4 rounded-2xl border shadow-xl flex items-start gap-3 transition-all animate-in slide-in-from-bottom-5 duration-300 ${
                isError 
                  ? 'bg-rose-950/95 border-rose-800 text-rose-100' 
                  : isSuccess
                  ? 'bg-emerald-950/95 border-emerald-800 text-emerald-100'
                  : isWarning
                  ? 'bg-amber-950/95 border-amber-800 text-amber-100'
                  : 'bg-slate-900/95 border-slate-700 text-slate-100'
              }`}
            >
              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {!isError && !isSuccess && !isWarning && <Info className="w-5 h-5 text-sky-400" />}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                {t.title && (
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5">
                    {t.title}
                  </h4>
                )}
                <p className="text-xs font-medium leading-relaxed opacity-90 break-words">
                  {typeof t.message === 'string' ? t.message : JSON.stringify(t.message)}
                </p>
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
