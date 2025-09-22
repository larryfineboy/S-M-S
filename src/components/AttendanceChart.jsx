import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { RotateCw } from "lucide-react";
import { toast } from "react-toastify";

const AttendanceChart = ({ userId, role, assignedClass }) => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [viewMode, setViewMode] = useState("weekly");
  const [loading, setLoading] = useState(false);

  const currentDate = new Date();

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const url =
        role === "teacher"
          ? `/api/attendance?className=${assignedClass}`
          : `/api/attendance?userId=${userId}`;
      const res = await fetch(url);
      const data = await res.json();
      setAttendanceData(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [userId, role, assignedClass]);

  const formatDate = (date) => {
    const parsed = new Date(date);
    if (isNaN(parsed)) return null; // prevent crash
    return parsed.toISOString().split("T")[0];
  };

  const generateFilteredData = () => {
    if (!attendanceData.length) return [];

    const sorted = [...attendanceData].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    let filtered = [];

    if (viewMode === "weekly") {
      let tempDate = new Date(currentDate);
      const weekdays = [];
      while (weekdays.length < 5) {
        tempDate.setDate(tempDate.getDate() - 1);
        const day = tempDate.getDay();
        if (day !== 0 && day !== 6) {
          const match = sorted.find(
            (r) => formatDate(new Date(r.date)) === formatDate(tempDate)
          );
          if (match) {
            weekdays.unshift({
              date: formatDate(tempDate),
              count: match.present || 0,
            });
          }
        }
      }
      filtered = weekdays;
    } else if (viewMode === "monthly") {
      let tempDate = new Date(currentDate);
      const monthlyData = [];
      for (let i = 0; i < 30; i++) {
        const dateStr = formatDate(tempDate);
        const match = sorted.find(
          (r) => formatDate(new Date(r.date)) === dateStr
        );
        if (match) {
          monthlyData.unshift({ date: dateStr, count: match.present || 0 });
        }
        tempDate.setDate(tempDate.getDate() - 1);
      }
      filtered = monthlyData;
    } else if (viewMode === "yearly") {
      const yearMap = new Map();
      sorted.forEach((r) => {
        const d = new Date(r.date);
        const key = `${d.getFullYear()}-${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
        yearMap.set(key, (yearMap.get(key) || 0) + (r.present || 0));
      });
      const last12Months = [];
      let d = new Date(currentDate);
      for (let i = 0; i < 12; i++) {
        const key = `${d.getFullYear()}-${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
        last12Months.unshift({ date: key, count: yearMap.get(key) || 0 });
        d.setMonth(d.getMonth() - 1);
      }
      filtered = last12Months;
    }
    return filtered;
  };

  const data = generateFilteredData();

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-purple-700">
          Attendance Overview
        </h3>
        <div className="flex gap-2">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className="border border-purple-500 text-purple-500 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <button
            onClick={fetchAttendance}
            className="text-gray-500 hover:text-purple-700"
          >
            <RotateCw size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-10">Loading...</div>
      ) : data.length === 0 ? (
        <div className="text-center text-gray-400 py-10">
          No attendance data found.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis fontSize={12} allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#8884d8"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default AttendanceChart;
