import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import './Toast.css';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  addToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue>({ addToast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = `t-${Date.now()}`;
    setToasts(t => [...t, { id, message, variant }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);

  const remove = (id: string) => setToasts(t => t.filter(x => x.id !== id));

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-region" aria-live="polite" aria-label="Notifications">
        {toasts.map(t => (
          <ToastItemComp key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItemComp({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const Icon = toast.variant === 'success' ? CheckCircle : toast.variant === 'error' ? AlertTriangle : Info;
  return (
    <div className={`toast toast--${toast.variant}`} role="status">
      <Icon size={16} aria-hidden className="toast__icon" />
      <span className="toast__message">{toast.message}</span>
      <button className="toast__close" onClick={onClose} aria-label="Dismiss notification"><X size={14} /></button>
    </div>
  );
}

export function useToast() { return useContext(ToastContext); }
