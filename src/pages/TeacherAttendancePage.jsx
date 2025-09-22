import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  CalendarCheck,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import AttendanceTable from "../components/AttendanceTable";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

const TeacherAttendancePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    students = [],
    assignedClass = "",
    teacherId = "",
  } = location.state || {};

  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    if (!assignedClass || !teacherId /*|| students.length === 0*/) {
      toast.error("Missing attendance parameters");
      navigate("/students");
      return;
    }

    const fetchAttendance = async () => {
      try {
        const res = await fetch(
          `/api/attendance?className=${assignedClass}&date=${date}`
        );
        const data = await res.json();
        if (res.ok && Array.isArray(data.records)) {
          const map = {};
          data.records.forEach((rec) => {
            map[rec.studentId] = rec.status;
          });
          setAttendanceData(map);
        } else {
          toast.warn("No previous attendance found");
        }
      } catch (err) {
        toast.error("Failed to load attendance");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [assignedClass, teacherId, date, students, navigate]);

  const handleChange = (studentId, status) => {
    setAttendanceData((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    const entries = Object.entries(attendanceData).map(
      ([studentId, status]) => ({
        studentId,
        status,
        date,
        className: assignedClass,
        teacherId,
      })
    );

    if (!entries.length) {
      toast.warn("Please mark at least one student");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/attendance/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: entries }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Attendance submitted successfully");
        navigate("/students");
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </div>
    );
  }

  return (
    <div className="p-4 h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <CalendarCheck className="text-purple-500" />
          <h2 className="text-2xl font-bold text-purple-700">
            Mark Attendance | {assignedClass} -{" "}
            {format(new Date(date), "MMMM d, yyyy")}
          </h2>
          <div className="flex gap-4 item-center justify-center">
            <CalendarDays className="text-purple-500 mr-2" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded px-3 py-1 border-purple-500 text-purple-500 p-4 h-7 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              disabled={saving}
              onClick={handleSubmit}
              className="text-purple-500 flex items-center flex-col justify-center hover:text-purple-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="animate-spin mr-2 text-purple-600" />
              ) : (
                <CheckCircle className="mr-2 text-purple-500 hover:text-purple-700" />
              )}{" "}
              Save
            </button>
          </div>
        </div>

        <AttendanceTable
          students={students}
          attendanceData={attendanceData}
          handleChange={handleChange}
        />
      </div>
    </div>
  );
};

export default TeacherAttendancePage;
