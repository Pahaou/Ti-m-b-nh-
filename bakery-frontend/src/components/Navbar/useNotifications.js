import { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '../../services/api';

export function useNotifications(user) {
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Notif error', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 120000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return {
    notifications,
    notifOpen,
    setNotifOpen,
    markAsRead,
    fetchNotifications,
  };
}
