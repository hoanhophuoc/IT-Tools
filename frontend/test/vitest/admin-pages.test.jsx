import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AdminLayout from "../../src/app/admin/layout.jsx";
import AdminHomePage from "../../src/app/admin/page.jsx";
import ToolForm from "../../src/components/admin/ToolForm.jsx";
import AdminToolsPage from "../../src/app/admin/tools/page.jsx";
import AdminUsersPage from "../../src/app/admin/users/page.jsx";
import AdminUpgradeRequestsPage from "../../src/app/admin/upgrade-requests/page.jsx";
import * as api from "../../src/lib/api.js";

// Mock next/navigation
const mockRedirect = vi.fn();
let mockPathname = "/admin/tools";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  redirect: (url) => mockRedirect(url),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock useAuth
let mockAuthData = {
  user: { userId: 1, username: "admin", role: "Admin" },
  isAuthenticated: true,
  loading: false,
};

vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: () => mockAuthData,
}));

// Mock API
vi.mock("../../src/lib/api", () => ({
  apiAdminGetAllTools: vi.fn(),
  apiAdminCreateTool: vi.fn(),
  apiAdminUpdateTool: vi.fn(),
  apiAdminDeleteTool: vi.fn(),
  apiAdminGetCategories: vi.fn(),
  apiAdminGetAllUsers: vi.fn(),
  apiAdminGetPendingRequests: vi.fn(),
  apiAdminProcessRequest: vi.fn(),
}));

