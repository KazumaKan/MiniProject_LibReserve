import { createContext, useState, useEffect, useContext } from "react";
import { authAPI } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // โหลดข้อมูลจาก localStorage ตอนเปิดเว็บ
  useEffect(() => {
    const savedToken = localStorage.getItem("authToken");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log("🔄 Restoring session from localStorage");
        setToken(savedToken);
        setUser(parsedUser);
      } catch (err) {
        console.error("⚠️ Invalid user data in localStorage, clearing...", err);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Login
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(email, password);
      if (!response?.user || !response?.token) {
        throw new Error("Invalid response from server");
      }

      setUser(response.user);
      setToken(response.token);
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      console.log("✅ Login success:", response.user);
      return response;
    } catch (err) {
      const msg = err.message || "Login failed";
      setError(msg);
      console.error("❌ Login failed:", msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    console.log("👋 Logging out");
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook ใช้ context ได้โดยตรง
export const useAuth = () => useContext(AuthContext);