import React from "react";
import { motion } from "framer-motion";

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-lg p-6 w-80 text-center"
      >
        <p className="text-violet-700 font-semibold mb-4">{message} ?</p>
        <div className="flex justify-around">
          <button
            onClick={onConfirm}
            className="bg-violet-500 text-white px-4 py-2 rounded hover:bg-violet-600"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmModal;
