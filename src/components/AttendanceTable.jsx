import React from "react";

const AttendanceTable = ({ students, attendanceData, handleChange }) => {
  return (
    <table className="min-w-full text-sm text-left border">
      <thead className="bg-purple-100 text-purple-700">
        <tr>
          <th className="px-4 py-2 border">#</th>
          <th className="px-4 py-2 border">Student Name</th>
          <th className="px-4 py-2 border">ID</th>
          <th className="px-4 py-2 border">Present</th>
          <th className="px-4 py-2 border">Absent</th>
        </tr>
      </thead>
      <tbody className="bg-purple-100 text-purple-700">
        {students.map((student, idx) => (
          <tr key={student.studentId} className="hover:bg-gray-50">
            <td className="px-4 py-2 border">{idx + 1}</td>
            <td className="px-4 py-2 border">
              {student.firstName} {student.lastName}
            </td>
            <td className="px-4 py-2 border">{student.studentId}</td>
            <td className="px-4 py-2 border text-center">
              <input
                type="radio"
                name={`attendance-${student.studentId}`}
                onChange={() => handleChange(student.studentId, "present")}
                checked={attendanceData[student.studentId] === "present"}
              />
            </td>
            <td className="px-4 py-2 border text-center">
              <input
                type="radio"
                name={`attendance-${student.studentId}`}
                onChange={() => handleChange(student.studentId, "absent")}
                checked={attendanceData[student.studentId] === "absent"}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AttendanceTable;
