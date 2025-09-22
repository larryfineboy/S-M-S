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
  const { role, userId, assignedClass, firstName, lastName, email } = user;
  const [navOpen, setNavOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
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
    <div className="flex h-full bg-gray-100">
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
        <Header
          toggleNav={toggleNav}
          isMobile={isMobile}
          firstName={firstName}
          lastName={lastName}
          assignedClass={assignedClass}
          userRole={role}
          userId={userId}
          email={email}
        />

        <div className="p-4">
          <h2 className="text-2xl font-bold text-violet-700 flex items-center gap-2">
            <LayoutDashboard className="text-violet-500" /> Dashboard
          </h2>
        </div>

        {/* Stats Cards */}
        <div className="px-4 pb-4 p-1 mt-3">
          <StatsCardSection userRole={role} userId={userId} />
        </div>
        {/* Notification Section */}
        <div
          onClick={() => setShowNotifModal(true)}
          className="mx-4 my-2 p-4 bg-violet-100 rounded-lg border-l-4 border-violet-500 shadow cursor-pointer hover:bg-violet-200"
        >
          {unreadCount > 0 ? (
            <p className="text-sm text-violet-800 font-medium flex gap-3">
              <Megaphone className="text-violet-800" /> {unreadCount} New
              Notification{unreadCount > 1 ? "s" : ""}! Click to view.
            </p>
          ) : (
            <p className="text-sm text-gray-500 font-medium flex gap-3">
              <Ban className="text-red-400" /> No New Notifications
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
        <div className="px-4 pb-4 p-4">
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
