import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const logoutTimer = useRef(null);

  const INACTIVITY_LIMIT = 60 * 60 * 1000; // 1 hour

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  }, []);

  const resetTimer = useCallback(() => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    logoutTimer.current = setTimeout(() => {
      setShowWarning(true);
      // After 2 minutes if no activity, logout
      setTimeout(() => logout(), 2 * 60 * 1000);
    }, INACTIVITY_LIMIT - 2 * 60 * 1000);
  }, [logout]);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // Load saved user on startup
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser?.userId) setUser(savedUser);
  }, []);

  // Only run timer when logged in
  useEffect(() => {
    if (!user) return;

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    resetTimer();

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
    };
  }, [user, resetTimer]);

  // Inactivity warning state
  const [showWarning, setShowWarning] = useState(false);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, showWarning, setShowWarning }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
