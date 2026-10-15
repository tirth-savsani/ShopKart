import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../axiosCalls/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Global Auth Modal control for easy invocation anywhere
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login"); // "login" | "signup"

  const openAuthModal = (mode = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const response = await axiosInstance.get("/customers/me");
        if (mounted) {
          setUser(response.data);
        }
      } catch {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const response = await axiosInstance.post("/customers/login", { email, password });
    if (response.data?.Customer) {
      setUser(response.data.Customer);
    } else {
      // Re-fetch profile to ensure clean user state
      const meRes = await axiosInstance.get("/customers/me");
      setUser(meRes.data);
    }
    return response.data;
  };

  const signup = async ({ name, email, password, phoneNo }) => {
    const response = await axiosInstance.post("/customers/register", {
      name,
      email,
      password,
      phoneNo,
    });
    if (response.data?.Customer) {
      setUser(response.data.Customer);
    } else {
      const meRes = await axiosInstance.get("/customers/me");
      setUser(meRes.data);
    }
    return response.data;
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/customers/logout");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        signup,
        logout,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
