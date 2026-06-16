import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { ENABLE_ALERTS } from '../config';

interface AlertProps {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  onClose: (id: string) => void;
}

export const Alert: React.FC<AlertProps> = ({ id, message, type, onClose }) => {
  // Auto dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  if (!ENABLE_ALERTS) return null;

  const bgClass = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200',
  }[type];

  const icon = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  }[type];

  return (
    <div className={`relative flex items-center p-4 rounded-lg shadow-lg border ${bgClass} max-w-sm w-full`}>
      <span className="mr-2">{icon}</span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="absolute top-2 right-2 text-xs hover:opacity-80"
        aria-label="Close alert"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
