import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}

interface NotificationContextType {
  showToast: (title: string, message?: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  notifications: Array<{ id: string; title: string; time: string; read: boolean; type: string }>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [notifications, setNotifications] = useState([
    { id: 'notif-1', title: 'VIP Guest Arrival: John Mathew (Room 101)', time: '10m ago', read: false, type: 'guest' },
    { id: 'notif-2', title: 'Room 204 Housekeeping ready for inspection', time: '25m ago', read: false, type: 'housekeeping' },
    { id: 'notif-3', title: 'New Maintenance Ticket logged for Room 108', time: '1h ago', read: true, type: 'maintenance' },
    { id: 'notif-4', title: 'Payment received: ₹18,480 for Booking BK-7801', time: '2h ago', read: true, type: 'payment' },
  ]);

  const showToast = useCallback((title: string, message?: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, title, message, type }]);

    // Also add to notification dropdown history
    setNotifications(prev => [
      { id: `notif-${Date.now()}`, title: message ? `${title}: ${message}` : title, time: 'Just now', read: false, type },
      ...prev
    ]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ showToast, removeToast, notifications, markAsRead, markAllAsRead }}>
      {children}
      {/* Floating Toasts Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-luxury border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              t.type === 'success'
                ? 'bg-white/95 border-emerald-200 text-navy-900'
                : t.type === 'error'
                ? 'bg-white/95 border-red-200 text-navy-900'
                : t.type === 'warning'
                ? 'bg-white/95 border-amber-200 text-navy-900'
                : 'bg-white/95 border-gold-300 text-navy-900'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
              {t.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-gold-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-navy-900">{t.title}</h4>
              {t.message && <p className="text-xs text-navy-600 mt-0.5">{t.message}</p>}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-navy-400 hover:text-navy-700 p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
