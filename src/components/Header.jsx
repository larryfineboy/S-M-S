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

const Header = ({ toggleNav, isMobile, user }) => {
  const { firstName, lastName, assignedClass, role, userId, email } = user;
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleProfileModalOpen = () => setShowProfileModal(true);
  const handleProfileModalClose = () => setShowProfileModal(false);

  const { logout } = useAuth();

  const username = firstName + " " + lastName;

  return (
    <>
      <header className="fixed inset-x-0 top-0 md:left-64 z-20 flex items-center justify-between bg-white dark:bg-violet-900 px-6 py-4 shadow">
        <div className="flex items-center gap-4">
          {isMobile && (
            <button
              onClick={toggleNav}
              className="p-2 hover:bg-violet-100 dark:hover:bg-violet-950 rounded-full"
            >
              <Menu className="text-violet-600 dark:text-violet-100" />
            </button>
          )}
          <div className="w-inherit">
            <h1 className="text-md font-bold text-violet-700 dark:text-white">
              <span className="text-violet-600 dark:text-violet-100 font-semibold">
                Welcome Back,
              </span>{" "}
              {firstName}
            </h1>
            {role === "admin" && (
              <div className="flex items-center gap-1 text-violet-600 dark:text-violet-100">
                <ShieldUser />
                <p>Administration</p>
              </div>
            )}
            {role === "teacher" && (
              <div className="flex items-center gap-1 text-violet-600 dark:text-violet-100">
                <PencilRuler />
                <p>Teacher | {assignedClass}</p>
              </div>
            )}
            {role === "student" && (
              <div className="flex items-center gap-1 text-violet-600 dark:text-violet-100">
                <GraduationCap />
                <p>Student | {assignedClass}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-violet-600 dark:text-violet-100">
          <button
            onClick={() => setShowNotifModal(true)}
            className="p-2 rounded-full hover:bg-violet-100 dark:hover:bg-violet-950"
          >
            <Bell />
          </button>
          <button
            onClick={handleProfileModalOpen}
            className="p-2 rounded-full hover:bg-violet-100 dark:hover:bg-violet-950"
          >
            <User />
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl p-6 w-fit"
          >
            <h2 className="text-lg font-bold mb-1 text-violet-800">
              Profile Info
            </h2>
            <div className="md:flex">
              <div className="flex items-center justify-center">
                {user.image ? (
                  <img
                    src={URL.createObjectURL(user.image)}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-violet-600"
                  />
                ) : (
                  <div className="p-4 bg-violet-200 rounded-full md:max-w-fit">
                    <User className="text-violet-600 w-10 h-10" />
                  </div>
                )}
              </div>

              <div className="md:ml-4 p-4 flex flex-col justify-center items-start font-semibold">
                <p className="text-sm text-violet-800">
                  <span className="text-gray-600 text-lg">Role:</span> {role}
                </p>
                <p className="text-sm text-violet-800">
                  <span className="text-gray-600 text-lg">Name:</span>{" "}
                  {username}
                </p>
                <p className="text-sm text-violet-800">
                  <span className="text-gray-600 text-lg">Email:</span> {email}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <button
                className="mt-1 w-full max-w-2xs bg-red-500 hover:bg-red-600 text-white p-2 rounded flex items-center justify-center gap-2"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
              <button
                className="mt-2 w-full max-w-2xs text-violet-600 font-semibold hover:bg-violet-100 p-2 rounded"
                onClick={handleProfileModalClose}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Header;
