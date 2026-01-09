// NotificationModal.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

const NotificationModal = ({ onSelect, onClose }) => {
  const { notifications, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleSelect = (notif) => {
    markAsRead(notif.id);
    onSelect(notif);
    if (notif.link) {
      navigate(notif.link);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold mb-2 text-violet-600">
            Notifications
          </h2>
          <button
            className=" h-8 w-8 text-red-600 rounded-full p-1 hover:bg-red-600 hover:text-white font-semibold"
            onClick={onClose}
          >
            X
          </button>
        </div>
        {notifications.length === 0 ? (
          <p className="text-gray-400 font-semibold text-sm">
            No notifications available
          </p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleSelect(n)}
              className={`p-4 mb-2 cursor-pointer hover:border-2 border-purple-500 rounded-lg transition ${
                !n.read ? "bg-purple-100" : "bg-white"
              }`}
            >
              <p className="font-semibold text-purple-800">{n.title}</p>
              <p className="text-gray-500 text-sm line-clamp-2">
                {n.content.substring(0, 50)}...
              </p>
              {n.date && (
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.date).toLocaleString()}
                </p>
              )}
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
};

export default NotificationModal;
