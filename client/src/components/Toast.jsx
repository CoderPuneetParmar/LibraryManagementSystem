import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center p-4 min-w-[280px] max-w-md rounded-lg shadow-xl border text-sm transition-all duration-300 ${
      isSuccess
        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
        : 'bg-rose-50 border-rose-200 text-rose-800'
    }`}>
      {isSuccess ? (
        <CheckCircle className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-rose-600 mr-3 flex-shrink-0" />
      )}
      <div className="flex-1 font-medium">{message}</div>
      <button
        onClick={onClose}
        className="ml-3 text-slate-400 hover:text-slate-600 p-1 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
