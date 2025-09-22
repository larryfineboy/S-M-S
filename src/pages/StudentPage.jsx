import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Eye, Trash, Edit, SquarePen } from "lucide-react";
import { NotificationContext } from "../context/NotificationContext";
import UserFormModal from "../components/UserFormModal";
import UserProfileModal from "../components/UserProfileModal";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { toast } from "react-toastify";
import AdminAttendanceModal from "../components/AdminAttendanceModal";
import ConfirmModal from "../components/ConfirmModal";

const StudentPage = ({ user }) => {
  const { role, userId, assignedClass, firstName, lastName, email } = user;
  const userRole = role;
  const { addNotification } = useContext(NotificationContext);

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedClassName, setSelectedClassName] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState(null);

  const username = `${firstName} ${lastName}`;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [navOpen, setNavOpen] = useState(true);
  const toggleNav = () => setNavOpen(!navOpen);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`/api/students?userId=${userId}`);
        const data = await res.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, [userId]);

  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    if (value) {
      setSelectedClass(null);
    }
  };

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const matchesName = fullName.includes(searchTerm);
    const matchesId = student.studentId?.toLowerCase().includes(searchTerm);

    if (userRole === "teacher") {
      return student.className === assignedClass && (matchesName || matchesId);
    } else if (userRole === "admin") {
      if (searchTerm) {
        return matchesName || matchesId;
      } else if (selectedClass) {
        return student.className === selectedClass;
      } else {
        return false;
      }
    }
  });

  const handleAddStudent = (newStudent) => {
    setStudents((prev) => [
      ...prev,
      { ...newStudent, studentId: newStudent.studentId },
    ]);
    setShowFormModal(false);
    toast.dismiss();
    toast.success("Student added successfully!");

    addNotification({
      userId,
      title: "New Student Added",
      content: `New Student ${newStudent.firstName} ${newStudent.lastName} added by ${username}`,
      link: "/students",
    });
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete student");

      setStudents((prevStudents) =>
        prevStudents.filter((student) => student.studentId !== studentId)
      );

      toast.dismiss();
      toast.success("Student deleted successfully!");
      addNotification({
        userId,
        title: "Student Deleted",
        content: `Student ${studentId} removed by ${username}`,
        link: "/students",
      });
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error(
        "Unable to delete student Info at the moment. Please try again later."
      );
    }
  };

  const handleUpdateStudent = async (updatedStudent) => {
    try {
      const response = await fetch(
        `/api/students/${updatedStudent.studentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedStudent),
        }
      );

      if (!response.ok) throw new Error("Failed to update student");

      const savedStudent = await response.json();

      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.studentId === savedStudent.studentId ? savedStudent : student
        )
      );

      setEditingStudent(null);
      toast.dismiss();
      toast.success("Student data updated successfully!");

      addNotification({
        userId,
        title: "Student Info Updated",
        content: `Student ${updatedStudent.firstName} ${updatedStudent.lastName} updated by ${username}`,
        link: "/students",
      });
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error("Failed to update student data. Please try again later.");
    }
  };

  const handleToggleActivation = async (student) => {
    try {
      const response = await fetch(
        `/api/students/${student.studentId}/toggle-activation`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !student.isActive }),
        }
      );

      if (!response.ok) throw new Error("Failed to update activation status");

      const updatedStudent = await response.json();

      setStudents((prevStudents) =>
        prevStudents.map((s) =>
          s.studentId === updatedStudent.studentId ? updatedStudent : s
        )
      );

      toast.dismiss();
      toast.success(
        `Student ${
          updatedStudent.isActive ? "activated" : "deactivated"
        } successfully!`
      );
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error("Unable to change activation status. Please try again.");
    }
  };

  const handleViewAttendance = async (className) => {
    try {
      setSelectedClassName(className);
      setShowAttendanceModal(true);

      const res = await fetch(`/api/attendance/${className}`);
      const data = await res.json();
      setAttendanceData(data);
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to load attendance records.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Side Navigation */}
      <Sidebar
        userRole={role}
        navOpen={navOpen}
        toggleNav={toggleNav}
        isMobile={isMobile}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          !isMobile && navOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <Header
          toggleNav={toggleNav}
          isMobile={isMobile}
          firstName={firstName}
          lastName={lastName}
          assignedClass={assignedClass}
          userRole={role}
          userId={userId}
          email={email}
        />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 mt-4 p-4">
          <div className="relative w-full md:max-w-sm">
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full py-2 pl-10 pr-4 border-2 rounded-lg border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-700"
            />
            <Search
              className="absolute left-3 top-2.5 text-purple-400"
              size={20}
            />
          </div>

          {userRole === "teacher" && (
            <Link
              to="/students/attendance"
              state={{
                students: filteredStudents,
                assignedClass: assignedClass,
                teacherId: userId,
              }}
            >
              <button className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                <SquarePen /> Take Attendance
              </button>
            </Link>
          )}

          {userRole === "admin" && (
            <button
              onClick={() => setShowFormModal(true)}
              className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              <Plus size={20} /> Add Student
            </button>
          )}
        </div>

        {userRole === "admin" && !searchTerm && !selectedClass && (
          <div>
            <h2 className="text-purple-500 font-bold text-xl p-4">Classes</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {Array.from(new Set(students.map((s) => s.className))).map(
                (className) => {
                  const studentsInClass = students.filter(
                    (s) => s.className === className
                  );
                  return (
                    <div
                      key={className}
                      onClick={() => setSelectedClass(className)}
                      className="cursor-pointer bg-white shadow-lg hover:bg-purple-100 p-4 border-2 border-purple-500 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-purple-500"
                    >
                      <p className="font-bold">{className}</p>
                      <p>{studentsInClass.length} Student(s)</p>
                      <button
                        onClick={() => handleViewAttendance(className)}
                        className="px-3 py-1 text-purple-500 underline hover:text-purple-800"
                      >
                        View Attendance
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

        {filteredStudents.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredStudents.map((student) => (
              <div
                key={student.studentId}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-purple-700">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-sm text-purple-500">
                      {student.className}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedStudent(student)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <Eye size={18} />
                    </button>
                    {userRole === "admin" && (
                      <>
                        <button
                          onClick={() => setEditingStudent(student)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setMessage(
                              `Are you sure you want to delete ${student.firstName}'s Info with Id - ${student.studentId}`
                            );
                            setShowConfirmation(true);
                            toast.warn(
                              "You're attempting to delete a student's Info. Kindly check before confirming."
                            );
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleActivation(student)}
                          className={`px-3 py-1 rounded ${
                            student.isActive
                              ? "bg-red-400 hover:bg-red-600"
                              : "bg-purple-400 hover:bg-purple-600"
                          } text-white`}
                        >
                          {student.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-8">No students found.</p>
        )}

        {showFormModal && (
          <UserFormModal
            onClose={() => setShowFormModal(false)}
            onSubmit={handleAddStudent}
          />
        )}
        {selectedStudent && (
          <UserProfileModal
            user={selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        )}
        {editingStudent && (
          <UserFormModal
            onClose={() => setEditingStudent(null)}
            onSubmit={handleUpdateStudent}
            editingUser={editingStudent}
          />
        )}
        {showAttendanceModal && (
          <AdminAttendanceModal
            className={selectedClassName}
            attendanceData={attendanceData}
            onClose={() => setShowAttendanceModal(false)}
          />
        )}
        {showConfirmation && (
          <ConfirmModal
            message={message}
            onConfirm={handleDeleteStudent}
            onCancel={() => setShowConfirmation(false)}
          />
        )}
      </div>
    </div>
  );
};

export default StudentPage;
