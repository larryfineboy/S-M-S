import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const UserFormModal = ({
  onClose,
  onSubmit,
  editingUser = null,
  type = "student",
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    className: "",
    dateOfBirth: "",
    parentMobile: "",
    parentEmail: "",
    parentSocial: "",
    image: null,
    isActive: false,
    studentId: "",
    teacherId: "",
    assignedClass: "",
    password: "",
  });

  const classOptions = ["JSS 1", "JSS 2", "JSS 3", "SSS 1", "SSS 2", "SSS 3"];

  useEffect(() => {
    if (editingUser) {
      setFormData(editingUser);
    } else {
      if (type === "student") {
        generateStudentIdAndPassword();
      } else if (type === "teacher") {
        generateTeacherIdAndPassword();
      }
    }
  }, [editingUser, type]);

  const generateStudentIdAndPassword = async () => {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    let newSerial = "0001";
    try {
      const res = await fetch("/api/students/last-id");
      const data = await res.json();
      if (data && data.lastStudentId) {
        const lastId = data.lastStudentId;
        const lastYear = lastId.slice(-2);
        const lastSerial = parseInt(lastId.slice(4, 8), 10);
        if (lastYear === currentYear) {
          newSerial = (lastSerial + 1).toString().padStart(4, "0");
        }
      }
    } catch (err) {
      console.error("Error fetching last student ID:", err);
    }
    const studentId = `DBCS${newSerial}${currentYear}`;
    const password = formData.lastName.toUpperCase() || "TEMP";
    setFormData((prev) => ({
      ...prev,
      studentId,
      password,
    }));
  };

  const generateTeacherIdAndPassword = async () => {
    let newSerial = "001";
    try {
      const res = await fetch("/api/teachers/last-id");
      const data = await res.json();
      if (data && data.lastTeacherId) {
        const lastId = data.lastTeacherId;
        const lastSerial = lastId.slice(4, 7);
        const incremented = (parseInt(lastSerial, 10) + 1)
          .toString()
          .padStart(3, "0");
        newSerial = incremented;
      }
    } catch (err) {
      console.error("Error fetching last teacher ID:", err);
    }
    const prenoms = `${formData.firstName?.[0] ?? "X"}${
      formData.lastName?.[0] ?? "X"
    }`.toUpperCase();
    const teacherId = `DBCS${newSerial}${prenoms}`;
    const password = formData.lastName.toUpperCase() || "TEMP";
    setFormData((prev) => ({
      ...prev,
      teacherId,
      password,
    }));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (name === "lastName") {
        const newPrenoms = `${formData.firstName?.[0] ?? "X"}${
          value?.[0] ?? "X"
        }`.toUpperCase();
        setFormData((prev) => ({
          ...prev,
          password: value.toUpperCase(),
          teacherId: prev.teacherId
            ? `DBCS${prev.teacherId.slice(4, 7)}${newPrenoms}`
            : prev.teacherId,
        }));
      } else if (name === "firstName") {
        const newPrenoms = `${value?.[0] ?? "X"}${
          formData.lastName?.[0] ?? "X"
        }`.toUpperCase();
        setFormData((prev) => ({
          ...prev,
          teacherId: prev.teacherId
            ? `DBCS${prev.teacherId.slice(4, 7)}${newPrenoms}`
            : prev.teacherId,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      (type === "student" && !formData.className) ||
      (type === "teacher" && !formData.assignedClass)
    ) {
      toast.info("Please fill in all required fields.");
      return;
    }
    try {
      const newUser = {
        ...formData,
        role: type,
      };

      const endpoint = type === "teacher" ? "/api/teachers" : "/api/students";

      const response = await fetch(endpoint, {
        method: editingUser ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) throw new Error("Failed to add new user!");

      const savedUser = await response.json();
      onSubmit(savedUser);
      toast.dismiss();
      toast.success(
        `${type === "teacher" ? "Teacher" : "Student"} added successfully!`
      );
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error("Something went wrong. Please try again later.");
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg relative shadow-xl">
        <h2 className="text-lg font-bold text-purple-700 mb-4">
          {editingUser ? `Edit ${type}` : `Add New ${type}`}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-purple-800">
          <div className="space-y-3">
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="First Name *"
              className="w-full border rounded border-purple-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Last Name *"
              className="w-full border rounded border-purple-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email *"
              className="w-full border rounded border-purple-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            {type === "student" && (
              <select
                name="className"
                value={formData.className}
                onChange={handleChange}
                className="w-full border rounded border-purple-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Class *</option>
                {classOptions.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            )}

            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full border rounded border-purple-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="file"
              name="image"
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleChange}
              className="w-full border rounded border-purple-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            {type === "student" && (
              <>
                <input
                  type="text"
                  name="parentMobile"
                  value={formData.parentMobile}
                  onChange={handleChange}
                  placeholder="Parent Mobile"
                  className="w-full border rounded border-purple-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="email"
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={handleChange}
                  placeholder="Parent Email"
                  className="w-full border rounded border-purple-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  name="parentSocial"
                  value={formData.parentSocial}
                  onChange={handleChange}
                  placeholder="Parent Social Profile"
                  className="w-full border rounded border-purple-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {!editingUser && (
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={formData.studentId}
                      readOnly
                      className="w-1/2 border rounded border-purple-500 p-2 bg-gray-100"
                      placeholder="Student ID"
                    />
                    <input
                      type="text"
                      value={formData.password}
                      readOnly
                      className="w-1/2 border rounded border-purple-500 p-2 bg-gray-100"
                      placeholder="Password"
                    />
                  </div>
                )}
              </>
            )}
            {type === "teacher" && (
              <>
                <select
                  name="assignedClass"
                  value={formData.assignedClass}
                  onChange={handleChange}
                  className="w-full border rounded border-purple-300 p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Assigned Class *</option>
                  {classOptions.map((assignedClass) => (
                    <option key={assignedClass} value={assignedClass}>
                      {assignedClass}
                    </option>
                  ))}
                </select>
                {!editingUser && (
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={formData.teacherId}
                      readOnly
                      className="w-1/2 border rounded border-purple-500 p-2 bg-gray-100"
                      placeholder="Teacher ID"
                    />
                    <input
                      type="text"
                      value={formData.password}
                      readOnly
                      className="w-1/2 border rounded border-purple-500 p-2 bg-gray-100"
                      placeholder="Password"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-red-300 text-white rounded hover:bg-red-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              {editingUser ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
