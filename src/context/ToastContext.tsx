import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { ENABLE_ALERTS } from '../config';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`relative flex items-center p-4 rounded-lg shadow-lg pointer-events-auto transform transition-all duration-300 ease-in-out border ${toast.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' :
              toast.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' :
                'bg-blue-50 text-blue-800 border-blue-200'
              }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 mr-3 text-red-500 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />}

            <p className="font-medium text-sm pr-6">{toast.message}</p>

            <button
              onClick={() => removeToast(toast.id)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity focus:outline-none ${toast.type === 'success' ? 'text-green-800 hover:bg-green-100' :
                toast.type === 'error' ? 'text-red-800 hover:bg-red-100' :
                  'text-blue-800 hover:bg-blue-100'
                }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
