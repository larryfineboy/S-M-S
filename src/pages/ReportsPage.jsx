// ReportsPage.jsx
import React, { useState, useEffect } from "react";
import { SquareLibrary } from "lucide-react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import StudentReportsView from "../components/StudentReportsView";
import AdminTeacherView from "../components/AdminTeacherView";

const ReportsPage = ({ user }) => {
  const { role, userId, assignedClass, firstName, lastName, email } = user;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [navOpen, setNavOpen] = useState(isMobile ? false : true);
  const toggleNav = () => setNavOpen(!navOpen);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        userRole={role}
        navOpen={navOpen}
        toggleNav={toggleNav}
        isMobile={isMobile}
      />
      {/* Main Content */}
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

        <div className="p-4 space-y-4">
          <h2 className="text-2xl font-bold text-purple-700 flex items-center gap-2">
            <SquareLibrary className="text-purple-500" /> Reports
          </h2>

          {role === "student" ? (
            <StudentReportsView studentId={userId} />
          ) : (
            <AdminTeacherView
              role={role}
              userId={userId}
              assignedClass={assignedClass}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
