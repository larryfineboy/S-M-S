import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, DollarSign, ClipboardList } from "lucide-react";

const StatsCardSection = ({ userRole, userId }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/stats?userId=${userId}&role=${userRole}`);
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Stats fallback:", err.message);
        // Temporary fallback values for development
        const fallback = {
          students:
            userRole === "admin"
              ? 120
              : userRole === "teacher"
              ? 35
              : undefined,
          teachers: userRole === "admin" ? 10 : undefined,
          assignments: userRole !== "admin" ? 4 : undefined,
          fees: userRole !== "teacher" ? "$2,500" : undefined,
        };
        setStats(fallback);
      }
    };
    fetchStats();
  }, [userRole, userId]);

  const cardData = [];

  if (userRole === "admin") {
    cardData.push(
      {
        label: "Students",
        value: stats.students,
        icon: <Users className="text-purple-600" />,
        route: "/students",
      },
      {
        label: "Teachers",
        value: stats.teachers,
        icon: <BookOpen className="text-purple-600" />,
        route: "/teachers",
      },
      {
        label: "Fees",
        value: stats.fees,
        icon: <DollarSign className="text-purple-600" />,
        route: "/fees",
      }
    );
  } else if (userRole === "teacher") {
    cardData.push(
      {
        label: "Students",
        value: stats.students,
        icon: <Users className="text-purple-600" />,
        route: "/students",
      },
      {
        label: "Assignments",
        value: stats.assignments,
        icon: <ClipboardList className="text-purple-600" />,
        route: "/assignments",
      }
    );
  } else if (userRole === "student") {
    cardData.push(
      {
        label: "Assignments",
        value: stats.assignments,
        icon: <ClipboardList className="text-purple-600" />,
        route: "/assignments",
      },
      {
        label: "Fees",
        value: stats.fees,
        icon: <DollarSign className="text-purple-600" />,
        route: "/fees",
      }
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
      {cardData.map(({ label, value, icon, route }) => (
        <div
          key={label}
          onClick={() => navigate(route)}
          className="bg-purple-100 text-purple-800 border-2 border-purple-500 shadow-lg rounded-lg p-4 cursor-pointer hover:scale-105 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-200 rounded-full">{icon}</div>
            <div>
              <p className="text-sm font-medium">{label}</p>
              <h2 className="text-xl font-bold">{value ?? "-"}</h2>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCardSection;
