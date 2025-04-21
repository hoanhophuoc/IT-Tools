"use client";
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { useRouter } from "next/navigation"; // Use next/navigation with App Router
import { apiLogin, apiRegister, apiFetchUserProfile } from "@/lib/api"; // Assuming API functions exist

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store user info { id, username, role }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Initial check loading state
  const router = useRouter();

  // Check local storage on initial load
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
      // Optionally fetch user profile based on stored token
      apiFetchUserProfile(storedToken)
        .then((userData) => setUser(userData))
        .catch(() => {
          // Handle invalid/expired token
          localStorage.removeItem("authToken");
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false); // No token found
    }
  }, []);

  const login = useCallback(
    async (username, password) => {
      try {
        const response = await apiLogin({ username, password });
        if (response && response.token) {
          setToken(response.token);
          setUser({ username: response.username, role: response.role }); // Store basic info
          localStorage.setItem("authToken", response.token);
          router.push("/"); // Redirect to home after login
          return true;
        }
        return false; // Login failed (handled by apiLogin likely)
      } catch (error) {
        console.error("Login failed:", error);
        return false;
      }
    },
    [router],
  );

  const register = useCallback(async (username, password) => {
    try {
      await apiRegister({ username, password });
      // Optionally auto-login after registration or just show success message
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    router.push("/login"); // Redirect to login after logout
  }, [router]);

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
