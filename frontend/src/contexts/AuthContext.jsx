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

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoriteToolIds, setFavoriteToolIds] = useState(new Set());
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const fetchFavorites = useCallback(async (currentToken) => {
    if (!currentToken) return;
    setLoadingFavorites(true);
    try {
      const favTools = await apiGetMyFavorites();
      const ids = new Set((favTools || []).map((t) => t.toolId));
      setFavoriteToolIds(ids);
    } catch (error) {
      setFavoriteToolIds(new Set());
    } finally {
      setLoadingFavorites(false);
    }
  }, []);

  useEffect(() => {
    let authUser = localStorage.getItem("authUser");
    authUser = authUser ? JSON.parse(authUser) : null;

    if (authUser) {
      setUser(authUser);
      fetchFavorites(authUser.token);
    }
    setLoading(false);
  }, [fetchFavorites]);

  const login = useCallback(
    async (username, password) => {
      try {
        setLoading(true);
        const response = await apiLogin({ username, password });
        if (response && response.token) {
          setUser(response);
          localStorage.setItem("authUser", JSON.stringify(response));
          await fetchFavorites(response.token);
          router.push("/");
          return true;
        }
        setFavoriteToolIds(new Set());
        return false;
      } catch (error) {
        setFavoriteToolIds(new Set());
        return false;
      } finally {
        setLoading(false);
      }
    },
    [router, fetchFavorites],
  );

  const register = useCallback(async (username, password) => {
    try {
      setLoading(true);
      await apiRegister({ username, password });
      return true;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setFavoriteToolIds(new Set());
    localStorage.removeItem("authUser");
    router.push("/auth/login");
  }, [router]);

  const addFavorite = useCallback(
    async (toolId) => {
      if (!user?.token) return false;
      const previousFavorites = new Set(favoriteToolIds);
      setFavoriteToolIds((prev) => new Set(prev).add(toolId));
      try {
        await apiAddFavorite(toolId);
        return true;
      } catch (error) {
        setFavoriteToolIds(previousFavorites);
        return false;
      }
    },
    [user, favoriteToolIds],
  );

  const removeFavorite = useCallback(
    async (toolId) => {
      if (!user?.token) return false;
      const previousFavorites = new Set(favoriteToolIds);
      setFavoriteToolIds((prev) => {
        const ns = new Set(prev);
        ns.delete(toolId);
        return ns;
      });
      try {
        await apiRemoveFavorite(toolId);
        return true;
      } catch (error) {
        setFavoriteToolIds(previousFavorites);
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
    searchTerm,
    setSearchTerm,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
