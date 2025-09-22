import { useState, useEffect } from "react";
import { fetchNotifications } from "../api/dataService";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = async () => {
      const data = await fetchNotifications();
      setNotifications(data);
    };
    loadNotifications();
  }, []);

  return { notifications, setNotifications };
};
