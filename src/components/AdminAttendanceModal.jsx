import React from "react";
import { X } from "lucide-react";

const AdminAttendanceModal = ({ className, attendanceData, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-30 z-50 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-700">
            Attendance Log - {className}
          </h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-700">
            <X />
          </button>
        </div>

        {attendanceData.length === 0 ? (
          <p className="text-center text-gray-400">
            No attendance records found.
          </p>
        ) : (
          attendanceData.map((record, index) => (
            <div key={index} className="mb-6 border rounded-lg p-4 shadow-sm">
              <h3 className="text-purple-600 font-semibold mb-2">
                {new Date(record.date).toDateString()}
              </h3>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {record.students.map((student, idx) => (
                  <li
                    key={idx}
                    className={`p-2 rounded-lg text-sm ${
                      student.status === "present"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {student.name} ({student.studentId}) - {student.status}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAttendanceModal;
