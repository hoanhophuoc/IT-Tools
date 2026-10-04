import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  apiLogin,
  apiRegister,
  apiChangePassword,
  apiDirectResetPassword,
  apiGetCategorizedTools,
  apiGetToolDetails,
  apiRequestPremium,
  apiAdminGetCategories,
  apiAdminGetAllTools,
  apiAdminCreateTool,
  apiAdminUpdateTool,
  apiAdminDeleteTool,
  apiAdminGetAllUsers,
  apiAdminGetPendingRequests,
  apiAdminProcessRequest,
  apiGetMyFavorites,
  apiAddFavorite,
  apiRemoveFavorite,
} from "../../src/lib/api.js";

describe("api.js Suite", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("fetchWithAuth behavior", () => {
    it("attaches Authorization header when user is authenticated in localStorage", async () => {
      localStorage.setItem("authUser", JSON.stringify({ token: "my-jwt-token" }));

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({ success: true }),
      });

      const res = await apiGetCategorizedTools();
      expect(res).toEqual({ success: true });

      const [[url, options]] = global.fetch.mock.calls;
      expect(url).toContain("/tools");
      expect(options.headers["Authorization"]).toBe("Bearer my-jwt-token");
    });

    it("handles execution when window is undefined", async () => {
      const originalWindow = global.window;
      try {
        delete global.window;
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          headers: { get: () => "application/json" },
          json: async () => ({ success: true }),
        });
        const res = await apiGetCategorizedTools();
        expect(res).toEqual({ success: true });
      } finally {
        global.window = originalWindow;
      }
    });

    it("handles 204 NoContent returning null", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        headers: { get: () => null },
      });

      const res = await apiAddFavorite(10);
      expect(res).toBeNull();
    });

    it("handles plain text responses", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => "text/plain" },
        text: async () => "OK",
      });

      const res = await apiGetToolDetails("test-tool");
      expect(res).toBe("OK");
    });

    it("throws error with API response message on non-ok status", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        headers: { get: () => "application/json" },
        json: async () => ({ message: "Bad parameters" }),
      });

      await expect(apiLogin({ username: "u", password: "p" })).rejects.toThrow("Bad parameters");
    });

    it("throws formatted error if response includes errors object", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        headers: { get: () => "application/json" },
        json: async () => ({ errors: { Username: ["Required"] } }),
      });

      await expect(apiRegister({ username: "" })).rejects.toThrow("Username");
    });

    it("handles error without message using status code fallback", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: { get: () => "text/plain" },
        text: async () => "",
      });

      await expect(apiGetToolDetails("unknown")).rejects.toThrow("Request failed with status 500");
    });
  });

  describe("API Endpoint Handlers", () => {
    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => "application/json" },
        json: async () => ({ status: "ok" }),
      });
    });

    it("invokes apiLogin with POST", async () => {
      await apiLogin({ username: "a", password: "b" });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/login"),
        expect.objectContaining({ method: "POST" })
      );
    });

    it("invokes apiRegister with POST", async () => {
      await apiRegister({ username: "a", password: "b" });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/register"),
        expect.objectContaining({ method: "POST" })
      );
    });

    it("invokes apiChangePassword with POST", async () => {
      await apiChangePassword({ oldPassword: "a", newPassword: "b" });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/change-password"),
        expect.objectContaining({ method: "POST" })
      );
    });

    it("invokes apiDirectResetPassword with POST", async () => {
      await apiDirectResetPassword({ username: "user1", newPassword: "new" });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/auth/forgot-password"),
        expect.objectContaining({ method: "POST" })
      );
    });

    it("invokes apiRequestPremium with POST", async () => {
      await apiRequestPremium({ userId: 1 });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/user/upgrade-requests"),
        expect.objectContaining({ method: "POST" })
      );
    });

    it("invokes admin tool and category endpoints", async () => {
      await apiAdminGetCategories();
      await apiAdminGetAllTools();
      await apiAdminCreateTool({ name: "Tool" });
      await apiAdminUpdateTool(1, { name: "Updated" });
      await apiAdminDeleteTool(1);
      await apiAdminGetAllUsers();
      await apiAdminGetPendingRequests();
      await apiAdminProcessRequest(5, { status: "Approved" });
      await apiGetMyFavorites();
      await apiRemoveFavorite(99);

      expect(global.fetch).toHaveBeenCalledTimes(10);
    });
  });
});
