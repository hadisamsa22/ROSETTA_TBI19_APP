import React, { createContext, useContext, useState, useEffect } from 'react';
import { TransactionNotification } from '../types/accounting';
import { playChimeSound } from '../utils/formatters';

interface NotificationContextType {
  notifications: TransactionNotification[];
  unreadCount: number;
  soundEnabled: boolean;
  toggleSound: () => void;
  addNotification: (notif: Omit<TransactionNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_NOTIFS_KEY = 'tebuireng19_notifications_v1';
const STORAGE_SOUND_KEY = 'tebuireng19_sound_enabled_v1';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<TransactionNotification[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_NOTIFS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    // Default initial notification
    return [
      {
        id: 'notif-init-1',
        timestamp: new Date().toISOString(),
        title: 'Sistem Keuangan Aktif',
        message: 'Aplikasi terhubung ke basis data Google Sheets & modul sinkronisasi akun bank siap digunakan.',
        type: 'alert',
        isRead: false,
      },
    ];
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const val = localStorage.getItem(STORAGE_SOUND_KEY);
    return val !== null ? val === 'true' : true;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_NOTIFS_KEY, JSON.stringify(notifications));
    }
  }, [notifications]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_SOUND_KEY, String(soundEnabled));
    }
  }, [soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const addNotification = (notif: Omit<TransactionNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: TransactionNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setNotifications((prev) => [newNotif, ...prev.slice(0, 49)]); // keep latest 50

    if (soundEnabled) {
      if (notif.type === 'income') {
        playChimeSound('income');
      } else if (notif.type === 'expense') {
        playChimeSound('expense');
      } else {
        playChimeSound('alert');
      }
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        soundEnabled,
        toggleSound,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
