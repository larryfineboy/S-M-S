import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import {
  Settings,
  BookOpenCheck,
  Lock,
  UserCog,
  Pencil,
  Mail,
  Phone,
  X,
  List,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";

const SettingsPage = ({ user }) => {
  const { role, firstName, lastName, userId, assignedClass, email, phone } =
    user;
  const [navOpen, setNavOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [editField, setEditField] = useState(null); // 'email' or 'phone'
  const [emailInput, setEmailInput] = useState(email || "");
  const [phoneInput, setPhoneInput] = useState(phone || "");

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Subject form states
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [allClasses, setAllClasses] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [editingSubject, setEditingSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState("");
  const [deletingSubject, setDeletingSubject] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleNav = () => setNavOpen((prev) => !prev);

  const handleProfileUpdateRequest = async () => {
    if (!editField || (!emailInput && !phoneInput)) return;

    try {
      const res = await fetch("/api/requests/profile-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          field: editField,
          newValue: editField === "email" ? emailInput : phoneInput,
          requestedAt: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        toast.success(`Change request for ${editField} sent to admin.`);
        setEditField(null);
      } else {
        throw new Error("Failed to send request");
      }
    } catch (err) {
      console.error(err.message);
      toast.dismiss();
      toast.error("Failed to send request");
      setEditField(null);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return toast.warn("Missing fields!");
    }
    if (newPassword !== confirmPassword) {
      return toast.warn("New passwords do not match.");
    }

    try {
      //use patch here for updating the password, also it should check the currentPassword against the one in the database before proceeding with the change
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, currentPassword, newPassword }),
      });

      if (res.ok) {
        toast.dismiss();
        toast.success("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json();
        throw new Error(data.message || "Password update failed.");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Password Update Failed");
    }
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch("/api/subjects");
        const data = await res.json();
        if (res.ok) {
          setSubjects(data);
        } else {
          console.error("Failed to fetch subjects");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchClasses = async () => {
      try {
        const res = await fetch("/api/classes");
        const data = await res.json();
        if (res.ok) {
          setAllClasses(data);
        } else {
          toast.dismiss();
          toast.warn("Using default class list");
        }
      } catch (err) {
        console.error("Failed to fetch class list");
        setAllClasses(["JSS1", "JSS2", "JSS3", "SSS1", "SSS2", "SSS3"]);
      }
    };

    fetchSubjects();
    fetchClasses();
  }, []);

  const handleClassSelect = (e) => {
    const selected = e.target.value;
    if (selected && !selectedClasses.includes(selected)) {
      setSelectedClasses((prev) => [...prev, selected]);
    }
  };

  const handleClassRemove = (className) => {
    setSelectedClasses(selectedClasses.filter((c) => c !== className));
  };

  const handleAddOrUpdateSubject = async () => {
    if (!newSubject.trim()) {
      toast.dismiss();
      toast.warn("Subject name is required");
      return;
    }
    if (!selectedClasses.length) {
      toast.dismiss();
      toast.warn("Select at least one class");
      return;
    }

    try {
      if (editingSubject) {
        const res = await fetch(`/api/subjects/${editingSubject}/update`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjectName: newSubject.trim(),
            classList: selectedClasses,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          // setSubjects((prev) =>
          //   prev.map((subj) =>
          //     subj.subjectName === editingSubject
          //       ? {
          //           ...subj,
          //           subjectName: newSubject.trim(),
          //           classList: selectedClasses,
          //         }
          //       : subj
          //   )
          // );
          setSubjects((prev) => [...prev, data]);
          toast.dismiss();
          toast.success("Subject updated successfully");
        } else {
          toast.dismiss();
          toast.error("Failed to update subject");
        }
        setEditingSubject(null);
      } else {
        const res = await fetch("/api/subjects/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjectName: newSubject.trim(),
            classList: selectedClasses,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setSubjects((prev) => [...prev, data]);
          toast.dismiss();
          toast.success("Subject added successfully");
        } else {
          toast.dismiss();
          toast.error("Could not add subject");
        }
      }

      setNewSubject("");
      setSelectedClasses([]);
    } catch (err) {
      console.error(err);
    }
    setSubjects((prev) => [
      ...prev,
      { subjectName: newSubject.trim(), classList: selectedClasses },
    ]);
    setNewSubject("");
    setSelectedClasses([]);
    setEditingSubject(null);
  };

  const handleEditSubject = (subject) => {
    setNewSubject(subject.subjectName);
    setSelectedClasses(subject.classList);
    setEditingSubject(subject.subjectName);
    setSubjects((prev) =>
      prev.filter((s) => s.subjectName !== subject.subjectName)
    );
  };

  const handleDeleteSubject = async (subjectName) => {
    setShowConfirmation(false);
    try {
      const res = await fetch(`/api/subjects/${subjectName}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSubjects((prev) =>
          prev.filter((s) => s.subjectName !== subjectName)
        );
        toast.dismiss();
        toast.success("Subject deleted successfully");
      } else {
        toast.dismiss();
        toast.error("Failed to delete subject");
      }
    } catch (err) {
      console.error("Error deleting subject");
    }
    setSubjects((prev) => prev.filter((s) => s.subjectName !== subjectName));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        navOpen={navOpen}
        toggleNav={toggleNav}
        isMobile={isMobile}
        userRole={role}
      />
      <div
        className={`flex-1 flex flex-col ${
          !isMobile && navOpen ? "ml-64" : "ml-0"
        } transition-all duration-300`}
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
        <div className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-purple-700 flex items-center gap-2">
            <Settings className="text-purple-500" /> Settings
          </h2>

          {/* Profile Section */}
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h3 className="text-lg font-semibold text-purple-600 flex items-center gap-2">
              <UserCog className="text-purple-500" /> Profile Info
            </h3>

            <div className="flex gap-2 items-center">
              {editField === "email" ? (
                <>
                  <span className="text-purple-700">Email: </span>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full p-2 border border-purple-300 rounded text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleProfileUpdateRequest}
                    className="text-sm text-white bg-purple-600 rounded px-3 py-1 "
                  >
                    Request Change
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-700">{email}</span>
                  </div>

                  <button onClick={() => setEditField("email")}>
                    <Pencil className="text-purple-400" size={18} />
                  </button>
                </>
              )}
            </div>

            <div className="flex gap-2 items-center">
              {editField === "phone" ? (
                <>
                  <span className="text-purple-700">Contact: </span>
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full p-2 border border-purple-300 rounded text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleProfileUpdateRequest}
                    className="text-sm text-white bg-purple-600 rounded px-3 py-1"
                  >
                    Request Change
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-700">{phone}</span>
                  </div>

                  <button onClick={() => setEditField("phone")}>
                    <Pencil className="text-purple-400" size={18} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h3 className="text-lg font-semibold text-purple-600 flex items-center gap-2">
              <Lock className="text-purple-500" /> Change Password
            </h3>
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border border-purple-300 rounded text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border border-purple-300 rounded text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border border-purple-300 rounded text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handlePasswordChange}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Update Password
            </button>
          </div>

          {/* Admin Subject Management */}
          {role === "admin" && (
            <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
              <h3 className="text-lg font-semibold text-purple-600 flex items-center gap-2">
                <BookOpenCheck className="text-purple-500" /> Manage Subjects
              </h3>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => {
                  setNewSubject(e.target.value.toUpperCase());
                  setSelectedClasses([]);
                }}
                placeholder="Enter subject name"
                className="border border-purple-300 rounded p-2 w-full text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <select
                onChange={handleClassSelect}
                className="border border-purple-300 rounded p-2 w-full text-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                defaultValue=""
              >
                <option value="" disabled>
                  Select class
                </option>
                {allClasses.map((cls) => (
                  <option
                    key={cls}
                    value={cls}
                    disabled={selectedClasses.includes(cls)}
                    className="hover:purple-400"
                  >
                    {cls}
                  </option>
                ))}
              </select>

              {/* Selected Classes Tags */}
              {selectedClasses.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedClasses.map((cls) => (
                    <span
                      key={cls}
                      className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full"
                    >
                      {cls}
                      <button
                        className="hover:text-red-500"
                        onClick={() => handleClassRemove(cls)}
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={handleAddOrUpdateSubject}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                {editingSubject ? "Update" : "Add Subject"}
              </button>

              {/* Subject Display */}
              <div>
                {loading ? (
                  <p>Loading subjects...</p>
                ) : subjects.length === 0 ? (
                  <p className="text-purple-400 font-lg">
                    No subjects created yet.
                  </p>
                ) : (
                  subjects.map((subject, idx) => (
                    <div
                      key={idx}
                      className="mb-4 border p-3 rounded-md shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-purple-600 font-bold">
                            {subject.subjectName}
                          </h4>
                          <p className="text-sm text-purple-500 flex gap-2">
                            <List /> {subject.classList.join(" | ")}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSubject(subject)}
                            className="text-purple-500 hover:text-purple-700"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setShowConfirmation(true);

                              toast.warn(
                                `You are attempting to delete an existing subject - ${subject.subjectName}. Kindly check before confirming!`
                              );
                              setDeletingSubject(subject.subjectName);
                              setMessage(
                                `Are you sure you want to delete this subject - ${
                                  subject.subjectName
                                } for the following class(es): ${subject.classList.join(
                                  ", "
                                )}`
                              );
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          {showConfirmation && (
            <ConfirmModal
              message={message}
              onConfirm={() => handleDeleteSubject(deletingSubject)}
              onCancel={() => setShowConfirmation(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
