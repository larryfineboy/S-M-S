// App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import StudentPage from "./pages/StudentPage";
import TeacherPage from "./pages/TeacherPage";
import SettingsPage from "./pages/SettingsPage";
import ReportsPage from "./pages/ReportsPage";
import TeacherAttendancePage from "./pages/TeacherAttendancePage";
import AuthPage from "./pages/AuthPage";
import CBTPage from "./pages/CBTPage";
import ExamPage from "./pages/ExamPage";

import InactivityWarning from "./components/InactivityWarning";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ✅ Protects pages from unauthenticated access
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppContent() {
  const { user } = useAuth();

  return (
    <NotificationProvider userId={user?.userId}>
      <ToastContainer position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/cbt" element={<CBTPage user={user} />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <StudentPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers"
            element={
              <ProtectedRoute>
                <TeacherPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/exams"
            element={
              <ProtectedRoute>
                <ExamPage user={user} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/students/attendance"
            element={
              <ProtectedRoute>
                <TeacherAttendancePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <InactivityWarning />
      <AppContent />
    </AuthProvider>
  );
}
