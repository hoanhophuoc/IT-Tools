import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import SearchBar from "../../src/components/SearchBar.jsx";
import PremiumRequestButton from "../../src/components/PremiumRequestButton.jsx";
import LoginForm from "../../src/components/auth/LoginForm.jsx";
import RegisterForm from "../../src/components/auth/RegisterForm.jsx";
import Header from "../../src/components/layout/Header.jsx";
import Sidebar from "../../src/components/layout/Sidebar.jsx";
import * as api from "../../src/lib/api.js";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock next/image
vi.mock("next/image", () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}));

// Mock useAuth
const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockLogout = vi.fn();
let mockAuthData = {
  user: { userId: 1, username: "testuser", role: "User" },
  isAuthenticated: true,
  loading: false,
  searchTerm: "",
  setSearchTerm: vi.fn(),
  favoriteToolIds: new Set([10]),
  login: mockLogin,
  register: mockRegister,
  logout: mockLogout,
};

vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: () => mockAuthData,
}));

vi.mock("../../src/lib/api", () => ({
  apiRequestPremium: vi.fn().mockResolvedValue({ status: "Pending" }),
  apiGetCategorizedTools: vi.fn().mockResolvedValue([
    {
      categoryId: 1,
      name: "Converters",
      tools: [{ toolId: 10, name: "Base64", slug: "base64", icon: "b64.png" }],
    },
  ]),
}));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function () {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function () {
    this.open = false;
  });
});

