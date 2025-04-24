"use client";
import { createContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiLogin, apiRegister } from "@/lib/api";

// *** EXPORT AuthContext HERE ***
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let authUser = localStorage.getItem("authUser"); // Check if user is logged in
    authUser = authUser ? JSON.parse(authUser) : null; // Parse user info from localStorage

    if (authUser) {
      setUser(authUser);
    }
    setLoading(false); // Stop loading after checking localStorage
  }, []);

  const login = useCallback(
    async (username, password) => {
      try {
        setLoading(true); // Start loading
        const response = await apiLogin({ username, password });
        if (response && response.token) {
          setUser(response); // Store basic info
          localStorage.setItem("authUser", JSON.stringify(response)); // Store user info in localStorage
          router.push("/"); // Redirect to home after login
          return true;
        }
        return false; // Login failed (handled by apiLogin likely)
      } catch (error) {
        console.error("Login failed:", error);
        return false;
      } finally {
        setLoading(false); // Stop loading regardless of success or failure
      }
    },
    [router],
  );

  const register = useCallback(async (username, password) => {
    try {
      setLoading(true); // Start loading
      await apiRegister({ username, password });
      // Optionally auto-login after registration or just show success message
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    } finally {
      setLoading(false); // Stop loading regardless of success or failure
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("authUser");
    router.push("/auth/login"); // Redirect to login after logout
  }, [router]);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
