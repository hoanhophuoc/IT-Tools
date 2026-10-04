import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import RootHomePage from "../../src/app/page.jsx";
import LoginPage from "../../src/app/auth/login/page.jsx";
import RegisterPage from "../../src/app/auth/register/page.jsx";
import ToolPage from "../../src/app/tools/[toolSlug]/page.jsx";
import * as api from "../../src/lib/api.js";

// Mock next/navigation
const mockPush = vi.fn();
let mockParams = { toolSlug: "base64-converter" };
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => mockParams,
  notFound: vi.fn(),
}));

// Mock next/image
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}));

// Mock useAuth
let mockAuthData = {
  user: { userId: 1, username: "tester", role: "User" },
  isAuthenticated: true,
  loading: false,
  searchTerm: "",
  setSearchTerm: vi.fn(),
  favoriteToolIds: new Set([10]),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
};

vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: () => mockAuthData,
}));

vi.mock("../../src/lib/api", () => ({
  apiGetCategorizedTools: vi.fn().mockResolvedValue([
    {
      categoryId: 1,
      name: "Converters",
      tools: [
        { toolId: 10, name: "Base64 Converter", slug: "base64", isPremium: false },
        { toolId: 20, name: "VIP Converter", slug: "vip-converter", isPremium: true },
        { toolId: 30, name: "UUID Generator", slug: "uuid", isPremium: false },
      ],
    },
  ]),
  apiGetToolDetails: vi.fn(),
}));