describe("App Components Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthData = {
      user: { userId: 1, username: "testuser", role: "User" },
      isAuthenticated: true,
      loading: false,
      searchTerm: "",
      setSearchTerm: vi.fn(),
      favoriteToolIds: new Set([10]),
      login: mockLogin,
      register: mockRegister,
      logout: mockLogout,
    };
  });

  describe("SearchBar", () => {
    const mockCategories = [
      {
        id: 1,
        name: "Crypto",
        tools: [
          { toolId: 1, name: "JWT Parser", slug: "jwt-parser", description: "Parse JWT", icon: "jwt.svg", isPremium: true, categoryName: "Crypto" },
          { toolId: 2, name: "Hash Generator", slug: "hash", description: "" },
          { slug: "only-slug", name: "Decoder of JWT", description: "Decode tokens" },
          { toolId: 4, name: "JWT Signer", slug: "jwt-signer", description: "Sign tokens" },
        ],
      },
    ];

    it("renders search input and filters tools based on query", () => {
      const setSearchTerm = vi.fn();
      render(
        <SearchBar
          searchTerm="jwt"
          setSearchTerm={setSearchTerm}
          categories={mockCategories}
        />
      );

      const input = screen.getByPlaceholderText(/Search tools.../i);
      expect(input.value).toBe("jwt");

      fireEvent.change(input, { target: { value: "hash" } });
      expect(setSearchTerm).toHaveBeenCalledWith("hash");
    });

    it("opens suggestions dropdown, navigates with keyboard, and selects a tool", () => {
      const setSearchTerm = vi.fn();
      render(
        <SearchBar
          searchTerm="jwt"
          setSearchTerm={setSearchTerm}
          categories={mockCategories}
        />
      );

      const input = screen.getByPlaceholderText(/Search tools.../i);
      fireEvent.focus(input);

      expect(screen.getByText("JWT Parser")).toBeTruthy();

      // Keyboard navigation with ArrowDown wrapping to 0, and ArrowUp wrapping to end
      // suggestions.length is 3 for "jwt"
      fireEvent.keyDown(input, { key: "ArrowDown" }); // 0
      fireEvent.keyDown(input, { key: "ArrowDown" }); // 1
      fireEvent.keyDown(input, { key: "ArrowDown" }); // 2
      fireEvent.keyDown(input, { key: "ArrowDown" }); // wraps to 0
      fireEvent.keyDown(input, { key: "ArrowUp" });   // wraps to 2
      fireEvent.keyDown(input, { key: "ArrowUp" });   // decrements to 1

      // Test Tab/unhandled key while dropdown is open (hits fallthrough of handleKeyDown)
      fireEvent.keyDown(input, { key: "Tab" });

      // Test Escape while dropdown is open
      fireEvent.keyDown(input, { key: "Escape" });

      // Reopen dropdown
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(input, { key: "Enter" });
      expect(mockPush).toHaveBeenCalledWith("/tools/jwt-parser");

      // Test Enter when dropdown is open and selectedIndex is -1 (defaults to first suggestion)
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: "Enter" });
      expect(mockPush).toHaveBeenCalledWith("/tools/jwt-parser");

      // Test Enter when dropdown is closed but searchTerm has suggestions (line 108)
      fireEvent.keyDown(input, { key: "Escape" });
      fireEvent.keyDown(input, { key: "Enter" });
      expect(mockPush).toHaveBeenCalledWith("/tools/jwt-parser");

      // Test Clear button
      fireEvent.focus(input);
      const clearBtn = screen.getByTitle("Clear search");
      fireEvent.click(clearBtn);
      expect(setSearchTerm).toHaveBeenCalledWith("");
    });

    it("renders single suggestion without plural 's' and handles inside container click", () => {
      render(
        <SearchBar
          searchTerm="hash"
          setSearchTerm={vi.fn()}
          categories={mockCategories}
        />
      );
      const input = screen.getByPlaceholderText(/Search tools.../i);
      fireEvent.focus(input);

      // Verify single suggestion text "Showing 1 suggestion"
      expect(screen.getByText(/Showing 1 suggestion$/i)).toBeTruthy();

      // Click inside container should not close
      fireEvent.mouseDown(input);
    });

    it("displays 'No tools found matching' message when search term yields 0 suggestions", () => {
      render(
        <SearchBar
          searchTerm="nonexistentxyz"
          setSearchTerm={vi.fn()}
          categories={mockCategories}
        />
      );
      const input = screen.getByPlaceholderText(/Search tools.../i);
      fireEvent.focus(input);
      expect(screen.getByText(/No tools found matching "nonexistentxyz"/i)).toBeTruthy();

      // Focus when searchTerm is empty
      const { rerender } = render(<SearchBar searchTerm="" setSearchTerm={vi.fn()} />);
      const emptyInput = screen.getAllByPlaceholderText(/Search tools.../i)[1];
      fireEvent.focus(emptyInput);
    });

    it("selects suggestion on mouse click and handles outside click and mouseEnter", () => {
      const setSearchTerm = vi.fn();
      render(
        <SearchBar
          searchTerm="jwt"
          setSearchTerm={setSearchTerm}
          categories={mockCategories}
        />
      );

      const input = screen.getByPlaceholderText(/Search tools.../i);
      fireEvent.focus(input);

      const item = screen.getByText("JWT Parser");
      fireEvent.mouseEnter(item.closest("button"));

      fireEvent.click(item);
      expect(mockPush).toHaveBeenCalledWith("/tools/jwt-parser");

      // Simulate outside click
      fireEvent.mouseDown(document.body);
    });

    it("navigates to search page when Enter is pressed with no matching suggestions", () => {
      render(
        <SearchBar
          searchTerm="nonexistenttool123"
          setSearchTerm={vi.fn()}
          categories={mockCategories}
        />
      );

      const input = screen.getByPlaceholderText(/Search tools.../i);
      fireEvent.keyDown(input, { key: "Enter" });
      expect(mockPush).toHaveBeenCalledWith("/?search=nonexistenttool123");
    });

    it("fetches categories from API when categories prop is omitted", async () => {
      vi.mocked(api.apiGetCategorizedTools).mockResolvedValueOnce([
        {
          categoryId: 9,
          name: "FetchedCategory",
          tools: [{ toolId: 99, name: "Remote Tool", slug: "remote-tool" }],
        },
        {
          categoryId: 10,
          name: "NoToolsCategory",
        },
      ]);

      render(<SearchBar searchTerm="remote" setSearchTerm={vi.fn()} />);

      await waitFor(() => {
        expect(api.apiGetCategorizedTools).toHaveBeenCalled();
      });

      // Non-array data response
      vi.mocked(api.apiGetCategorizedTools).mockResolvedValueOnce(null);
      render(<SearchBar searchTerm="remote" setSearchTerm={vi.fn()} />);

      // API failure
      vi.mocked(api.apiGetCategorizedTools).mockRejectedValueOnce(new Error("Network failed"));
      render(<SearchBar searchTerm="remote" setSearchTerm={vi.fn()} />);
    });

    it("cancels fetch when unmounted before apiGetCategorizedTools resolves", async () => {
      let resolveFetch;
      vi.mocked(api.apiGetCategorizedTools).mockReturnValueOnce(
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
      );
      const { unmount } = render(<SearchBar searchTerm="test" setSearchTerm={vi.fn()} />);
      unmount();
      resolveFetch([{ categoryId: 1, name: "Cat", tools: [] }]);
    });
  });

  describe("PremiumRequestButton", () => {
    it("renders button and opens modal to submit request", async () => {
      const timeoutSpy = vi.spyOn(global, "setTimeout");
      render(<PremiumRequestButton />);

      const button = screen.getByRole("button", { name: /Go Premium/i });
      fireEvent.click(button);

      expect(screen.getByText("Request Premium Access")).toBeTruthy();

      // Test Cancel button to execute handleCloseModal
      const cancelBtn = screen.getByRole("button", { name: "Cancel" });
      fireEvent.click(cancelBtn);

      // Reopen modal to submit
      fireEvent.click(button);
      const confirmBtn = screen.getByRole("button", { name: /Confirm Request/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(api.apiRequestPremium).toHaveBeenCalledWith({ userId: 1 });
        expect(screen.getByText(/Your request has been submitted successfully!/i)).toBeTruthy();
      });

      // Execute the 3-second auto-close timeout callback
      const timerCb = timeoutSpy.mock.calls.find((call) => call[1] === 3000)?.[0];
      if (timerCb) {
        act(() => {
          timerCb();
        });
      }
      timeoutSpy.mockRestore();
    });

    it("returns null when user already has Premium or Admin role", () => {
      mockAuthData.user = { userId: 2, username: "vip", role: "Premium" };
      const { container } = render(<PremiumRequestButton />);
      expect(container.firstChild).toBeNull();
    });

    it("displays error message when apiRequestPremium fails", async () => {
      mockAuthData.user = { userId: 1, username: "testuser", role: "User" };
      vi.mocked(api.apiRequestPremium).mockRejectedValueOnce(new Error("Server timeout"));
      render(<PremiumRequestButton />);

      const button = screen.getByRole("button", { name: /Go Premium/i });
      fireEvent.click(button);

      const confirmBtn = screen.getByRole("button", { name: /Confirm Request/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(screen.getByText("Server timeout")).toBeTruthy();
      });

      // Test fallback when error has no message
      vi.mocked(api.apiRequestPremium).mockRejectedValueOnce({});
      fireEvent.click(confirmBtn);
      await waitFor(() => {
        expect(screen.getByText("Failed to submit request. Please try again.")).toBeTruthy();
      });
    });
  });

  describe("LoginForm", () => {
    it("submits username and password on form submission", async () => {
      mockLogin.mockResolvedValue(true);
      render(<LoginForm />);

      const usernameInput = screen.getByLabelText(/Username/i);
      const passwordInput = screen.getByLabelText(/Password/i);
      fireEvent.change(usernameInput, { target: { value: "myuser" } });
      fireEvent.change(passwordInput, { target: { value: "mypass" } });

      const submitBtn = screen.getByRole("button", { name: /Login/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith("myuser", "mypass");
      });
    });

    it("displays error message when login fails", async () => {
      mockLogin.mockResolvedValue(false);
      render(<LoginForm />);

      fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "bad" } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "bad" } });
      fireEvent.click(screen.getByRole("button", { name: /Login/i }));

      await waitFor(() => {
        expect(screen.getByText(/Invalid username or password./i)).toBeTruthy();
      });
    });

    it("displays error when login throws an unexpected exception", async () => {
      mockLogin.mockRejectedValueOnce(new Error("Network disconnect"));
      render(<LoginForm />);

      fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "user" } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "pass" } });

      const submitBtn = screen.getByRole("button", { name: /Login/i });
      fireEvent.click(submitBtn);
      await waitFor(() => {
        expect(screen.getByText("Network disconnect")).toBeTruthy();
      });

      // Login error with empty message fallback
      mockLogin.mockRejectedValueOnce(new Error(""));
      fireEvent.click(submitBtn);
      await waitFor(() => {
        expect(screen.getByText("An unexpected error occurred during login.")).toBeTruthy();
      });
    });
  });

  describe("RegisterForm", () => {
    it("shows error if passwords do not match", async () => {
      render(<RegisterForm />);

      fireEvent.change(screen.getByLabelText(/^Username/i), { target: { value: "newuser" } });
      fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: "Password123" } });
      fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "Mismatch" } });

      fireEvent.click(screen.getByRole("button", { name: /Register/i }));

      expect(screen.getByText(/Passwords do not match./i)).toBeTruthy();
      expect(mockRegister).not.toHaveBeenCalled();
    });

    it("calls register and navigates on success", async () => {
      mockRegister.mockResolvedValue(true);
      render(<RegisterForm />);

      fireEvent.change(screen.getByLabelText(/^Username/i), { target: { value: "newuser" } });
      fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: "Password123" } });
      fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "Password123" } });

      fireEvent.click(screen.getByRole("button", { name: /Register/i }));

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith("newuser", "Password123");
        expect(mockPush).toHaveBeenCalledWith("/auth/login");
      });
    });

    it("displays error when registration fails or throws", async () => {
      mockRegister.mockResolvedValueOnce(false);
      const { rerender } = render(<RegisterForm />);

      fireEvent.change(screen.getByLabelText(/^Username/i), { target: { value: "userdup" } });
      fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: "P@ss123" } });
      fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "P@ss123" } });
      fireEvent.click(screen.getByRole("button", { name: /Register/i }));

      await waitFor(() => {
        expect(screen.getByText(/Registration failed. Username might already exist./i)).toBeTruthy();
      });

      mockRegister.mockRejectedValueOnce(new Error("Server registration error"));
      fireEvent.click(screen.getByRole("button", { name: /Register/i }));
      await waitFor(() => {
        expect(screen.getByText("Server registration error")).toBeTruthy();
      });

      // Register error with empty message fallback
      mockRegister.mockRejectedValueOnce(new Error(""));
      fireEvent.click(screen.getByRole("button", { name: /Register/i }));
      await waitFor(() => {
        expect(screen.getByText("An unexpected error occurred during registration.")).toBeTruthy();
      });
    });
  });

  describe("Header and Sidebar", () => {
    const mockCategories = [
      {
        categoryId: 1,
        name: "Converters",
        tools: [
          { toolId: 10, name: "Base64 Converter", slug: "base64", icon: "b64.png", isPremium: false },
          { toolId: 11, name: "Alpha Tool", slug: "alpha", icon: "alpha.png", isPremium: true },
        ],
      },
      {
        categoryId: 2,
        name: "ToolsWithoutIcon",
        tools: [
          { toolId: 20, name: "Plain Tool", slug: "plain-tool" },
        ],
      },
      {
        categoryId: 3,
        name: "EmptyCategory",
      },
    ];

    it("renders Header navigation elements and user controls for user and premium member", () => {
      const toggleSidebar = vi.fn();
      mockAuthData.user = { userId: 1, username: "regular", role: "User" };
      const { rerender } = render(<Header isSidebarOpen={true} toggleSidebar={toggleSidebar} categories={mockCategories} />);

      expect(screen.getByTitle("Home")).toBeTruthy();
      expect(screen.getByRole("button", { name: /Close menu/i })).toBeTruthy();
      expect(screen.getByRole("button", { name: /Logout/i })).toBeTruthy();

      // Premium user
      mockAuthData.user = { userId: 2, username: "vip", role: "Premium" };
      rerender(<Header isSidebarOpen={false} toggleSidebar={toggleSidebar} categories={mockCategories} />);
      expect(screen.getByTitle("Premium Member")).toBeTruthy();

      // Admin user
      mockAuthData.user = { userId: 3, username: "admin_user", role: "Admin" };
      rerender(<Header isSidebarOpen={false} toggleSidebar={toggleSidebar} categories={mockCategories} />);
      expect(screen.getByTitle("Admin Panel")).toBeTruthy();
    });

    it("renders Sidebar category list and toggles categories and favorites with image error fallback", () => {
      mockAuthData.favoriteToolIds = new Set([10, 11, 20]);
      render(<Sidebar isSidebarOpen={true} categories={mockCategories} />);

      expect(screen.getByText("Converters")).toBeTruthy();
      expect(screen.getByText("Your favorite tools")).toBeTruthy();

      // Trigger image error on icon (Sidebar line 33)
      const images = document.querySelectorAll("img");
      if (images.length > 0) {
        fireEvent.error(images[0]);
      }

      // Toggle category open/close
      const catButton = screen.getByText("Converters");
      fireEvent.click(catButton);

      // Toggle favorites open/close
      const favButton = screen.getByText("Your favorite tools");
      fireEvent.click(favButton);
    });

    it("renders Sidebar in loading, error, empty, and closed states", () => {
      const { rerender } = render(<Sidebar isSidebarOpen={true} isLoading={true} categories={[]} />);
      expect(screen.queryByText("Converters")).toBeNull();

      rerender(<Sidebar isSidebarOpen={true} error="Failed to load navigation" categories={[]} />);
      expect(screen.getByText("Failed to load navigation")).toBeTruthy();

      rerender(<Sidebar isSidebarOpen={true} categories={[]} />);
      expect(screen.getByText("No categories found.")).toBeTruthy();

      rerender(<Sidebar isSidebarOpen={false} categories={mockCategories} />);
      expect(screen.queryByText("IT-Tools")).toBeNull();
    });
  });
});
