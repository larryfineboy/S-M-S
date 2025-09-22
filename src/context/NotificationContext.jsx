// NotificationContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

export const NotificationContext = createContext();

export const NotificationProvider = ({ userId, children }) => {
  const [notifications, setNotifications] = useState([]);

  // Fetch all notifications on app start
  useEffect(() => {
    console.log(userId);
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${userId}`);
        const data = await res.json();
        if (res.ok) {
          setNotifications(data);
        } else {
          console.error("Failed to fetch notifications", data);
        }
      } catch (err) {
        console.error("Error fetching notifications", err);
        toast.error("Failed to fetch notifications");
      }
    };

    fetchNotifications();
  }, [userId]);

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = async ({ userId, title, content, link }) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title,
          content,
          link,
          read: false,
          createdAt: new Date().toISOString(),
        }),
      });
      const newNotif = await res.json();
      if (res.ok) {
        if (newNotif.userId === userId) {
          setNotifications((prev) => [newNotif, ...prev]);
        }
      } else {
        console.error("Failed to add notification", newNotif);
      }
    } catch (err) {
      console.error("Error adding notification", err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        markAsRead,
        addNotification,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
