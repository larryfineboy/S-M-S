// ExamPage.jsx
import React, { useState, useEffect } from "react";
import AdminExamPanel from "../components/AdminExamPanel";
import TeacherExamPanel from "../components/TeacherExamPanel";
import StudentExamPanel from "../components/StudentExamPanel";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { AppWindowMac } from "lucide-react";

const ExamPage = ({ user }) => {
  const { role, userId, assignedClass, firstName, lastName, email } = user;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [navOpen, setNavOpen] = useState(isMobile ? false : true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleNav = () => setNavOpen(!navOpen);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Side Navigation */}
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

        <div className="p-4">
          <h2 className="text-2xl font-bold text-violet-700 flex items-center gap-2">
            <AppWindowMac className="text-violet-700" /> Exam Management
          </h2>
        </div>

        {role === "admin" && <AdminExamPanel />}
        {role === "teacher" && <TeacherExamPanel user={user} />}
        {role === "student" && <StudentExamPanel user={user} />}
      </div>
    </div>
  );
};

export default ExamPage;
