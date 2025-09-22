import { motion } from "framer-motion";

const FullNotificationModal = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl p-6 w-96"
      >
        <div className="flex items-center justify-between gap-5">
          <h2 className="text-lg font-bold mb-2 text-purple-500">
            {notification.title}
          </h2>
          <button
            className="mt-2 h-10 w-10 text-red-600 rounded p-2 hover:bg-red-200"
            onClick={onClose}
          >
            X
          </button>
        </div>
        <p className="text-gray-600">{notification.content}</p>
      </motion.div>
    </div>
  );
};

export default FullNotificationModal;