describe("Admin Layout & Pages Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/admin/tools";
    mockAuthData = {
      user: { userId: 1, username: "admin", role: "Admin" },
      isAuthenticated: true,
      loading: false,
    };
    if (typeof window !== "undefined") {
      HTMLDialogElement.prototype.showModal = vi.fn(function () {
        this.open = true;
      });
      HTMLDialogElement.prototype.close = vi.fn(function () {
        this.open = false;
      });
    }
  });

  describe("AdminLayout", () => {
    it("renders loading spinner when auth is loading", () => {
      mockAuthData.loading = true;
      render(<AdminLayout><div>Child Content</div></AdminLayout>);
      expect(screen.queryByText("Child Content")).toBeNull();
    });

    it("redirects unauthenticated users to login", () => {
      mockAuthData.isAuthenticated = false;
      render(<AdminLayout><div>Child Content</div></AdminLayout>);
      expect(mockRedirect).toHaveBeenCalledWith("/auth/login?redirect=/admin");
    });

    it("redirects non-admin users to root unauthorized page", () => {
      mockAuthData.user = { userId: 2, username: "regular", role: "User" };
      render(<AdminLayout><div>Child Content</div></AdminLayout>);
      expect(mockRedirect).toHaveBeenCalledWith("/?error=unauthorized");
    });

    it("renders Admin Panel tabs and children for admin users", () => {
      render(<AdminLayout><div>Child Content</div></AdminLayout>);
      expect(screen.getByText("Admin Panel")).toBeTruthy();
      expect(screen.getByText("Tools")).toBeTruthy();
      expect(screen.getByText("Users")).toBeTruthy();
      expect(screen.getByText("Upgrade Requests")).toBeTruthy();
      expect(screen.getByText("Child Content")).toBeTruthy();
    });

    it("defaults activeTabKey to 'tools' when on root /admin path", () => {
      mockPathname = "/admin";
      render(<AdminLayout><div>Child Content</div></AdminLayout>);
      expect(screen.getByText("Tools")).toBeTruthy();
      mockPathname = "/admin/tools";
    });
  });

  describe("AdminHomePage", () => {
    it("redirects to /admin/tools", () => {
      AdminHomePage();
      expect(mockRedirect).toHaveBeenCalledWith("/admin/tools");
    });
  });

  describe("ToolForm", () => {
    const mockCategories = [
      { categoryId: 1, name: "Converters" },
      { categoryId: 2, name: "Crypto" },
    ];

    beforeEach(() => {
      vi.mocked(api.apiAdminGetCategories).mockResolvedValue(mockCategories);
    });

    it("renders form fields, loads categories and submits valid data", async () => {
      const handleSave = vi.fn();
      const handleCancel = vi.fn();

      render(<ToolForm onSave={handleSave} onCancel={handleCancel} isLoading={false} />);

      await waitFor(() => {
        expect(screen.getByLabelText("Tool Name")).toBeTruthy();
      });

      fireEvent.change(screen.getByLabelText("Tool Name"), { target: { value: "New Tool" } });
      fireEvent.change(screen.getByLabelText("Description"), { target: { value: "A useful tool" } });
      fireEvent.change(screen.getByLabelText("Component URL (e.g., tools/converter/MyTool.jsx)"), {
        target: { value: "tools/converter/NewTool.jsx" },
      });
      fireEvent.change(screen.getByLabelText("Icon Filename (optional, e.g., icon.svg)"), {
        target: { value: "icon.svg" },
      });

      // Toggle checkboxes (line 195)
      const premiumCheckbox = screen.getByLabelText(/Premium Tool/i);
      fireEvent.click(premiumCheckbox);

      const submitButton = screen.getByRole("button", { name: "Add Tool" });
      fireEvent.click(submitButton);

      expect(handleSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "New Tool",
          description: "A useful tool",
          componentUrl: "tools/converter/NewTool.jsx",
          icon: "icon.svg",
          categoryName: "Converters",
          isEnabled: true,
          isPremium: true,
        })
      );
    });

    it("shows validation error if required fields are missing or invalid URL", async () => {
      const handleSave = vi.fn();
      render(<ToolForm onSave={handleSave} onCancel={vi.fn()} isLoading={false} />);

      await waitFor(() => {
        expect(screen.getByLabelText("Tool Name")).toBeTruthy();
      });

      const form = screen.getByRole("button", { name: "Add Tool" }).closest("form");

      // Submit empty
      fireEvent.submit(form);
      expect(handleSave).not.toHaveBeenCalled();
      expect(screen.getByText("Tool name is required.")).toBeTruthy();
      expect(screen.getByText("Tool description is required.")).toBeTruthy();
      expect(screen.getByText("Component URL is required.")).toBeTruthy();

      // Test invalid component url prefix
      fireEvent.change(screen.getByLabelText("Component URL (e.g., tools/converter/MyTool.jsx)"), {
        target: { value: "invalid/path" },
      });
      fireEvent.submit(form);
      expect(screen.getByText("URL must start with 'tools/'.")).toBeTruthy();
    });

    it("handles cancel button click", async () => {
      const handleCancel = vi.fn();
      render(<ToolForm onSave={vi.fn()} onCancel={handleCancel} isLoading={false} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
      });

      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(handleCancel).toHaveBeenCalledTimes(1);
    });

    it("prefills form fields from JSON file upload", async () => {
      render(<ToolForm onSave={vi.fn()} onCancel={vi.fn()} isLoading={false} />);

      await waitFor(() => {
        expect(screen.getByText("Quick Fill from Tool JSON")).toBeTruthy();
      });

      const file = new File(
        [
          JSON.stringify({
            name: "Prefilled Tool",
            description: "From JSON",
            componentUrl: "tools/dev/Prefilled.jsx",
            icon: "prefill.svg",
            categoryName: "Converters",
          }),
        ],
        "tool.json",
        { type: "application/json" }
      );

      const fileInput = screen.getByRole("button", { name: /Load JSON File/i }).parentElement.querySelector('input[type="file"]');
      fireEvent.change(fileInput, { target: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByDisplayValue("Prefilled Tool")).toBeTruthy();
        expect(screen.getByDisplayValue("From JSON")).toBeTruthy();
      });
    });

    it("handles failure to fetch categories gracefully", async () => {
      vi.mocked(api.apiAdminGetCategories).mockRejectedValueOnce(new Error("Network error"));
      render(<ToolForm onSave={vi.fn()} onCancel={vi.fn()} isLoading={false} />);

      await waitFor(() => {
        expect(screen.getByText("Failed to load categories.")).toBeTruthy();
      });
    });

    it("populates initialData for editing mode and matches categoryId", async () => {
      vi.mocked(api.apiAdminGetCategories).mockResolvedValue([
        { categoryId: 1, name: "Converters" },
        { categoryId: 2, name: "Crypto" },
      ]);

      const initialData = {
        name: "Existing Tool",
        description: "Existing Description",
        componentUrl: "tools/crypto/ExistingTool.jsx",
        categoryName: "Crypto",
        categoryId: 2,
        icon: "existing.svg",
        isPremium: true,
        isEnabled: false,
      };

      render(<ToolForm initialData={initialData} onSave={vi.fn()} onCancel={vi.fn()} isLoading={false} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue("Existing Tool")).toBeTruthy();
        expect(screen.getByDisplayValue("Existing Description")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Update Tool" })).toBeTruthy();
      });
    });

    it("validates field length limits and empty category", async () => {
      const handleSave = vi.fn();
      render(<ToolForm onSave={handleSave} onCancel={vi.fn()} isLoading={false} />);

      await waitFor(() => {
        expect(screen.getByLabelText("Tool Name")).toBeTruthy();
      });

      // Name > 50 chars, Component URL > 100 chars, Icon > 100 chars
      fireEvent.change(screen.getByLabelText("Tool Name"), {
        target: { value: "a".repeat(51) },
      });
      fireEvent.change(screen.getByLabelText("Description"), {
        target: { value: "A valid description" },
      });
      fireEvent.change(screen.getByLabelText("Category"), {
        target: { value: "" },
      });
      fireEvent.change(
        screen.getByLabelText("Component URL (e.g., tools/converter/MyTool.jsx)"),
        {
          target: { value: "tools/" + "b".repeat(95) },
        },
      );
      fireEvent.change(
        screen.getByLabelText("Icon Filename (optional, e.g., icon.svg)"),
        {
          target: { value: "c".repeat(101) },
        },
      );

      fireEvent.submit(screen.getByRole("button", { name: "Add Tool" }).closest("form"));

      await waitFor(() => {
        expect(screen.getByText("Tool name cannot exceed 50 characters.")).toBeTruthy();
        expect(screen.getByText("Category is required.")).toBeTruthy();
        expect(screen.getByText("Component URL cannot exceed 100 characters.")).toBeTruthy();
        expect(screen.getByText("Icon filename cannot exceed 100 characters.")).toBeTruthy();
      });
      expect(handleSave).not.toHaveBeenCalled();
    });

    it("matches category from initialData.categoryId when initialData provided without categoryName", async () => {
      render(
        <ToolForm
          onSave={vi.fn()}
          onCancel={vi.fn()}
          initialData={{
            toolId: 10,
            name: "Initial Tool",
            description: "Initial Desc",
            categoryId: 2, // matches Crypto
            componentUrl: "tools/crypto/Tool.jsx",
          }}
          isLoading={false}
        />
      );

      await waitFor(() => {
        const catSelect = screen.getByLabelText("Category");
        expect(catSelect.value).toBe("Crypto");
      });
    });

    it("handles null categories response gracefully", async () => {
      vi.mocked(api.apiAdminGetCategories).mockResolvedValueOnce(null);
      render(<ToolForm onSave={vi.fn()} onCancel={vi.fn()} isLoading={false} />);
      await waitFor(() => {
        expect(screen.getByLabelText("Tool Name")).toBeTruthy();
      });
    });

    it("alerts when uploaded JSON is invalid or not an object", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      render(<ToolForm onSave={vi.fn()} onCancel={vi.fn()} isLoading={false} />);

      const fileBtn = screen.getByRole("button", { name: /Load JSON File/i });
      fireEvent.click(fileBtn);

      const fileInput = fileBtn.parentElement.querySelector('input[type="file"]');

      // Invalid JSON syntax
      const badFile = new File(["not json content"], "bad.json", { type: "application/json" });
      fireEvent.change(fileInput, { target: { files: [badFile] } });
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalled();
      });

      // Non-object JSON
      const stringFile = new File(['"just a string"'], "string.json", { type: "application/json" });
      fireEvent.change(fileInput, { target: { files: [stringFile] } });
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("JSON must contain an object"));
      });

      // Empty array in JSON (hits line 63 !item branch)
      const emptyArrayFile = new File(['[]'], "emptyArray.json", { type: "application/json" });
      fireEvent.change(fileInput, { target: { files: [emptyArrayFile] } });
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("JSON must contain an object"));
      });

      // Empty file selection
      fireEvent.change(fileInput, { target: { files: [] } });

      alertSpy.mockRestore();
    });

    it("prefills form with PascalCase and alternate property keys from JSON", async () => {
      render(<ToolForm onSave={vi.fn()} onCancel={vi.fn()} isLoading={false} />);
      const fileBtn = screen.getByRole("button", { name: /Load JSON File/i });
      const fileInput = fileBtn.parentElement.querySelector('input[type="file"]');

      const pascalFile = new File(
        [
          JSON.stringify({
            Name: "Pascal Tool",
            Description: "Pascal Description",
            CategoryName: "Crypto",
            ComponentUrl: "tools/crypto/Pascal.jsx",
            Icon: "pascal.svg",
            IsPremium: true,
            IsEnabled: false,
          }),
        ],
        "pascal.json",
        { type: "application/json" }
      );
      fireEvent.change(fileInput, { target: { files: [pascalFile] } });

      await waitFor(() => {
        expect(screen.getByDisplayValue("Pascal Tool")).toBeTruthy();
        expect(screen.getByDisplayValue("Pascal Description")).toBeTruthy();
      });

      // Lowercase property keys
      const lowercaseFile = new File(
        [
          JSON.stringify({
            name: "Lower Tool",
            description: "Lower Description",
            categoryName: "Crypto",
            componentUrl: "tools/crypto/Lower.jsx",
            icon: "lower.svg",
            isPremium: false,
            isEnabled: true,
          }),
        ],
        "lower.json",
        { type: "application/json" }
      );
      fireEvent.change(fileInput, { target: { files: [lowercaseFile] } });
      await waitFor(() => {
        expect(screen.getByDisplayValue("Lower Tool")).toBeTruthy();
      });

      // Also test category/Category alternate properties
      const altFile = new File(
        [
          JSON.stringify({
            category: "Converters",
          }),
        ],
        "alt.json",
        { type: "application/json" }
      );
      fireEvent.change(fileInput, { target: { files: [altFile] } });
      await waitFor(() => {
        expect(screen.getByLabelText("Category").value).toBe("Converters");
      });

      const altFile2 = new File(
        [
          JSON.stringify({
            Category: "Crypto",
          }),
        ],
        "alt2.json",
        { type: "application/json" }
      );
      fireEvent.change(fileInput, { target: { files: [altFile2] } });
      await waitFor(() => {
        expect(screen.getByLabelText("Category").value).toBe("Crypto");
      });

      // Prefill with empty object to test prev values fallback (lines 212-226)
      const emptyObjFile = new File(['{}'], "emptyObj.json", { type: "application/json" });
      fireEvent.change(fileInput, { target: { files: [emptyObjFile] } });
      await waitFor(() => {
        expect(screen.getByDisplayValue("Lower Tool")).toBeTruthy();
      });
    });
  });

  describe("AdminToolsPage", () => {
    const mockTools = [
      {
        toolId: 1,
        name: "Hash Generator",
        description: "Generates hashes",
        categoryName: "Crypto",
        componentUrl: "tools/crypto/HashGenerator.jsx",
        icon: "hash.svg",
        slug: "hash-generator",
        isEnabled: true,
        isPremium: false,
        createdAt: "2026-01-01T00:00:00Z",
      },
    ];

    beforeEach(() => {
      vi.mocked(api.apiAdminGetAllTools).mockResolvedValue(mockTools);
      vi.mocked(api.apiAdminGetCategories).mockResolvedValue([{ categoryId: 1, name: "Crypto" }]);
    });

    it("fetches and displays tool list", async () => {
      render(<AdminToolsPage />);

      await waitFor(() => {
        expect(screen.getByText("Tool Management")).toBeTruthy();
        expect(screen.getByText("Hash Generator")).toBeTruthy();
      });
    });

    it("opens Add Tool modal and saves new tool", async () => {
      vi.mocked(api.apiAdminCreateTool).mockResolvedValueOnce({ success: true });

      render(<AdminToolsPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "+ Add New Tool" })).toBeTruthy();
      });

      fireEvent.click(screen.getByRole("button", { name: "+ Add New Tool" }));
      expect(screen.getByText("Add New Tool")).toBeTruthy();

      await waitFor(() => {
        expect(screen.getByLabelText("Category")).toBeTruthy();
      });

      fireEvent.change(screen.getByLabelText("Tool Name"), { target: { value: "New Tool" } });
      fireEvent.change(screen.getByLabelText("Description"), { target: { value: "New Description" } });
      fireEvent.change(screen.getByLabelText("Category"), { target: { value: "Crypto" } });
      fireEvent.change(screen.getByLabelText("Component URL (e.g., tools/converter/MyTool.jsx)"), {
        target: { value: "tools/crypto/NewTool.jsx" },
      });
      fireEvent.change(screen.getByLabelText("Icon Filename (optional, e.g., icon.svg)"), {
        target: { value: "new.svg" },
      });

      const submitBtn = screen.getByRole("button", { name: "Add Tool" });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(api.apiAdminCreateTool).toHaveBeenCalled();
      });
    });

    it("opens Edit Tool modal and updates tool", async () => {
      vi.mocked(api.apiAdminUpdateTool).mockResolvedValueOnce({ success: true });

      render(<AdminToolsPage />);

      await waitFor(() => {
        expect(screen.getByText("Hash Generator")).toBeTruthy();
      });

      const editButtons = screen.getAllByTitle("Edit");
      fireEvent.click(editButtons[0]);

      expect(screen.getByText("Edit Tool")).toBeTruthy();

      await waitFor(() => {
        expect(screen.getByLabelText("Category")).toBeTruthy();
      });

      const submitBtn = screen.getByRole("button", { name: "Update Tool" });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(api.apiAdminUpdateTool).toHaveBeenCalledWith(1, expect.any(Object));
      });
    });

    it("handles delete tool and catches error", async () => {
      vi.spyOn(window, "confirm").mockReturnValue(true);
      vi.spyOn(window, "alert").mockImplementation(() => {});
      vi.mocked(api.apiAdminDeleteTool).mockRejectedValueOnce(new Error("Cannot delete active tool"));

      render(<AdminToolsPage />);

      await waitFor(() => {
        expect(screen.getByText("Hash Generator")).toBeTruthy();
      });

      const deleteButtons = screen.getAllByTitle("Delete");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(api.apiAdminDeleteTool).toHaveBeenCalledWith(1);
        expect(window.alert).toHaveBeenCalledWith("Error deleting tool: Cannot delete active tool");
      });

      // Test delete error without message
      vi.mocked(api.apiAdminDeleteTool).mockRejectedValueOnce({});
      fireEvent.click(deleteButtons[0]);
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith("Error deleting tool: undefined");
      });

      // Test cancel delete when confirm returns false
      vi.spyOn(window, "confirm").mockReturnValueOnce(false);
      fireEvent.click(deleteButtons[0]);
    });

    it("handles tools fetch failure without error message", async () => {
      vi.mocked(api.apiAdminGetAllTools).mockRejectedValueOnce({});
      render(<AdminToolsPage />);
      await waitFor(() => {
        expect(screen.getByText("Failed to load tools.")).toBeTruthy();
      });
    });

    it("handles tools fetch returning null data", async () => {
      vi.mocked(api.apiAdminGetAllTools).mockResolvedValueOnce(null);
      render(<AdminToolsPage />);
      await waitFor(() => {
        expect(screen.getByText("Tool Management")).toBeTruthy();
      });
    });

    it("handles importing tools from JSON file and dismisses status", async () => {
      vi.mocked(api.apiAdminCreateTool).mockResolvedValue({ success: true });

      render(<AdminToolsPage />);

      await waitFor(() => {
        expect(screen.getByText("Tool Management")).toBeTruthy();
      });

      const jsonFile = new File(
        [
          JSON.stringify([
            {
              name: "Imported Tool",
              description: "Imported Desc",
              categoryName: "Crypto",
              componentUrl: "tools/crypto/Imported.jsx",
              icon: "imported.svg",
            },
          ]),
        ],
        "import.json",
        { type: "application/json" }
      );

      const fileInput = screen.getByRole("button", { name: /Import JSON/i }).parentElement.querySelector('input[type="file"]');
      fireEvent.change(fileInput, { target: { files: [jsonFile] } });

      await waitFor(() => {
        expect(screen.getByText(/Successfully imported 1 tool/i)).toBeTruthy();
      });

      // Dismiss status banner
      const closeBtn = screen.getByText("×");
      fireEvent.click(closeBtn);
      expect(screen.queryByText(/Successfully imported 1 tool/i)).toBeNull();
    });

    it("handles delete tool successfully and refreshes list", async () => {
      vi.spyOn(window, "confirm").mockReturnValue(true);
      vi.mocked(api.apiAdminDeleteTool).mockResolvedValueOnce({ success: true });

      render(<AdminToolsPage />);

      await waitFor(() => {
        expect(screen.getByText("Hash Generator")).toBeTruthy();
      });

      const deleteButtons = screen.getAllByTitle("Delete");
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(api.apiAdminDeleteTool).toHaveBeenCalledWith(1);
        expect(api.apiAdminGetAllTools).toHaveBeenCalledTimes(2);
      });
    });

    it("displays error message when fetching tools fails", async () => {
      vi.mocked(api.apiAdminGetAllTools).mockRejectedValueOnce(new Error("Database unavailable"));

      render(<AdminToolsPage />);

      await waitFor(() => {
        expect(screen.getByText("Database unavailable")).toBeTruthy();
      });
    });

    it("handles error when saving tool fails", async () => {
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(api.apiAdminCreateTool).mockRejectedValueOnce(new Error("Duplicate slug"));

      render(<AdminToolsPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "+ Add New Tool" })).toBeTruthy();
      });

      fireEvent.click(screen.getByRole("button", { name: "+ Add New Tool" }));

      await waitFor(() => {
        expect(screen.getByLabelText("Category")).toBeTruthy();
      });

      fireEvent.change(screen.getByLabelText("Tool Name"), { target: { value: "New Tool" } });
      fireEvent.change(screen.getByLabelText("Description"), { target: { value: "New Description" } });
      fireEvent.change(screen.getByLabelText("Category"), { target: { value: "Crypto" } });
      fireEvent.change(screen.getByLabelText("Component URL (e.g., tools/converter/MyTool.jsx)"), {
        target: { value: "tools/crypto/NewTool.jsx" },
      });
      fireEvent.change(screen.getByLabelText("Icon Filename (optional, e.g., icon.svg)"), {
        target: { value: "new.svg" },
      });

      fireEvent.click(screen.getByRole("button", { name: "Add Tool" }));

      await waitFor(() => {
        expect(screen.getByText(/Save failed: Duplicate slug/i)).toBeTruthy();
      });
      errSpy.mockRestore();
    });

    it("displays error when importing empty JSON array", async () => {
      render(<AdminToolsPage />);

      await waitFor(() => {
        expect(screen.getByText("Tool Management")).toBeTruthy();
      });

      const emptyFile = new File(["[]"], "empty.json", { type: "application/json" });
      const fileInput = screen.getByRole("button", { name: /Import JSON/i }).parentElement.querySelector('input[type="file"]');
      fireEvent.change(fileInput, { target: { files: [emptyFile] } });

      await waitFor(() => {
        expect(screen.getByText("JSON file does not contain any tool definitions.")).toBeTruthy();
      });
    });

    it("displays authenticating state when unauthenticated", () => {
      mockAuthData.isAuthenticated = false;
      render(<AdminToolsPage />);
      expect(screen.getByText("Authenticating...")).toBeTruthy();
      mockAuthData.isAuthenticated = true;
    });

    it("handles invalid JSON file and import button click during import", async () => {
      render(<AdminToolsPage />);

      await waitFor(() => {
        expect(screen.getByText("Hash Generator")).toBeTruthy();
      });

      const importBtn = screen.getByRole("button", { name: /Import JSON/i });
      fireEvent.click(importBtn);

      const invalidJsonFile = new File(["not valid json{"], "broken.json", {
        type: "application/json",
      });
      const fileInput = importBtn.parentElement.querySelector('input[type="file"]');
      fireEvent.change(fileInput, { target: { files: [invalidJsonFile] } });

      await waitFor(() => {
        expect(screen.getByText(/Invalid JSON file format/i)).toBeTruthy();
      });
    });

    it("handles tools failing validation during JSON import", async () => {
      render(<AdminToolsPage />);

      await waitFor(() => {
        expect(screen.getByText("Hash Generator")).toBeTruthy();
      });

      const invalidToolsFile = new File(
        [
          JSON.stringify([
            { name: "Incomplete Tool" }, // missing componentUrl and category
          ]),
        ],
        "incomplete.json",
        { type: "application/json" }
      );

      const fileInput = screen.getByRole("button", { name: /Import JSON/i }).parentElement.querySelector('input[type="file"]');
      fireEvent.change(fileInput, { target: { files: [invalidToolsFile] } });

      await waitFor(() => {
        expect(screen.getByText(/Failed to import/i)).toBeTruthy();
      });
    });

    it("handles partial tool import with warning status when some tools fail validation or creation", async () => {
      vi.mocked(api.apiAdminCreateTool)
        .mockResolvedValueOnce({ success: true }) // First valid tool succeeds
        .mockRejectedValueOnce(new Error("Server creation error")); // Second valid tool fails

      render(<AdminToolsPage />);

      await waitFor(() => {
        expect(screen.getByText("Hash Generator")).toBeTruthy();
      });

      const mixedToolsFile = new File(
        [
          JSON.stringify([
            // Valid tool that succeeds
            {
              name: "Tool A",
              description: "Desc A",
              categoryName: "Crypto",
              componentUrl: "tools/crypto/ToolA.jsx",
            },
            // Tool with invalid componentUrl (doesn't start with tools/)
            {
              name: "Tool B",
              description: "Desc B",
              categoryName: "Crypto",
              componentUrl: "invalid/ToolB.jsx",
            },
            // Valid tool that fails API creation
            {
              name: "Tool C",
              description: "Desc C",
              categoryName: "Crypto",
              componentUrl: "tools/crypto/ToolC.jsx",
            },
          ]),
        ],
        "mixed.json",
        { type: "application/json" }
      );

      const fileInput = screen.getByRole("button", { name: /Import JSON/i }).parentElement.querySelector('input[type="file"]');
      fireEvent.change(fileInput, { target: { files: [mixedToolsFile] } });

      await waitFor(() => {
        expect(screen.getByText(/Imported 1 tool.*Issues:/i)).toBeTruthy();
      });
    });

    it("handles single object JSON import, tool missing name, empty files, and import error fallback", async () => {
      vi.mocked(api.apiAdminCreateTool).mockResolvedValue({ toolId: 50 });
      render(<AdminToolsPage />);

      await waitFor(() => {
        expect(screen.getByText("Hash Generator")).toBeTruthy();
      });

      const fileInput = screen.getByRole("button", { name: /Import JSON/i }).parentElement.querySelector('input[type="file"]');

      // Empty file selection (line 118: if (!file) return)
      fireEvent.change(fileInput, { target: { files: [] } });

      // Single object JSON (not array) with missing name (line 133 & line 147)
      const singleObjectFile = new File(
        [
          JSON.stringify({
            categoryName: "Crypto",
            componentUrl: "tools/crypto/NoName.jsx",
          }),
        ],
        "single.json",
        { type: "application/json" }
      );
      fireEvent.change(fileInput, { target: { files: [singleObjectFile] } });

      await waitFor(() => {
        expect(screen.getByText(/missing name, componentUrl, or categoryName/i)).toBeTruthy();
      });

      // Error without message during JSON processing (line 195)
      const errorFile = {
        text: () => Promise.reject({ message: "" }),
      };
      fireEvent.change(fileInput, { target: { files: [errorFile] } });
      await waitFor(() => {
        expect(screen.getByText("Failed to import JSON file.")).toBeTruthy();
      });
    });
  });

  describe("AdminUsersPage", () => {
    it("fetches and displays user list", async () => {
      vi.mocked(api.apiAdminGetAllUsers).mockResolvedValue([
        { userId: 1, username: "alice", role: "Admin", createdAt: "2026-01-01T00:00:00Z" },
        { userId: 2, username: "bob", role: "User", createdAt: "2026-01-02T00:00:00Z" },
      ]);

      render(<AdminUsersPage />);

      await waitFor(() => {
        expect(screen.getByText("User Management")).toBeTruthy();
        expect(screen.getByText("alice")).toBeTruthy();
        expect(screen.getByText("bob")).toBeTruthy();
      });
    });

    it("displays error message if user fetch fails", async () => {
      vi.mocked(api.apiAdminGetAllUsers).mockRejectedValue(new Error("Database offline"));

      render(<AdminUsersPage />);

      await waitFor(() => {
        expect(screen.getByText("Database offline")).toBeTruthy();
      });
    });

    it("displays default error message when users fetch fails with empty error message", async () => {
      vi.mocked(api.apiAdminGetAllUsers).mockRejectedValueOnce(new Error(""));
      render(<AdminUsersPage />);
      await waitFor(() => {
        expect(screen.getByText("Failed to load users.")).toBeTruthy();
      });
    });

    it("displays authenticating state when unauthenticated", () => {
      mockAuthData.isAuthenticated = false;
      render(<AdminUsersPage />);
      expect(screen.getByText("Authenticating...")).toBeTruthy();
      mockAuthData.isAuthenticated = true;
    });
  });

  describe("AdminUpgradeRequestsPage", () => {
    const mockRequests = [
      {
        requestId: 101,
        userId: 2,
        username: "bob",
        status: "Pending",
        requestedAt: "2026-01-01T12:00:00Z",
      },
    ];

    it("fetches and displays pending requests", async () => {
      vi.mocked(api.apiAdminGetPendingRequests).mockResolvedValue(mockRequests);

      render(<AdminUpgradeRequestsPage />);

      await waitFor(() => {
        expect(screen.getByText("Pending Premium Requests")).toBeTruthy();
        expect(screen.getByText("bob")).toBeTruthy();
      });
    });

    it("handles approving upgrade request and ignores second click while in flight", async () => {
      let resolveProcess;
      vi.mocked(api.apiAdminGetPendingRequests).mockResolvedValue(mockRequests);
      vi.mocked(api.apiAdminProcessRequest).mockImplementationOnce(
        () => new Promise((res) => { resolveProcess = res; })
      );

      render(<AdminUpgradeRequestsPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Approve" })).toBeTruthy();
      });

      // First click
      fireEvent.click(screen.getByRole("button", { name: "Approve" }));
      // Second click hits line 34: if (processingId) return;
      fireEvent.click(screen.getByRole("button", { name: "Approve" }));
      expect(api.apiAdminProcessRequest).toHaveBeenCalledTimes(1);

      resolveProcess({ success: true });
    });

    it("handles rejecting upgrade request", async () => {
      vi.mocked(api.apiAdminGetPendingRequests).mockResolvedValue(mockRequests);
      vi.mocked(api.apiAdminProcessRequest).mockResolvedValue({ success: true });

      render(<AdminUpgradeRequestsPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Reject" })).toBeTruthy();
      });

      fireEvent.click(screen.getByRole("button", { name: "Reject" }));

      expect(api.apiAdminProcessRequest).toHaveBeenCalledWith(101, { newStatus: "Rejected" });
    });

    it("handles error during processing upgrade request including empty message fallback", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(api.apiAdminGetPendingRequests).mockResolvedValue(mockRequests);
      vi.mocked(api.apiAdminProcessRequest).mockRejectedValueOnce(new Error(""));

      render(<AdminUpgradeRequestsPage />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Approve" })).toBeTruthy();
      });

      fireEvent.click(screen.getByRole("button", { name: "Approve" }));

      await waitFor(() => {
        expect(screen.getByText("Failed to Approved request.")).toBeTruthy();
      });

      alertSpy.mockRestore();
      errSpy.mockRestore();
    });

    it("displays error message if requests fetch fails including empty message fallback", async () => {
      vi.mocked(api.apiAdminGetPendingRequests).mockRejectedValueOnce(new Error(""));

      render(<AdminUpgradeRequestsPage />);

      await waitFor(() => {
        expect(screen.getByText("Failed to load upgrade requests.")).toBeTruthy();
      });
    });

    it("displays authenticating state when unauthenticated", () => {
      mockAuthData.isAuthenticated = false;
      render(<AdminUpgradeRequestsPage />);
      expect(screen.getByText("Authenticating...")).toBeTruthy();
      mockAuthData.isAuthenticated = true;
    });
  });
});
