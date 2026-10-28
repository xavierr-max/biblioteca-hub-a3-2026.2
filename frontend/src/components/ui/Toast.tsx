import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLibrary();

  if (toasts.length === 0) return null;

  const variantConfig = {
    default: {
      icon: <Info className="w-4 h-4 text-[#6F4E37]" />,
      border: 'border-[#C8A97E]',
    },
    success: {
      icon: <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />,
      border: 'border-[#2E7D32]',
    },
    warning: {
      icon: <AlertTriangle className="w-4 h-4 text-[#B76E00]" />,
      border: 'border-[#B76E00]',
    },
    danger: {
      icon: <AlertCircle className="w-4 h-4 text-[#C62828]" />,
      border: 'border-[#C62828]',
    },
  };

  return (
    <div className="fixed bottom-16 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const cfg = variantConfig[toast.variant || 'default'];
        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 bg-[#FFFDF9] border-l-4 ${cfg.border} border-t border-r border-b border-[#E7DED2] rounded-lg shadow-md animate-in slide-in-from-right-2`}
          >
            <div className="shrink-0 mt-0.5">{cfg.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#2F241C]">{toast.title}</p>
              {toast.description && (
                <p className="text-xs text-[#6D5A4D] mt-0.5">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded text-[#9B887B] hover:text-[#2F241C] transition-colors"
              aria-label="Fechar notificação"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