describe("Next.js App Pages Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthData = {
      user: { userId: 1, username: "tester", role: "User" },
      isAuthenticated: true,
      loading: false,
      searchTerm: "",
      setSearchTerm: vi.fn(),
      favoriteToolIds: new Set([10, 20]),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    };
  });

  describe("RootHomePage", () => {
    it("renders categorized tools and favorites on the homepage", async () => {
      render(<RootHomePage />);

      await waitFor(() => {
        expect(screen.getByText("Your favorite tools ❤️")).toBeTruthy();
        expect(screen.getByText("All the tools")).toBeTruthy();
        expect(screen.getAllByText("Base64 Converter").length).toBeGreaterThan(0);
      });
    });

    it("displays error message when fetching tools fails", async () => {
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(api.apiGetCategorizedTools).mockRejectedValueOnce(new Error("Database disconnected"));

      render(<RootHomePage />);

      await waitFor(() => {
        expect(screen.getByText(/Could not load tools: Database disconnected/i)).toBeTruthy();
      });
      errSpy.mockRestore();
    });

    it("displays default error message when error has no message", async () => {
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(api.apiGetCategorizedTools).mockRejectedValueOnce({});

      render(<RootHomePage />);

      await waitFor(() => {
        expect(screen.getByText(/Could not load tools: Unknown error/i)).toBeTruthy();
      });
      errSpy.mockRestore();
    });

    it("handles non-array response from apiGetCategorizedTools", async () => {
      vi.mocked(api.apiGetCategorizedTools).mockResolvedValueOnce(null);

      render(<RootHomePage />);

      await waitFor(() => {
        expect(screen.getByText("No tools available at the moment. Check back later!")).toBeTruthy();
      });
    });

    it("handles categories without tools property gracefully", async () => {
      vi.mocked(api.apiGetCategorizedTools).mockResolvedValueOnce([
        { categoryId: 99, name: "EmptyCategory" },
      ]);

      render(<RootHomePage />);

      await waitFor(() => {
        expect(screen.getByText("No tools available at the moment. Check back later!")).toBeTruthy();
      });
    });

    it("displays no tools available message when tool list is empty", async () => {
      vi.mocked(api.apiGetCategorizedTools).mockResolvedValueOnce([]);

      render(<RootHomePage />);

      await waitFor(() => {
        expect(screen.getByText("No tools available at the moment. Check back later!")).toBeTruthy();
      });
    });

    it("displays no results found message when search query does not match any tool", async () => {
      mockAuthData.searchTerm = "nonexistent_term";

      render(<RootHomePage />);

      await waitFor(() => {
        expect(screen.getByText(/No tools found matching "nonexistent_term"/i)).toBeTruthy();
      });

      mockAuthData.searchTerm = "";
    });

    it("matches tools by description when searching", async () => {
      vi.mocked(api.apiGetCategorizedTools).mockResolvedValueOnce([
        {
          categoryId: 1,
          name: "Converters",
          tools: [
            { toolId: 99, name: "UniqueTool", description: "Specialized secret algorithm", slug: "unique" },
          ],
        },
      ]);
      mockAuthData.searchTerm = "secret";

      render(<RootHomePage />);

      await waitFor(() => {
        expect(screen.getByText("UniqueTool")).toBeTruthy();
      });

      mockAuthData.searchTerm = "";
    });

    it("renders for unauthenticated user without favorite section", async () => {
      mockAuthData.isAuthenticated = false;
      mockAuthData.favoriteToolIds = new Set();

      render(<RootHomePage />);

      await waitFor(() => {
        expect(screen.queryByText("Your favorite tools ❤️")).toBeNull();
        expect(screen.getByText("All the tools")).toBeTruthy();
      });

      mockAuthData.isAuthenticated = true;
      mockAuthData.favoriteToolIds = new Set([10, 20]);
    });

    it("renders spinner when auth is loading", () => {
      mockAuthData.loading = true;
      render(<RootHomePage />);
      expect(screen.getByRole("status")).toBeTruthy();
      mockAuthData.loading = false;
    });
  });

  describe("LoginPage and RegisterPage wrappers", () => {
    it("renders LoginPage with LoginForm", () => {
      render(<LoginPage />);
      expect(screen.getByRole("heading", { name: "Login" })).toBeTruthy();
    });

    it("renders RegisterPage with RegisterForm", () => {
      render(<RegisterPage />);
      expect(screen.getByRole("heading", { name: "Register" })).toBeTruthy();
    });
  });

  describe("ToolPage ([toolSlug])", () => {
    it("renders tool details and favorite button for accessible free tool", async () => {
      mockParams = { toolSlug: "base64" };
      vi.mocked(api.apiGetToolDetails).mockResolvedValueOnce({
        toolId: 10,
        name: "Base64 Converter",
        description: "Encode and decode Base64",
        slug: "base64",
        isPremium: false,
        componentUrl: "tools/converter/Base64StringConverter",
      });

      render(<ToolPage />);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Base64 Converter" })).toBeTruthy();
        expect(screen.getByText("Encode and decode Base64")).toBeTruthy();
      });
    });

    it("displays permission barrier when free user attempts to access premium tool", async () => {
      mockParams = { toolSlug: "vip-converter" };
      vi.mocked(api.apiGetToolDetails).mockResolvedValueOnce({
        toolId: 20,
        name: "VIP Converter",
        description: "VIP Only Tool",
        slug: "vip-converter",
        isPremium: true,
        componentUrl: "tools/converter/ColorConverter",
      });

      render(<ToolPage />);

      await waitFor(() => {
        expect(screen.getByText(/You need a Premium account to access this tool/i)).toBeTruthy();
      });
    });

    it("displays login button when unauthenticated user tries to access premium tool and clicking it redirects", async () => {
      mockParams = { toolSlug: "vip-converter" };
      const originalAuth = { ...mockAuthData };
      mockAuthData.isAuthenticated = false;
      mockAuthData.user = null;

      vi.mocked(api.apiGetToolDetails).mockResolvedValueOnce({
        toolId: 20,
        name: "VIP Converter",
        description: "VIP Only Tool",
        slug: "vip-converter",
        isPremium: true,
        componentUrl: "tools/converter/ColorConverter",
      });

      render(<ToolPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Login to Access" })).toBeTruthy();
      });

      fireEvent.click(screen.getByRole("button", { name: "Login to Access" }));
      expect(mockPush).toHaveBeenCalledWith("/auth/login?redirect=/vip-converter");

      // Restore auth
      Object.assign(mockAuthData, originalAuth);
    });

    it("displays error when tool slug is missing", async () => {
      mockParams = { toolSlug: "" };
      render(<ToolPage />);

      await waitFor(() => {
        expect(screen.getByText("Tool identifier missing.")).toBeTruthy();
      });
    });

    it("handles 404 not found error from apiGetToolDetails", async () => {
      mockParams = { toolSlug: "non-existent-tool" };
      const { notFound } = await import("next/navigation");
      vi.mocked(api.apiGetToolDetails).mockRejectedValueOnce(new Error("404 Not Found"));

      render(<ToolPage />);

      await waitFor(() => {
        expect(notFound).toHaveBeenCalled();
      });
    });

    it("handles generic API failure with error banner", async () => {
      mockParams = { toolSlug: "failing-tool" };
      vi.mocked(api.apiGetToolDetails).mockRejectedValueOnce(new Error("Internal Server Error"));

      render(<ToolPage />);

      await waitFor(() => {
        expect(screen.getByText("Failed to load tool: Internal Server Error")).toBeTruthy();
      });
    });

    it("handles 403 Forbidden error by setting permission denied", async () => {
      mockParams = { toolSlug: "forbidden-tool" };
      vi.mocked(api.apiGetToolDetails).mockRejectedValueOnce(new Error("403 Forbidden"));

      render(<ToolPage />);

      await waitFor(() => {
        expect(screen.getByText("Premium Tool Access Required")).toBeTruthy();
      });
    });

    it("handles missing componentUrl with not found error", async () => {
      mockParams = { toolSlug: "no-url-tool" };
      const { notFound } = await import("next/navigation");
      vi.mocked(api.apiGetToolDetails).mockResolvedValueOnce({
        toolId: 30,
        name: "No URL",
        componentUrl: null,
      });

      render(<ToolPage />);

      await waitFor(() => {
        expect(notFound).toHaveBeenCalled();
      });
    });

    it("renders premium tool with badge when user has Premium role", async () => {
      mockParams = { toolSlug: "vip-converter" };
      const originalAuth = { ...mockAuthData };
      mockAuthData.isAuthenticated = true;
      mockAuthData.user = { userId: 1, username: "vip_user", role: "Premium" };

      vi.mocked(api.apiGetToolDetails).mockResolvedValueOnce({
        toolId: 20,
        name: "VIP Converter",
        description: "VIP Only Tool",
        slug: "vip-converter",
        isPremium: true,
        componentUrl: "tools/converter/ColorConverter",
      });

      render(<ToolPage />);

      await waitFor(() => {
        expect(screen.getByText("★ Premium")).toBeTruthy();
      });

      Object.assign(mockAuthData, originalAuth);
    });

    it("displays loading state while authentication is in progress", () => {
      mockAuthData.loading = true;
      render(<ToolPage />);
      expect(screen.getByRole("status")).toBeTruthy();
      mockAuthData.loading = false;
    });

    it("handles dynamic import failure catch block for invalid componentUrl", async () => {
      mockParams = { toolSlug: "broken-component-tool" };
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      vi.mocked(api.apiGetToolDetails).mockResolvedValueOnce({
        toolId: 999,
        name: "Broken Module",
        description: "Fails to import",
        slug: "broken-component-tool",
        isPremium: false,
        componentUrl: "tools/does-not-exist-at-all.jsx",
      });

      render(<ToolPage />);

      await waitFor(() => {
        expect(errSpy).toHaveBeenCalledWith(
          expect.stringContaining("Failed to import component"),
          expect.anything()
        );
      });

      errSpy.mockRestore();
    });

    it("handles cancellation gracefully when unmounted during fetch", async () => {
      mockParams = { toolSlug: "pending-cancel" };
      let resolveDetails;
      vi.mocked(api.apiGetToolDetails).mockReturnValueOnce(
        new Promise((resolve) => {
          resolveDetails = resolve;
        })
      );

      const { unmount } = render(<ToolPage />);
      unmount();
      resolveDetails({
        toolId: 100,
        name: "Cancelled Tool",
        componentUrl: "tools/converter/ColorConverter",
        isPremium: false,
      });
    });

    it("handles cancellation gracefully when unmounted during fetch rejection", async () => {
      mockParams = { toolSlug: "reject-cancel" };
      let rejectDetails;
      vi.mocked(api.apiGetToolDetails).mockReturnValueOnce(
        new Promise((_, reject) => {
          rejectDetails = reject;
        })
      );

      const { unmount } = render(<ToolPage />);
      unmount();
      rejectDetails(new Error("Network failed"));
    });
  });
});
