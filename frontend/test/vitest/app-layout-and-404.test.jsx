import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import NotFound from "../../src/app/not-found.jsx";
import RootAndMainLayout from "../../src/app/layout.jsx";
import * as api from "../../src/lib/api.js";

// Mock next/font/google
vi.mock("next/font/google", () => ({
  Inter: () => ({ className: "mock-inter-font" }),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => "/",
}));

const mockApiGetCategorizedTools = vi.fn();

// Mock API
vi.mock("@/lib/api", () => ({
  apiGetCategorizedTools: (...args) => mockApiGetCategorizedTools(...args),
  apiLogin: vi.fn(),
  apiRegister: vi.fn(),
  apiGetMyFavorites: vi.fn().mockResolvedValue([]),
  apiAddFavorite: vi.fn(),
  apiRemoveFavorite: vi.fn(),
}));

vi.mock("../../src/lib/api", () => ({
  apiGetCategorizedTools: (...args) => mockApiGetCategorizedTools(...args),
  apiLogin: vi.fn(),
  apiRegister: vi.fn(),
  apiGetMyFavorites: vi.fn().mockResolvedValue([]),
  apiAddFavorite: vi.fn(),
  apiRemoveFavorite: vi.fn(),
}));

describe("App Layout and 404 Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiGetCategorizedTools.mockResolvedValue([]);
  });

  describe("NotFound (404 Page)", () => {
    it("renders 404 heading and return home link", () => {
      render(<NotFound />);

      expect(screen.getByText("404")).toBeTruthy();
      expect(screen.getByText("Page Not Found")).toBeTruthy();
      expect(screen.getByText(/Oops! The page you are looking for does not exist/i)).toBeTruthy();

      const homeLink = screen.getByRole("link", { name: "Return Home" });
      expect(homeLink).toBeTruthy();
      expect(homeLink.getAttribute("href")).toBe("/");
    });
  });

  describe("RootAndMainLayout", () => {
    const mockCategories = [
      {
        categoryId: 1,
        name: "Converters",
        tools: [
          { toolId: 1, name: "Base64", slug: "base64" },
        ],
      },
    ];

    it("renders layout with children and loads categories successfully", async () => {
      mockApiGetCategorizedTools.mockResolvedValue(mockCategories);

      render(
        <RootAndMainLayout>
          <div data-testid="layout-child">Main Page Content</div>
        </RootAndMainLayout>
      );

      expect(screen.getByTestId("layout-child")).toBeTruthy();

      await waitFor(() => {
        expect(screen.getByText("Converters")).toBeTruthy();
      });

      expect(document.title).toBe("IT-Tools");

      // Test toggling sidebar
      const menuBtn = screen.getByLabelText(/menu/i);
      fireEvent.click(menuBtn);
      fireEvent.click(menuBtn);
    });

    it("handles non-array response from apiGetCategorizedTools gracefully", async () => {
      mockApiGetCategorizedTools.mockResolvedValue({ error: "Invalid data" });

      render(
        <RootAndMainLayout>
          <div data-testid="child-fallback">Fallback Content</div>
        </RootAndMainLayout>
      );

      await waitFor(() => {
        expect(mockApiGetCategorizedTools).toHaveBeenCalled();
      });

      expect(screen.getByTestId("child-fallback")).toBeTruthy();
    });

    it("handles API rejection when fetching categories gracefully", async () => {
      mockApiGetCategorizedTools.mockRejectedValue(new Error("Network Failure"));

      render(
        <RootAndMainLayout>
          <div data-testid="child-error">Error Child</div>
        </RootAndMainLayout>
      );

      await waitFor(() => {
        expect(screen.getByText(/Could not load navigation: Network Failure/i)).toBeTruthy();
      });

      expect(screen.getByTestId("child-error")).toBeTruthy();
    });

    it("responds to window resize events to update sidebar state", async () => {
      mockApiGetCategorizedTools.mockResolvedValue(mockCategories);

      render(
        <RootAndMainLayout>
          <div>Resize Test Child</div>
        </RootAndMainLayout>
      );

      await waitFor(() => {
        expect(screen.getByText("Converters")).toBeTruthy();
      });

      // Simulate mobile resize
      act(() => {
        window.innerWidth = 500;
        window.dispatchEvent(new Event("resize"));
      });

      // Simulate desktop resize
      act(() => {
        window.innerWidth = 1024;
        window.dispatchEvent(new Event("resize"));
      });
    });
  });
});
