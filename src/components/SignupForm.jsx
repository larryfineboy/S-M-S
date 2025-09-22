import {
  BookDashed,
  CalendarDays,
  CircleUserRound,
  Ellipsis,
  Mail,
  MapPin,
  Phone,
  UserRoundCheck,
  UserRoundPlus,
  Shapes,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";

const SignupForm = () => {
  const [role, setRole] = useState("student"); // student | teacher
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    className: "",
    dateOfBirth: "",
    subjectSpecialty: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role }),
      });

      if (!res.ok) throw new Error("Signup failed");

      toast.success("Application submitted! Awaiting review.");
      toast.info("Check your Email to track application progress.");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        className: "",
        dateOfBirth: "",
        subjectSpecialty: "",
        phone: "",
        address: "",
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
      toast.info("Check your Email to track application progress.");
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      //Make it scrollable
      <div className="space-y-4">
        <label className="block text-l font-semibold text-gray-700">
          First Name
        </label>
        <div className="relative w-full md:max-w-sm">
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            required
            placeholder="i.e John"
          />
          <CircleUserRound
            className="absolute left-3 top-4 text-violet-600"
            size={20}
          />{" "}
        </div>
      </div>
      <div className="space-y-4">
        <label className="block text-l font-semibold text-gray-700">
          Last Name
        </label>
        <div className="relative w-full md:max-w-sm">
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            required
            placeholder="Doe"
          />
          <CircleUserRound
            className="absolute left-3 top-4 text-violet-600"
            size={20}
          />{" "}
        </div>
      </div>
      <div className="space-y-4">
        <label className="block text-l font-semibold text-gray-700">
          Email
        </label>
        <div className="relative w-full md:max-w-sm">
          <input
            type="email"
            name="email"
            value={formData.email}
            autoComplete="email"
            onChange={handleChange}
            className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            required
            placeholder="Email"
          />
          <Mail className="absolute left-3 top-4 text-violet-600" size={20} />
        </div>
      </div>
      <div className="space-y-4">
        <label className="block text-l font-semibold text-gray-700">
          Mobile No.
        </label>
        <div className="relative w-full md:max-w-sm">
          <input
            type="number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            required
            placeholder="O7012345678"
          />
          <Phone className="absolute left-3 top-4 text-violet-600" size={20} />
        </div>
      </div>
      <div className="space-y-4">
        <label className="block text-l font-semibold text-gray-700">
          Applying As
        </label>
        <div className="relative w-full md:max-w-sm">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          >
            <option value="student" className="text-green-700">
              Student
            </option>
            <option value="teacher" className="text-blue-700">
              Teacher
            </option>
          </select>
          <UserRoundCheck
            className="absolute left-3 top-4 text-violet-600"
            size={20}
          />
        </div>
      </div>
      {role === "student" && (
        <div className="space-y-4">
          <label className="block text-l font-semibold text-gray-700">
            D.O.B
          </label>
          <div className="relative w-full md:max-w-sm">
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              placeholder="Jan. 10, 2010"
            />
            <CalendarDays
              className="absolute left-3 top-4 text-violet-600"
              size={20}
            />
          </div>
        </div>
      )}
      {role === "teacher" && (
        <div className="space-y-4">
          <label className="block text-l font-semibold text-gray-700">
            Subject Specialty
          </label>
          <div className="relative w-full md:max-w-sm">
            <input
              type="text"
              name="subjectSpecialty"
              value={formData.subjectSpecialty}
              onChange={handleChange}
              className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              placeholder="Mathematics"
            />
            <BookDashed
              className="absolute left-3 top-4 text-violet-600"
              size={20}
            />
          </div>
        </div>
      )}
      <div className="space-y-4">
        <label className="block text-l font-semibold text-gray-700">
          Class Applying To
        </label>
        <div className="relative w-full md:max-w-sm">
          <input
            type="text"
            name="className"
            value={formData.className}
            onChange={handleChange}
            className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            placeholder="Basic 4"
          />
          <Shapes className="absolute left-3 top-4 text-violet-600" size={20} />
        </div>
      </div>
      <div className="space-y-4">
        <label className="block text-l font-semibold text-gray-700">
          Address
        </label>
        <div className="relative w-full md:max-w-sm">
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            placeholder="5, Appleton Road, Berkshire, L.A"
          />
          <MapPin className="absolute left-3 top-4 text-violet-600" size={20} />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full bg-violet-600 text-white py-2 rounded hover:bg-violet-700 transition"
      >
        {loading ? <Ellipsis size={18} /> : <UserRoundPlus size={18} />}
        {loading ? "Submitting Application" : "Apply Now"}
      </button>
    </form>
  );
};

export default SignupForm;
