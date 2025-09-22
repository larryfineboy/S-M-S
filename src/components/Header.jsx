import { useState } from "react";
import {
  Menu,
  Bell,
  User,
  LogOut,
  ShieldUser,
  PencilRuler,
  GraduationCap,
} from "lucide-react";
import NotificationModal from "./NotificationModal";
import FullNotificationModal from "./FullNotificationModal";
import { motion } from "framer-motion"; // ✅ Added missing import
import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = ({
  toggleNav,
  isMobile,
  firstName,
  lastName,
  assignedClass,
  userRole,
  userId,
  email,
}) => {
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleProfileModalOpen = () => setShowProfileModal(true);
  const handleProfileModalClose = () => setShowProfileModal(false);

  const { logout } = useAuth();

  const username = firstName + " " + lastName;

  return (
    <>
      <header className="flex items-center justify-between bg-white px-6 py-4 shadow">
        <div className="flex items-center gap-4">
          {isMobile && (
            <button
              onClick={toggleNav}
              className="p-2 hover:bg-purple-100 rounded-full"
            >
              <Menu className="text-purple-600" />
            </button>
          )}
          <div className="w-inherit">
            <h1 className="text-md font-bold text-purple-700">
              <span className="text-purple-600 font-semibold">
                Welcome Back,
              </span>{" "}
              {firstName}
            </h1>
            {userRole === "admin" && (
              <div className="flex items-center gap-1">
                <ShieldUser className="text-purple-600" />
                <p className="text-purple-700">Administration</p>
              </div>
            )}
            {userRole === "teacher" && (
              <div className="flex items-center gap-1">
                <PencilRuler className="text-purple-600" />
                <p className="text-purple-700">Teacher | {assignedClass}</p>
              </div>
            )}
            {userRole === "student" && (
              <div className="flex items-center gap-1">
                <GraduationCap className="text-purple-600" />
                <p className="text-purple-700">Student | {assignedClass}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNotifModal(true)}
            className="p-2 rounded-full hover:bg-purple-100"
          >
            <Bell className="text-purple-600" />
          </button>
          <button
            onClick={handleProfileModalOpen}
            className="p-2 rounded-full hover:bg-purple-100"
          >
            <User className="text-purple-600" />
          </button>
        </div>
      </header>

      {/* Notification Modal */}
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

      {/* Profile Modal */}
      {showProfileModal && ( // ✅ Corrected condition
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-80"
          >
            <h2 className="text-lg font-bold mb-4 text-purple-800">
              Profile Info
            </h2>
            <div className="flex flex-col items-center mb-4">
              <div className="p-4 bg-purple-200 rounded-full mb-4">
                <User className="text-purple-600 w-10 h-10" />
              </div>
              <p className="text-sm text-purple-800">
                <strong className="text-gray-500">Role:</strong> {userRole}
              </p>
              <p className="text-sm text-purple-800">
                <strong className="text-gray-500">Name:</strong> {username}
              </p>
              <p className="text-sm text-purple-800">
                <strong className="text-gray-500">Email:</strong> {email}
              </p>
            </div>
            <button
              className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white p-2 rounded flex items-center justify-center gap-2"
              onClick={logout}
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
            <button
              className="mt-2 w-full text-purple-600 hover:bg-purple-100 p-2 rounded"
              onClick={handleProfileModalClose}
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Header;
