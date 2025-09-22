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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-l shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold mb-2 text-purple-500">
            Notifications
          </h2>
          <button
            className="mt-2 h-10 w-10 text-red-600 rounded p-2 hover:bg-red-300 hover:text-white"
            onClick={onClose}
          >
            X
          </button>
        </div>
        {notifications.length === 0 ? (
          <p className="text-gray-400 text-sm">No notifications available</p>
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
