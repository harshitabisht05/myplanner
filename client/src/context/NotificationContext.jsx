import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationApi } from '../api/notificationApi';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(() => {
    return typeof window !== 'undefined' && window.Notification && Notification.permission === 'granted';
  });

  const fetchNotifications = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await notificationApi.getNotifications();
      if (res?.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const requestBrowserPermission = async () => {
    if (typeof window === 'undefined' || !window.Notification) {
      return 'unsupported';
    }
    try {
      const perm = await Notification.requestPermission();
      setHasPermission(perm === 'granted');
      return perm;
    } catch (err) {
      return 'denied';
    }
  };

  const triggerLocalNotification = (title, options = {}) => {
    // Web Audio chime effect
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // Audio Context error ignored
    }

    // Browser Notification Popup
    if (typeof window !== 'undefined' && window.Notification && Notification.permission === 'granted') {
      new Notification(title, {
        body: options.body || 'My Little Planner Alert 🌸',
        icon: '/favicon.ico',
        ...options
      });
    }
  };

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item._id === id || item.id === id ? { ...item, isRead: true } : item))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await notificationApi.markAsRead(id);
    } catch (err) {
      // Ignored
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
    try {
      await notificationApi.markAllAsRead();
    } catch (err) {
      // Ignored
    }
  };

  const deleteNotification = async (id) => {
    const target = notifications.find((item) => item._id === id || item.id === id);
    setNotifications((prev) => prev.filter((item) => item._id !== id && item.id !== id));
    if (target && !target.isRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    try {
      await notificationApi.deleteNotification(id);
    } catch (err) {
      // Ignored
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        hasPermission,
        fetchNotifications,
        requestBrowserPermission,
        triggerLocalNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
