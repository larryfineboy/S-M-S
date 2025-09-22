import { useState, useEffect } from "react";
import { fetchDashboardStats } from "../api/dataService";

export const useDashboardStats = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const loadStats = async () => {
      const data = await fetchDashboardStats();
      setStats(data);
    };
    loadStats();
  }, []);

  return stats;
};
