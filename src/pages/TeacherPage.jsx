import React, { useState, useEffect, useContext } from "react";
import { Search, Eye, Trash, Edit, Plus } from "lucide-react";
import { NotificationContext } from "../context/NotificationContext";
import UserFormModal from "../components/UserFormModal";
import UserProfileModal from "../components/UserProfileModal";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";

const TeacherPage = ({ user }) => {
  const { role, userId, assignedClass, firstName, lastName, email } = user;
  const userRole = role;
  const { addNotification } = useContext(NotificationContext);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState(null);

  const username = `${firstName} ${lastName}`;
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [navOpen, setNavOpen] = useState(true);
  const toggleNav = () => setNavOpen(!navOpen);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch(`/api/teachers?userId=${userId}`);
        const data = await res.json();
        setTeachers(data);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };
    fetchTeachers();
  }, [userId]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
    const idMatch = `${teacher.teacherId}`.toLowerCase();
    return fullName.includes(searchTerm) || idMatch.includes(searchTerm);
  });

  const handleAddTeacher = (newTeacher) => {
    setTeachers((prev) => [
      ...prev,
      { ...newTeacher, teacherId: newTeacher.teacherId },
    ]);
    setShowFormModal(false);
    toast.dismiss();
    toast.success("Teacher added successfully!");

    addNotification({
      userId,
      title: "New Teacher Added",
      content: `New Teacher ${newTeacher.firstName} ${newTeacher.lastName} updated by ${username}`,
      link: "/teachers",
    });
  };

  const handleDeleteTeacher = async (teacherId) => {
    try {
      const response = await fetch(`/api/teachers/${teacherId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete teacher");
      }

      setTeachers((prev) => prev.filter((t) => t.teacherId !== teacherId));
      toast.dismiss();
      toast.success("Teacher deleted successfully!");

      addNotification({
        userId,
        title: "Teacher Deleted",
        content: `Teacher ${teacherId} removed by ${username}`,
        link: "/teachers",
      });
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error("Unable to delete teacher at the moment.");
    }
  };

  const handleUpdateTeacher = async (updatedTeacher) => {
    try {
      const response = await fetch(
        `/api/teachers/${updatedTeacher.teacherId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedTeacher),
        }
      );

      if (!response.ok) throw new Error("Failed to update teacher");

      const saved = await response.json();
      setTeachers((prev) =>
        prev.map((t) => (t.teacherId === saved.teacherId ? saved : t))
      );
      setEditingTeacher(null);
      toast.dismiss();
      toast.success("Teacher updated successfully!");
      addNotification({
        userId,
        title: "Teacher Info Updated",
        content: `Teacher ${updatedStudent.firstName} ${updatedStudent.lastName} updated by ${username}`,
        link: "/teachers",
      });
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error("Failed to update teacher.");
    }
  };

  const handleToggleActivation = async (teacher) => {
    try {
      const response = await fetch(
        `/api/teachers/${teacher.teacherId}/toggle-activation`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !teacher.isActive }),
        }
      );

      if (!response.ok) throw new Error("Failed to toggle activation");

      const updated = await response.json();
      setTeachers((prev) =>
        prev.map((t) => (t.teacherId === updated.teacherId ? updated : t))
      );
      toast.dismiss();
      toast.success(
        `Teacher ${updated.isActive ? "activated" : "deactivated"}`
      );
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error("Failed to change teacher's status");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 p-1">
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

        {/* Search + Add */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 mt-4 p-4">
          <div className="relative w-full md:max-w-sm">
            <input
              type="text"
              placeholder="Search teacher..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full py-2 pl-10 pr-4 border-2 rounded-lg border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-purple-700"
            />
            <Search
              className="absolute left-3 top-2.5 text-purple-400"
              size={20}
            />
          </div>

          {userRole === "admin" && (
            <button
              onClick={() => setShowFormModal(true)}
              className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              <Plus size={20} /> Add Teacher
            </button>
          )}
        </div>

        {/* Teacher Cards */}
        {filteredTeachers.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.teacherId}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-purple-700">
                      {teacher.firstName} {teacher.lastName}
                    </p>
                    <p className="text-sm text-purple-500">{teacher.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedTeacher(teacher)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <Eye size={18} />
                    </button>
                    {userRole === "admin" && (
                      <>
                        <button
                          onClick={() => setEditingTeacher(teacher)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setMessage(
                              `Are you sure you want to delete ${teacher.firstName}'s Info with Id ${teacher.teacherId}`
                            );
                            setShowConfirmation(true);
                            toast.warn(
                              "You're attempting to delete a teacher's Info. Kindly check before confirming."
                            );
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleActivation(teacher)}
                          className={`px-3 py-1 rounded text-white ${
                            teacher.isActive
                              ? "bg-red-400 hover:bg-red-600"
                              : "bg-purple-400 hover:bg-purple-600"
                          }`}
                        >
                          {teacher.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-8">No teachers found.</p>
        )}

        {/* Modals */}
        {showFormModal && (
          <UserFormModal
            type="teacher"
            onClose={() => setShowFormModal(false)}
            onSubmit={handleAddTeacher}
          />
        )}
        {selectedTeacher && (
          <UserProfileModal
            user={selectedTeacher}
            type="teacher"
            onClose={() => setSelectedTeacher(null)}
          />
        )}
        {editingTeacher && (
          <UserFormModal
            type="teacher"
            onClose={() => setEditingTeacher(null)}
            onSubmit={handleUpdateTeacher}
            editingUser={editingTeacher}
          />
        )}
        {showConfirmation && (
          <ConfirmModal
            message={message}
            onConfirm={handleDeleteTeacher}
            onCancel={() => setShowConfirmation(false)}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherPage;
