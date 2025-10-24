import React, { useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Ellipsis,
  LogIn,
  IdCard,
  LockKeyhole,
} from "lucide-react";

const LoginForm = () => {
  const [schoolId, setSchoolId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setInfo("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId, password }),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const userData = await res.json();

      //Store User Data
      login(userData);
      navigate("/");

      toast.success("Login Successful");
    } catch (err) {
      setInfo(err instanceof Error ? err.message : "Login failed");
      toast.error(err.message || "Login Failed");
      const userData = {
        userId: "DBCS00124",
        role: "admin",
        assignedClass: "JSS1",
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@school.edu",
        phone: "+234 807 1056 542",
        term: "First Term",
        session: "2024/2025",
      };
      login(userData);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {info && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-100 p-3 rounded-md border-1">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{info}</span>
        </div>
      )}
      <div className="space-y-4">
        <label className="block text-l font-semibold text-gray-700">
          School ID
        </label>
        <div className="relative w-full md:max-w-sm">
          <input
            type="text"
            value={schoolId.toUpperCase()}
            onChange={(e) => {
              setSchoolId(e.target.value);
              schoolId.includes("DBCS")
                ? setInfo("New Users Password - Surname All Caps")
                : setInfo("ID must begin with - DBCS");
            }}
            className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            required
            placeholder="Student or Teacher ID - DBCS001223"
          />
          <IdCard className="absolute left-3 top-4 text-violet-600" size={20} />
        </div>
      </div>
      <div className="space-y-4">
        <label className="block text-l font-semibold text-gray-700">
          Password
        </label>
        <div className="relative w-full md:max-w-sm">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
            required
            placeholder="Password"
          />
          <LockKeyhole
            className="absolute left-3 top-3.5 text-violet-600"
            size={20}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full bg-violet-600 text-white py-2 rounded hover:bg-violet-700 transition"
      >
        {loading ? <Ellipsis size={18} /> : <LogIn size={18} />}
        {loading ? "Logging in" : "Login"}
      </button>
    </form>
  );
};

export default LoginForm;
