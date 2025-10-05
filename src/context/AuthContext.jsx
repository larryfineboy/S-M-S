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
  const [loading, setLoading] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
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
      setTimeout(() => logout(), 2 * 60 * 1000);
    }, INACTIVITY_LIMIT - 2 * 60 * 1000);
  }, [logout]);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const verifyUser = async (user) => {
    const res = await fetch(`/api/auth/verify?userId=${user.userId}`);
    return res.ok;
  };

  //  Load saved user before rendering app
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser?.userId) {
      verifyUser(savedUser); //Fix: Check if any errors are raised before setting user
      setUser(savedUser);
    }
    setLoading(false); //  mark as done
  }, []);

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

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, showWarning, setShowWarning }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
