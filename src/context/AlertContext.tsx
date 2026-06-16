import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Alert } from '../components/Alert';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertItem {
  id: string;
  message: string;
  type: AlertType;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const showAlert = useCallback((message: string, type: AlertType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setAlerts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Auto-cleanup any lingering alerts after 5 seconds (fallback)
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    alerts.forEach(alert => {
      const t = setTimeout(() => removeAlert(alert.id), 5000);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, [alerts]);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            id={alert.id}
            message={alert.message}
            type={alert.type}
            onClose={removeAlert}
          />
        ))}
      </div>
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
