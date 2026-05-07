import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

const TOAST_TIMEOUT = 5000;

export const notify = {
  success: (message) => window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', message } })),
  error: (message) => window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', message } })),
  info: (message) => window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'info', message } })),
};

const Toaster = () => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handleToastEvent = (event) => {
      const { type, message } = event.detail;
      const id = Date.now();
      setToasts((prev) => [...prev, { id, type, message }]);
      
      setTimeout(() => {
        removeToast(id);
      }, TOAST_TIMEOUT);
    };

    window.addEventListener('toast', handleToastEvent);
    return () => window.removeEventListener('toast', handleToastEvent);
  }, [removeToast]);

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const config = {
    success: {
      icon: <CheckCircle2 size={20} />,
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      iconColor: 'text-emerald-500',
      textColor: 'text-emerald-800'
    },
    error: {
      icon: <AlertCircle size={20} />,
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      iconColor: 'text-rose-500',
      textColor: 'text-rose-800'
    },
    info: {
      icon: <Info size={20} />,
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      iconColor: 'text-violet-500',
      textColor: 'text-violet-800'
    }
  };

  const { icon, bgColor, borderColor, iconColor, textColor } = config[toast.type];

  return (
    <div className={`
      pointer-events-auto
      flex items-center gap-3 px-5 py-4 
      rounded-2xl border ${borderColor} ${bgColor} shadow-lg 
      animate-in fade-in slide-in-from-right-8 duration-300
      min-w-[320px] max-w-md
    `}>
      <div className={iconColor}>{icon}</div>
      <p className={`flex-1 text-sm font-bold ${textColor}`}>{toast.message}</p>
      <button 
        onClick={onRemove}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toaster;
