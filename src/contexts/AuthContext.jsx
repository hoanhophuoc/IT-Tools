// src/contexts/AuthContext.jsx
"use client";
import { createContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  apiLogin,
  apiRegister,
  apiGetMyFavorites,
  apiAddFavorite,
  apiRemoveFavorite,
} from "@/lib/api";

// *** EXPORT AuthContext HERE ***
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoriteToolIds, setFavoriteToolIds] = useState(new Set());
  const [loadingFavorites, setLoadingFavorites] = useState(false); // Loading riêng cho favs
  const router = useRouter();

  // Function to fetch favorites (cần token)
  const fetchFavorites = useCallback(async (currentToken) => {
    if (!currentToken) return; // Cần token để gọi API favorites
    setLoadingFavorites(true);
    try {
      console.log("Attempting to fetch favorites with token...");
      // fetchWithAuth sẽ tự động dùng token nếu có trong user state/localStorage
      const favTools = await apiGetMyFavorites();
      const ids = new Set((favTools || []).map((t) => t.toolId));
      console.log("Fetched favorite IDs:", ids);
      setFavoriteToolIds(ids);
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
      setFavoriteToolIds(new Set()); // Reset on error
    } finally {
      setLoadingFavorites(false);
    }
  }, []); // fetchFavorites không phụ thuộc state nội bộ khác

  useEffect(() => {
    let authUser = localStorage.getItem("authUser"); // Check if user is logged in
    authUser = authUser ? JSON.parse(authUser) : null; // Parse user info from localStorage

    if (authUser) {
      setUser(authUser);
      fetchFavorites(authUser.token);
    }
    setLoading(false); // Stop loading after checking localStorage
  }, [fetchFavorites]);

  const login = useCallback(
    async (username, password) => {
      try {
        setLoading(true); // Start loading
        const response = await apiLogin({ username, password });
        if (response && response.token) {
          setUser(response); // Store basic info
          localStorage.setItem("authUser", JSON.stringify(response)); // Store user info in localStorage
          await fetchFavorites(response.token); // *** GỌI FETCH FAVORITES SAU KHI LOGIN ***
          router.push("/"); // Redirect to home after login
          return true;
        }
        setFavoriteToolIds(new Set()); // Xóa fav nếu login fail
        return false; // Login failed (handled by apiLogin likely)
      } catch (error) {
        console.error("Login failed:", error);
        setFavoriteToolIds(new Set()); // Xóa fav nếu login fail
        return false;
      } finally {
        setLoading(false); // Stop loading regardless of success or failure
      }
    },
    [router, fetchFavorites],
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
    setFavoriteToolIds(new Set());
    localStorage.removeItem("authUser");
    router.push("/auth/login"); // Redirect to login after logout
  }, [router]);

  const addFavorite = useCallback(
    async (toolId) => {
      if (!user?.token) return false; // Kiểm tra user và token
      const previousFavorites = new Set(favoriteToolIds);
      setFavoriteToolIds((prev) => new Set(prev).add(toolId)); // Optimistic
      try {
        await apiAddFavorite(toolId); // fetchWithAuth dùng token từ localStorage
        return true;
      } catch (error) {
        console.error("Failed to add favorite:", error);
        setFavoriteToolIds(previousFavorites); // Rollback
        return false;
      }
    },
    [user, favoriteToolIds],
  ); // Phụ thuộc user (để lấy token nếu cần) và fav list

  const removeFavorite = useCallback(
    async (toolId) => {
      if (!user?.token) return false;
      const previousFavorites = new Set(favoriteToolIds);
      setFavoriteToolIds((prev) => {
        const ns = new Set(prev);
        ns.delete(toolId);
        return ns;
      }); // Optimistic
      try {
        await apiRemoveFavorite(toolId);
        return true;
      } catch (error) {
        console.error("Failed to remove favorite:", error);
        setFavoriteToolIds(previousFavorites); // Rollback
        return false;
      }
    },
    [user, favoriteToolIds],
  );

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    loadingFavorites,
    favoriteToolIds,
    addFavorite,
    removeFavorite,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
