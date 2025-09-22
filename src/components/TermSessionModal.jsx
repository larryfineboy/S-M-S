import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const TermSessionModal = ({
  isOpen,
  onClose,
  onSubmit,
  userRole,
  assignedClass,
}) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const sessionStart = currentMonth >= 8 ? currentYear : currentYear - 1;

  const [term, setTerm] = useState("");
  const [session, setSession] = useState(`${sessionStart}/${sessionStart + 1}`);
  const [className, setClassName] = useState(assignedClass);
  const [availableClasses, setAvailableClasses] = useState([]);

  useEffect(() => {
    if (userRole === "admin") {
      const fetchClasses = async () => {
        try {
          const res = await fetch("/api/classes");
          const data = await res.json();
          setAvailableClasses(
            data.length
              ? data
              : ["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"]
          );
        } catch (err) {
          setAvailableClasses(["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"]);
        }
      };
      fetchClasses();
    }
  }, [userRole]);

  const handleSubmit = () => {
    if (!term || !session || (userRole === "admin" && !className)) {
      alert("Please fill all required fields.");
      return;
    }
    onSubmit({ term, session, className });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-lg font-bold text-purple-600 mb-4">
          Select Term & Session
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-purple-700 font-medium mb-1">
              Term
            </label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full border border-purple-400 rounded p-2 focus:ring-2 focus:ring-purple-400 text-purple-700"
            >
              <option value="">-- Select Term --</option>
              <option className="hover:bg-purple-200">First Term</option>
              <option>Second Term</option>
              <option>Third Term</option>
            </select>
          </div>

          <div>
            <label className="block text-purple-700 font-medium mb-1">
              Session
            </label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="w-full border border-purple-400 rounded p-2 focus:ring-2 focus:ring-purple-400 text-purple-700"
            >
              {Array.from({ length: 5 }).map((_, i) => {
                const start = sessionStart - i;
                return (
                  <option key={start} value={`${start}/${start + 1}`}>
                    {start}/{start + 1}
                  </option>
                );
              })}
            </select>
          </div>

          {userRole === "admin" &&
            !assignedClass && ( // Add a condition to check if their is a selected class - "Assigned class"
              <div>
                <label className="block text-purple-700 font-medium mb-1">
                  Class
                </label>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full border border-purple-400 rounded p-2 focus:ring-2 focus:ring-purple-400 text-purple-700"
                >
                  <option value="">-- Select Class --</option>
                  {availableClasses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="text-white bg-red-400 hover:bg-red-600 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-purple-400 hover:bg-purple-600 text-white px-4 py-2 rounded"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TermSessionModal;
