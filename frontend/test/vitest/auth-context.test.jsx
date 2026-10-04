import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor, renderHook, act } from "@testing-library/react";
import { AuthProvider } from "../../src/contexts/AuthContext.jsx";
import { useAuth } from "../../src/hooks/useAuth.js";
import * as api from "../../src/lib/api";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("../../src/lib/api", () => ({
  apiLogin: vi.fn(),
  apiRegister: vi.fn(),
  apiGetMyFavorites: vi.fn().mockResolvedValue([]),
  apiAddFavorite: vi.fn().mockResolvedValue(true),
  apiRemoveFavorite: vi.fn().mockResolvedValue(true),
}));

describe("AuthContext and useAuth Hook Suite", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("throws error when useAuth is called outside AuthProvider", () => {
    // Suppress console.error for expected React boundary error
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used within an AuthProvider"
    );
    spy.mockRestore();
  });

  it("initializes in anonymous state when localStorage is empty", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.searchTerm).toBe("");
  });

  it("restores user and favorites from localStorage on initial render", async () => {
    localStorage.setItem(
      "authUser",
      JSON.stringify({ userId: 1, username: "cached_user", token: "jwt-token-123" })
    );
    vi.mocked(api.apiGetMyFavorites).mockResolvedValueOnce([{ toolId: 5 }, { toolId: 9 }]);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user.username).toBe("cached_user");
      expect(result.current.favoriteToolIds.has(5)).toBe(true);
      expect(result.current.favoriteToolIds.has(9)).toBe(true);
    });
  });

  it("handles empty or failed favorites fetch gracefully", async () => {
    localStorage.setItem(
      "authUser",
      JSON.stringify({ userId: 1, username: "cached_user", token: "jwt-token-123" })
    );
    vi.mocked(api.apiGetMyFavorites).mockRejectedValueOnce(new Error("Favorites load failed"));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.favoriteToolIds.size).toBe(0);
    });
  });

  it("does not fetch favorites when authUser has no token", async () => {
    localStorage.setItem(
      "authUser",
      JSON.stringify({ userId: 1, username: "no_token_user" })
    );

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.user?.username).toBe("no_token_user");
      expect(api.apiGetMyFavorites).not.toHaveBeenCalled();
    });
  });

  it("handles null response from apiGetMyFavorites gracefully", async () => {
    localStorage.setItem(
      "authUser",
      JSON.stringify({ userId: 1, username: "cached_user", token: "jwt-token-123" })
    );
    vi.mocked(api.apiGetMyFavorites).mockResolvedValueOnce(null);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.favoriteToolIds.size).toBe(0);
    });
  });

  it("updates searchTerm state", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      result.current.setSearchTerm("converter");
    });

    expect(result.current.searchTerm).toBe("converter");
  });

  it("handles successful login", async () => {
    vi.mocked(api.apiLogin).mockResolvedValueOnce({
      userId: 1,
      username: "alice",
      token: "secret-token",
    });
    vi.mocked(api.apiGetMyFavorites).mockResolvedValueOnce([{ toolId: 42 }]);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    let success;
    await act(async () => {
      success = await result.current.login("alice", "password123");
    });

    expect(success).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user.username).toBe("alice");
    expect(mockPush).toHaveBeenCalledWith("/");
    expect(JSON.parse(localStorage.getItem("authUser"))).toEqual({
      userId: 1,
      username: "alice",
      token: "secret-token",
    });
    expect(result.current.favoriteToolIds.has(42)).toBe(true);
  });

  it("handles login without token response", async () => {
    vi.mocked(api.apiLogin).mockResolvedValueOnce({});

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    let success;
    await act(async () => {
      success = await result.current.login("baduser", "wrong");
    });

    expect(success).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("handles login API rejection gracefully", async () => {
    vi.mocked(api.apiLogin).mockRejectedValueOnce(new Error("Invalid credentials"));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    let success;
    await act(async () => {
      success = await result.current.login("baduser", "wrong");
    });

    expect(success).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("handles registration success and failure", async () => {
    vi.mocked(api.apiRegister).mockResolvedValueOnce({ success: true });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    let regSuccess;
    await act(async () => {
      regSuccess = await result.current.register("newuser", "securepass");
    });
    expect(regSuccess).toBe(true);

    vi.mocked(api.apiRegister).mockRejectedValueOnce(new Error("User exists"));

    let regFail;
    await act(async () => {
      regFail = await result.current.register("newuser", "securepass");
    });
    expect(regFail).toBe(false);
  });

  it("handles adding favorite when authenticated and rollback on failure", async () => {
    localStorage.setItem(
      "authUser",
      JSON.stringify({ userId: 1, username: "user1", token: "valid-token" })
    );

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Successful addFavorite
    vi.mocked(api.apiAddFavorite).mockResolvedValueOnce({ success: true });
    let addRes;
    await act(async () => {
      addRes = await result.current.addFavorite(10);
    });
    expect(addRes).toBe(true);
    expect(result.current.favoriteToolIds.has(10)).toBe(true);

    // Failing addFavorite rolls back
    vi.mocked(api.apiAddFavorite).mockRejectedValueOnce(new Error("Failed"));
    let failRes;
    await act(async () => {
      failRes = await result.current.addFavorite(20);
    });
    expect(failRes).toBe(false);
    expect(result.current.favoriteToolIds.has(20)).toBe(false);
  });

  it("handles removing favorite when authenticated and rollback on failure", async () => {
    localStorage.setItem(
      "authUser",
      JSON.stringify({ userId: 1, username: "user1", token: "valid-token" })
    );
    vi.mocked(api.apiGetMyFavorites).mockResolvedValueOnce([{ toolId: 10 }]);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.favoriteToolIds.has(10)).toBe(true);
    });

    // Failing remove rolls back
    vi.mocked(api.apiRemoveFavorite).mockRejectedValueOnce(new Error("Failed to remove"));
    let failRemove;
    await act(async () => {
      failRemove = await result.current.removeFavorite(10);
    });
    expect(failRemove).toBe(false);
    expect(result.current.favoriteToolIds.has(10)).toBe(true);

    // Successful remove
    vi.mocked(api.apiRemoveFavorite).mockResolvedValueOnce({ success: true });
    let successRemove;
    await act(async () => {
      successRemove = await result.current.removeFavorite(10);
    });
    expect(successRemove).toBe(true);
    expect(result.current.favoriteToolIds.has(10)).toBe(false);
  });

  it("returns false for addFavorite and removeFavorite when user has no token", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    let addRes, remRes;
    await act(async () => {
      addRes = await result.current.addFavorite(99);
      remRes = await result.current.removeFavorite(99);
    });

    expect(addRes).toBe(false);
    expect(remRes).toBe(false);
  });

  it("clears state and redirects to /auth/login on logout", async () => {
    localStorage.setItem(
      "authUser",
      JSON.stringify({ userId: 1, username: "user_to_logout", token: "jwt" })
    );

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.favoriteToolIds.size).toBe(0);
    expect(localStorage.getItem("authUser")).toBeNull();
    expect(mockPush).toHaveBeenCalledWith("/auth/login");
  });
});
