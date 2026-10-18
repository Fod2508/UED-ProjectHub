import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, clearToast } = useApp();

  if (!toastMessage) return null;

  const bgStyles = {
    success: 'bg-emerald-600 text-white shadow-emerald-500/25',
    warning: 'bg-amber-600 text-white shadow-amber-500/25',
    error: 'bg-rose-600 text-white shadow-rose-500/25',
    info: 'bg-blue-600 text-white shadow-blue-500/25'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 shrink-0" />,
    error: <XCircle className="w-5 h-5 shrink-0" />,
    info: <Info className="w-5 h-5 shrink-0" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border border-white/20 backdrop-blur-md ${
          bgStyles[toastMessage.type]
        }`}
      >
        {icons[toastMessage.type]}
        <div className="text-xs sm:text-sm font-medium leading-relaxed flex-1">
          {toastMessage.text}
        </div>
        <button
          onClick={clearToast}
          className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition"
          aria-label="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
