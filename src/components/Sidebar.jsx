import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { LibraryBig } from "lucide-react";

const Sidebar = ({ navOpen, toggleNav, isMobile, userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activePath, setActivePath] = useState(location.pathname);

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const links = [
    { label: "Dashboard", path: "/", roles: ["admin", "teacher", "student"] },
    { label: "Students", path: "/students", roles: ["admin", "teacher"] },
    { label: "Teachers", path: "/teachers", roles: ["admin"] },
    {
      label: "Assignments",
      path: "/assignments",
      roles: ["teacher", "student"],
    },
    { label: "Exams", path: "/exams", roles: ["admin", "teacher", "student"] },
    {
      label: "Reports",
      path: "/reports",
      roles: ["admin", "teacher", "student"],
    },
    { label: "Fees", path: "/fee_payments", roles: ["admin", "student"] },
    {
      label: "Messages",
      path: "/messages",
      roles: ["admin", "teacher", "student"],
    },
    { label: "Salary", path: "/salary", roles: ["admin", "teacher"] },
    {
      label: "Settings",
      path: "/settings",
      roles: ["admin", "teacher", "student"],
    },
  ];

  const visibleLinks = links.filter((link) => link.roles.includes(userRole));

  return (
    <motion.div
      initial={{ x: isMobile ? "-100%" : 0 }}
      animate={{ x: navOpen ? 0 : isMobile ? "-100%" : "-250px" }}
      transition={{ duration: 0.3 }}
      className={`fixed z-30 top-0 left-0 h-full w-64 bg-white border-r-4 border-purple-500 p-4 text-purple-800 shadow-lg ${
        isMobile ? "bg-opacity-90" : ""
      }`}
    >
      <div className="text-sm font-semibold mb-8 flex items-center justify-between gap-2">
        <LibraryBig />
        <span>DE-BRAINY CHAMPION SCHOOL</span>
        <button onClick={toggleNav} className="md:hidden font-bold p-1">
          X
        </button>
      </div>

      <nav className="space-y-4">
        {visibleLinks.map((link) => (
          <div
            key={link.label}
            onClick={() => {
              navigate(link.path);
              toggleNav(); // Close sidebar on mobile after clicking
            }}
            className={`hover:border-l-3 border-purple-800 p-2 cursor-pointer hover:bg-purple-100 ${
              activePath === link.path
                ? "bg-purple-200 font-bold border-l-3 border-purple-600"
                : "hover:bg-purple-100"
            }`}
          >
            {link.label}
          </div>
        ))}
      </nav>
    </motion.div>
  );
};

export default Sidebar;
