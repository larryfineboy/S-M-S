import React, { useState, useEffect } from "react";
import StatsCardSection from "../components/StatsCard";
import NotificationModal from "../components/NotificationModal";
import FullNotificationModal from "../components/FullNotificationModal";
import CalendarComponent from "../components/CalendarComponent";
import "react-calendar/dist/Calendar.css";
import AttendanceChart from "../components/AttendanceChart";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useNotifications } from "../context/NotificationContext";
import { Ban, LayoutDashboard, Megaphone } from "lucide-react";

const Dashboard = ({ user }) => {
  const { role, userId, assignedClass } = user;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [navOpen, setNavOpen] = useState(isMobile ? false : true);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);

  const { unreadCount } = useNotifications();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleNav = () => setNavOpen(!navOpen);

  return (
    <div className="flex h-full bg-gray-100 dark:bg-slate-900">
      {/* Side Navigation */}
      <Sidebar
        userRole={role}
        navOpen={navOpen}
        toggleNav={toggleNav}
        isMobile={isMobile}
      />
      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          !isMobile && navOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <Header toggleNav={toggleNav} isMobile={isMobile} user={user} />

        <div className="p-4">
          <h2 className="text-2xl font-bold text-violet-800 dark:text-violet-500 flex items-center gap-2">
            <LayoutDashboard /> Dashboard
          </h2>
        </div>

        {/* Stats Cards */}
        <div className="px-4 pb-4 mt-3">
          <StatsCardSection userRole={role} userId={userId} />
        </div>
        {/* Notification Section */}
        <div
          onClick={() => setShowNotifModal(true)}
          className="mx-4 my-2 p-4 bg-violet-200 dark:bg-violet-800 rounded-lg border-l-4 border-violet-600 dark:border-violet-200 shadow cursor-pointer hover:bg-violet-300 dark:hover:bg-violet-900"
        >
          {unreadCount > 0 ? (
            <p className="text-sm text-violet-800 font-medium flex gap-3">
              <Megaphone /> {unreadCount} New Notification
              {unreadCount > 1 ? "s" : ""}! Click to view.
            </p>
          ) : (
            <p className="text-base text-gray-500 dark:text-gray-300 font-medium flex gap-3">
              <Ban className="text-red-600" /> No New Notifications
            </p>
          )}
        </div>

        {/* Attendance Chart */}
        {(user.role === "admin" || user.role === "teacher") && (
          <div className="px-4 pb-4 p-4 mt-3">
            <AttendanceChart
              userId={userId}
              role={role}
              assignedClass={role === "teacher" ? assignedClass : null}
            />
          </div>
        )}

        {/* Calendar Section */}
        <div className="px-4 pb-4 mt-3">
          <CalendarComponent userRole={role} />
        </div>
      </div>

      {/* Notification Modals */}
      {showNotifModal && userId && (
        <NotificationModal
          onSelect={(notif) => {
            setSelectedNotif(notif);
            setShowNotifModal(false);
          }}
          onClose={() => setShowNotifModal(false)}
        />
      )}

      {selectedNotif && (
        <FullNotificationModal
          notification={selectedNotif}
          onClose={() => setSelectedNotif(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
