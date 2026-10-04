import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Button from "../../src/components/ui/Button.jsx";
import Input from "../../src/components/ui/Input.jsx";
import TextArea from "../../src/components/ui/TextArea.jsx";
import Switch from "../../src/components/ui/Switch.jsx";
import Spinner from "../../src/components/ui/Spinner.jsx";
import ColorInput from "../../src/components/ui/ColorInput.jsx";
import CopyToClipboardButton from "../../src/components/ui/CopyToClipboardButton.jsx";
import Select from "../../src/components/ui/Select.jsx";
import Modal from "../../src/components/ui/Modal.jsx";
import Table, { compareValues } from "../../src/components/ui/Table.jsx";
import FavoriteButton from "../../src/components/ui/FavoriteButton.jsx";

let mockAuth = {
  user: { userId: 1, username: "test" },
  isAuthenticated: true,
  favoriteToolIds: new Set([10]),
  addFavorite: vi.fn().mockResolvedValue(true),
  removeFavorite: vi.fn().mockResolvedValue(true),
};

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockAuth,
}));

// Mock HTMLDialogElement for Modal in jsdom
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function () {
    this.open = true;
  });
  HTMLDialogElement.prototype.close = vi.fn(function () {
    this.open = false;
  });
});

describe("UI Primitives Component Suite", () => {
  describe("Button", () => {
    it("renders text and responds to click events", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      const button = screen.getByRole("button", { name: "Click Me" });
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("disables button when disabled or isLoading prop is provided", () => {
      const handleClick = vi.fn();
      const { rerender } = render(<Button disabled onClick={handleClick}>Disabled</Button>);
      const button = screen.getByRole("button");
      expect(button.disabled).toBe(true);
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();

      // Test isLoading variant
      rerender(<Button isLoading onClick={handleClick}>Loading</Button>);
      expect(screen.getByRole("status")).toBeTruthy();
    });
  });

  describe("Input", () => {
    it("renders label, placeholder, and updates value", () => {
      const handleChange = vi.fn();
      render(
        <Input
          label="Email Address"
          id="email-input"
          placeholder="user@example.com"
          onChange={handleChange}
        />
      );

      expect(screen.getByLabelText("Email Address")).toBeTruthy();
      const input = screen.getByPlaceholderText("user@example.com");
      fireEvent.change(input, { target: { value: "test@domain.com" } });
      expect(handleChange).toHaveBeenCalled();
    });

    it("displays error message and sets aria-invalid", () => {
      render(
        <Input
          label="Username"
          id="username"
          error="Username is required"
        />
      );

      const input = screen.getByLabelText("Username");
      expect(input.getAttribute("aria-invalid")).toBe("true");
      expect(screen.getByText("Username is required")).toBeTruthy();
    });
  });

  describe("TextArea", () => {
    it("renders label, placeholder, and accepts multiline input", () => {
      render(
        <TextArea
          label="Comments"
          id="comments"
          placeholder="Write comments..."
          defaultValue="Initial comment"
        />
      );

      const textarea = screen.getByLabelText("Comments");
      expect(textarea.value).toBe("Initial comment");
      fireEvent.change(textarea, { target: { value: "New comment line 1\nLine 2" } });
      expect(textarea.value).toBe("New comment line 1\nLine 2");
    });
  });

  describe("Switch", () => {
    it("implements WAI-ARIA switch pattern with toggle behavior", () => {
      const handleToggle = vi.fn();
      render(
        <Switch
          id="notifications-toggle"
          label="Enable Notifications"
          checked={false}
          onChange={handleToggle}
        />
      );

      const switchBtn = screen.getByRole("switch");
      expect(switchBtn.getAttribute("aria-checked")).toBe("false");
      expect(screen.getByText("Enable Notifications")).toBeTruthy();

      fireEvent.click(switchBtn);
      expect(handleToggle).toHaveBeenCalledWith(true);
    });

    it("prevents toggle when disabled", () => {
      const handleToggle = vi.fn();
      render(
        <Switch
          label="Dark Mode"
          checked={true}
          disabled={true}
          onChange={handleToggle}
        />
      );

      const switchBtn = screen.getByRole("switch");
      expect(switchBtn.disabled).toBe(true);
      fireEvent.click(switchBtn);
      expect(handleToggle).not.toHaveBeenCalled();
    });

    it("handles srLabel and defaults when label/srLabel is missing, and handles missing onChange", () => {
      // srLabel
      const { rerender } = render(<Switch srLabel="Custom SR" checked={false} />);
      expect(screen.getByRole("switch").getAttribute("aria-label")).toBe("Custom SR");

      // No label and no srLabel -> defaults to "Toggle"
      rerender(<Switch checked={false} />);
      expect(screen.getByRole("switch").getAttribute("aria-label")).toBe("Toggle");

      // Click with no onChange prop
      fireEvent.click(screen.getByRole("switch"));
    });
  });

  describe("Spinner", () => {
    it("renders accessible loading indicator", () => {
      render(<Spinner size="lg" />);
      const spinner = screen.getByRole("status");
      expect(spinner.getAttribute("aria-live")).toBe("polite");
    });
  });

  describe("ColorInput", () => {
    it("renders label, color picker and text input", () => {
      const handleChange = vi.fn();
      render(
        <ColorInput
          label="Theme Color"
          id="theme-color"
          value="#ff0000"
          onChange={handleChange}
        />
      );

      expect(screen.getByText("Theme Color")).toBeTruthy();
      const textInput = screen.getAllByDisplayValue("#ff0000")[1];
      fireEvent.change(textInput, { target: { value: "#00ff00", type: "text" } });
      expect(handleChange).toHaveBeenCalledWith("#00ff00");

      // Test without leading '#'
      fireEvent.change(textInput, { target: { value: "112233", type: "text" } });
      expect(handleChange).toHaveBeenCalledWith("#112233");

      // Test without label prop (line 34 fallback)
      render(<ColorInput id="no-label-color" value="#123456" onChange={handleChange} />);
      expect(screen.getByLabelText("Color picker")).toBeTruthy();
    });
  });

  describe("CopyToClipboardButton", () => {
    it("copies text to clipboard when clicked and resets state", async () => {
      vi.useFakeTimers();
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      });

      render(<CopyToClipboardButton textToCopy="Copy text string" />);
      const copyBtn = screen.getByRole("button", { name: /Copy/i });

      await act(async () => {
        fireEvent.click(copyBtn);
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Copy text string");
      expect(screen.getByText(/Copied!/i)).toBeTruthy();

      act(() => {
        vi.advanceTimersByTime(2100);
      });
      expect(screen.getByText(/Copy/i)).toBeTruthy();
      vi.useRealTimers();
    });

    it("alerts when clipboard API is not supported", () => {
      const originalClipboard = navigator.clipboard;
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });

      render(<CopyToClipboardButton textToCopy="test" />);
      const btn = screen.getByRole("button");
      fireEvent.click(btn);

      expect(alertSpy).toHaveBeenCalledWith("Clipboard API not supported by your browser. Please copy manually.");

      Object.defineProperty(navigator, "clipboard", { value: originalClipboard, configurable: true });
      alertSpy.mockRestore();
    });

    it("handles clipboard writeText rejection gracefully", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error("Permission denied")),
        },
      });

      render(<CopyToClipboardButton textToCopy="fail text" />);
      const btn = screen.getByRole("button");
      await fireEvent.click(btn);

      expect(alertSpy).toHaveBeenCalledWith("Failed to copy text to clipboard.");
      alertSpy.mockRestore();
      errSpy.mockRestore();
    });

    it("is disabled when contentToCopy is empty or disabled prop is passed", () => {
      const { rerender } = render(<CopyToClipboardButton textToCopy="" />);
      expect(screen.getByRole("button").disabled).toBe(true);

      rerender(<CopyToClipboardButton textToCopy="some text" disabled />);
      expect(screen.getByRole("button").disabled).toBe(true);
    });
  });

  describe("Select", () => {
    it("renders options, handles selection, and displays error", () => {
      const handleChange = vi.fn();
      const options = [
        { value: "opt1", label: "Option 1" },
        { value: "opt2", label: "Option 2" },
      ];

      render(
        <Select
          label="Category"
          id="category-select"
          options={options}
          onChange={handleChange}
          error="Please select a category"
        />
      );

      expect(screen.getByLabelText("Category")).toBeTruthy();
      expect(screen.getByText("Please select a category")).toBeTruthy();

      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: "opt2" } });
      expect(handleChange).toHaveBeenCalled();
    });

    it("handles name, generated ID, disabled, and placeholder attributes", () => {
      // name without id
      const { rerender } = render(<Select name="testName" placeholder="Choose..." required disabled />);
      const select = screen.getByRole("combobox");
      expect(select.id).toBe("testName");
      expect(select.disabled).toBe(true);

      // neither id nor name, placeholder not required
      rerender(<Select placeholder="Optional..." required={false} />);
      expect(screen.getByRole("combobox").id).toBeTruthy();
    });
  });

  describe("Modal", () => {
    it("renders title, content, and triggers onClose", () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Modal body content</p>
        </Modal>
      );

      expect(screen.getByText("Test Modal")).toBeTruthy();
      expect(screen.getByText("Modal body content")).toBeTruthy();

      const closeBtn = screen.getByRole("button");
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalled();
    });

    it("handles backdrop click and cancel event to trigger onClose", () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Backdrop Modal">
          <p>Backdrop content</p>
        </Modal>
      );

      const dialog = document.querySelector("dialog");
      expect(dialog).toBeTruthy();

      // Click on dialog directly (backdrop)
      fireEvent.click(dialog);
      expect(handleClose).toHaveBeenCalled();

      // Dispatch cancel event (Escape key)
      const cancelEvt = new Event("cancel");
      dialog.dispatchEvent(cancelEvt);
      expect(handleClose).toHaveBeenCalledTimes(2);
    });

    it("returns null when isOpen is false and closes on unmount", () => {
      const { container, rerender } = render(
        <Modal isOpen={true} onClose={() => {}} title="Toggling Modal">
          <p>Visible then hidden</p>
        </Modal>
      );
      expect(container.firstChild).toBeTruthy();

      rerender(
        <Modal isOpen={false} onClose={() => {}} title="Toggling Modal">
          <p>Visible then hidden</p>
        </Modal>
      );
      expect(container.firstChild).toBeNull();
    });

    it("handles unmount while open and fallback for unknown size", () => {
      const { unmount } = render(
        <Modal isOpen={true} onClose={() => {}} title="Size Modal" size="massive">
          <p>Massive modal</p>
        </Modal>
      );
      unmount();

      // Test unmount when dialog.open was already closed/false
      const { container, unmount: unmount2 } = render(
        <Modal isOpen={true} onClose={() => {}} title="Closed Modal">
          <p>Closed</p>
        </Modal>
      );
      const dialog = container.querySelector("dialog");
      if (dialog) dialog.open = false;
      unmount2();
    });
  });

  describe("Table", () => {
    it("renders column headers and data rows, handles search and sorting", () => {
      const columns = [
        { key: "name", label: "Tool Name" },
        { key: "category", label: "Category" },
      ];
      const data = [
        { name: "Base64", category: "Converters" },
        { name: "JSON Formatter", category: "Development" },
      ];

      render(<Table columns={columns} data={data} />);

      expect(screen.getAllByText("Tool Name").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Category").length).toBeGreaterThan(0);
      expect(screen.getByText("Base64")).toBeTruthy();
      expect(screen.getByText("JSON Formatter")).toBeTruthy();

      // Search filter
      const searchInput = screen.getByPlaceholderText(/Search in table/i);
      fireEvent.change(searchInput, { target: { value: "Base" } });
      expect(screen.getByText("Base64")).toBeTruthy();
      expect(screen.queryByText("JSON Formatter")).toBeNull();

      // Search filter yielding no results
      fireEvent.change(searchInput, { target: { value: "NonExistent" } });
      expect(screen.getByText(/No items found matching "NonExistent"/i)).toBeTruthy();

      const clearBtn = screen.getByText("Clear search filter");
      fireEvent.click(clearBtn);
      expect(screen.getByText("Base64")).toBeTruthy();
    });

    it("renders empty state when data array is empty", () => {
      render(<Table columns={[{ key: "id", label: "ID" }]} data={[]} />);
      expect(screen.getByText("No data available.")).toBeTruthy();
    });

    it("renders various column types: boolean, isEnabled, isPremium, date, null, and custom render", () => {
      const handleApprove = vi.fn();
      const handleReject = vi.fn();
      const columns = [
        { key: "name", label: "Name" },
        { key: "isEnabled", label: "Status" },
        { key: "isPremium", label: "Premium" },
        { key: "verified", label: "Verified" },
        { key: "dateObj", label: "Created Date" },
        { key: "dateStr", label: "Date String" },
        { key: "custom", label: "Custom", render: (row) => <span>Custom: {row.name}</span> },
        { key: "nullVal", label: "Empty" },
      ];

      const data = [
        {
          id: 1,
          name: "Item 1",
          isEnabled: true,
          isPremium: true,
          verified: true,
          dateObj: new Date("2026-01-01T00:00:00Z"),
          dateStr: "2026-01-01T12:00:00Z",
          nullVal: null,
        },
        {
          id: 2,
          name: "Item 2",
          isEnabled: false,
          isPremium: false,
          verified: false,
          dateObj: new Date("2026-02-01T00:00:00Z"),
          dateStr: "2026-02-01T12:00:00Z",
          nullVal: undefined,
        },
      ];

      render(
        <Table
          columns={columns}
          data={data}
          actions={{ approve: handleApprove, reject: handleReject }}
        />
      );

      expect(screen.getByText("Enabled")).toBeTruthy();
      expect(screen.getByText("Disabled")).toBeTruthy();
      expect(screen.getByText("Yes")).toBeTruthy();
      expect(screen.getByText("No")).toBeTruthy();
      expect(screen.getByText("Custom: Item 1")).toBeTruthy();
      expect(screen.getAllByText("-").length).toBeGreaterThan(0);

      const approveButtons = screen.getAllByTitle("Approve");
      fireEvent.click(approveButtons[0]);
      expect(handleApprove).toHaveBeenCalledWith(data[0]);

      const rejectButtons = screen.getAllByTitle("Reject");
      fireEvent.click(rejectButtons[0]);
      expect(handleReject).toHaveBeenCalledWith(data[0]);
    });

    it("supports sorting by toolbar dropdown, toggling sort direction, and clearing sort badge", () => {
      const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "score", label: "Score" },
      ];
      const data = [
        { id: 1, name: "Charlie", score: 50 },
        { id: 2, name: "Alice", score: 90 },
        { id: 3, name: "Bob", score: 70 },
      ];

      render(<Table columns={columns} data={data} />);

      // Add sort rule from select
      const addSelect = screen.getByLabelText("Add sort field");
      fireEvent.change(addSelect, { target: { value: "score" } });

      // Click the sort badge button to toggle asc -> desc
      const sortBadge = screen.getByTitle("Toggle Ascending / Descending");
      fireEvent.click(sortBadge);

      // Remove sort rule using remove button on badge
      const removeBtn = screen.getByTitle("Remove field");
      fireEvent.click(removeBtn);
    });

    it("supports column sorting, reset sort, and action callbacks", () => {
      const handleEdit = vi.fn();
      const handleDelete = vi.fn();

      const columns = [
        { key: "name", label: "Tool Name" },
        { key: "isPremium", label: "Premium" },
      ];
      const data = [
        { name: "Alpha", isPremium: false },
        { name: "Beta", isPremium: true },
      ];

      render(
        <Table
          columns={columns}
          data={data}
          initialSort={[{ key: "name", direction: "asc" }]}
          actions={{ edit: handleEdit, delete: handleDelete }}
        />
      );

      // Click column header to sort
      const header = screen.getAllByText("Tool Name")[0];
      fireEvent.click(header.closest("th") || header);

      // Verify actions
      const editButtons = screen.getAllByTitle("Edit");
      fireEvent.click(editButtons[0]);
      expect(handleEdit).toHaveBeenCalledWith(data[0]);

      const deleteButtons = screen.getAllByTitle("Delete");
      fireEvent.click(deleteButtons[0]);
      expect(handleDelete).toHaveBeenCalledWith(data[0]);

      // Reset sort button
      const resetBtn = screen.getByText("Reset sort");
      fireEvent.click(resetBtn);
    });

    it("supports Shift+click multi-sort, keyboard header navigation, clear search button, and date/boolean search", () => {
      const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "active", label: "Active" },
        { key: "created", label: "Created" },
        { key: "noLabel" },
      ];
      const data = [
        { id: 1, name: "Alpha", active: true, created: new Date("2026-03-01T00:00:00Z"), noLabel: "NL1" },
        { id: 2, name: "Beta", active: false, created: new Date("2026-01-01T00:00:00Z"), noLabel: "NL2" },
        { id: 3, name: "Gamma", active: true, created: new Date("2026-02-01T00:00:00Z"), noLabel: "NL3" },
        { id: 4, name: null, active: null, created: null, noLabel: null },
      ];

      render(<Table columns={columns} data={data} />);

      const headers = screen.getAllByRole("columnheader");

      // Shift+Click multi-sort: click ID, then Shift+click Name
      fireEvent.click(headers[0]);
      fireEvent.click(headers[1], { shiftKey: true });
      expect(screen.getByText("1.")).toBeTruthy();
      expect(screen.getByText("2.")).toBeTruthy();

      // Shift+Click Name again to flip to desc, then again to remove from sort
      fireEvent.click(headers[1], { shiftKey: true });
      fireEvent.click(headers[1], { shiftKey: true });

      // Single column sort 3-state cycle (asc -> desc -> cleared)
      fireEvent.click(headers[0]); // asc
      fireEvent.click(headers[0]); // desc
      fireEvent.click(headers[0]); // cleared

      // Keyboard navigation on header (Enter and Space and Tab)
      fireEvent.keyDown(headers[2], { key: "Tab" });
      fireEvent.keyDown(headers[2], { key: "Enter" });
      fireEvent.keyDown(headers[3], { key: " " });

      // Search boolean status "true" / "enabled"
      const searchInput = screen.getByPlaceholderText(/Search in table/i);
      fireEvent.change(searchInput, { target: { value: "true" } });
      expect(screen.getByText("Alpha")).toBeTruthy();

      // Clear search via X button in TableToolbar
      const clearSearchXBtn = screen.getByTitle("Clear search");
      fireEvent.click(clearSearchXBtn);
      expect(searchInput.value).toBe("");

      // Search date
      fireEvent.change(searchInput, { target: { value: "2026" } });
      expect(screen.getByText("Beta")).toBeTruthy();

      // Add sort rule from select dropdown for column without label
      const addSortSelect = screen.getByLabelText("Add sort field");
      fireEvent.change(addSortSelect, { target: { value: "" } });
      fireEvent.change(addSortSelect, { target: { value: "noLabel" } });
      const toggleSortDirectionBtns = screen.getAllByTitle("Toggle Ascending / Descending");
      expect(toggleSortDirectionBtns.length).toBeGreaterThan(0);

      // Toggle sort direction in TableSortBar (asc -> desc, then desc -> asc)
      fireEvent.click(toggleSortDirectionBtns[0]);
      fireEvent.click(toggleSortDirectionBtns[0]);

      // Remove sort rule
      const removeFieldBtns = screen.getAllByTitle("Remove field");
      fireEvent.click(removeFieldBtns[0]);

      // Add sort rule again and reset sort
      fireEvent.change(addSortSelect, { target: { value: "name" } });
      const resetSortBtn = screen.getByText("Reset sort");
      fireEvent.click(resetSortBtn);

      // Direct compareValues tests for edge cases
      expect(compareValues(1, null, "asc")).toBe(-1);
      expect(compareValues(null, 1, "asc")).toBe(1);
      expect(compareValues(false, true, "asc")).toBe(1);
      expect(compareValues(true, false, "asc")).toBe(-1);
    });

    it("handles non-date strings in date column and completely hidden toolbar", () => {
      const columns = [
        { key: "val", label: "Value", sortable: false },
      ];
      const data = [
        { val: "2026-99-99-invalid" },
        { val: "not-a-date-long-enough" },
      ];

      const { container } = render(
        <Table columns={columns} data={data} searchable={false} showSortBar={false} />
      );
      expect(screen.getByText("2026-99-99-invalid")).toBeTruthy();
      expect(screen.queryByPlaceholderText(/Search in table/i)).toBeNull();
    });

    it("covers date string comparisons, null/undefined sorting, duplicate sort rules, and hidden toolbar with non-sortable columns", () => {
      const columns = [
        { key: "created", label: "Created Date" },
        { key: "val", label: "Val", sortValue: (row) => (row.val ? row.val.toLowerCase() : "") },
      ];
      const data = [
        { id: 1, created: "2026-05-15T00:00:00Z", val: null },
        { id: 2, created: "2026-01-10T00:00:00Z", val: "Alpha" },
        { id: 3, created: "2026-99-99T00:00:00Z", val: undefined },
      ];

      render(<Table columns={columns} data={data} />);

      const headers = screen.getAllByRole("columnheader");

      // Sort by created (string ISO date)
      fireEvent.click(headers[0]);
      // Sort by val (triggers a === null and b === null in compareValues)
      fireEvent.click(headers[1]);
      // Sort descending by val
      fireEvent.click(headers[1]);

      // Search with null/undefined values to trigger row[col.key] === null branch
      const searchInput = screen.getByPlaceholderText(/Search in table/i);
      fireEvent.change(searchInput, { target: { value: "Alpha" } });
      expect(screen.getByText("Alpha")).toBeTruthy();

      // Trigger addSortRule with duplicate key
      const addSortSelect = screen.getByLabelText("Add sort field");
      fireEvent.change(addSortSelect, { target: { value: "created" } });
      fireEvent.change(addSortSelect, { target: { value: "created" } });

      // Test shouldShowToolbar false when searchable=false, showSortBar=true, but all columns are sortable: false
      const nonSortableCols = [{ key: "c", label: "C", sortable: false }];
      const { container } = render(
        <Table columns={nonSortableCols} data={[{ c: 1 }]} searchable={false} showSortBar={true} />
      );
      expect(container.querySelector("input")).toBeNull();
    });
  });

  describe("FavoriteButton", () => {
    it("returns null when not authenticated", () => {
      mockAuth.isAuthenticated = false;
      const { container } = render(<FavoriteButton toolId={10} />);
      expect(container.firstChild).toBeNull();
    });

    it("renders favorite button and removes favorite on click when tool is favorited", async () => {
      mockAuth.isAuthenticated = true;
      mockAuth.favoriteToolIds = new Set([10]);
      const handleToggle = vi.fn();

      render(<FavoriteButton toolId={10} onToggle={handleToggle} />);
      const btn = screen.getByTitle("Remove from favorites");
      expect(btn).toBeTruthy();

      fireEvent.click(btn);
      expect(mockAuth.removeFavorite).toHaveBeenCalledWith(10);
    });

    it("renders favorite button and adds favorite on click when tool is not favorited", async () => {
      mockAuth.isAuthenticated = true;
      mockAuth.favoriteToolIds = new Set();
      const handleToggle = vi.fn();

      render(<FavoriteButton toolId={99} onToggle={handleToggle} />);
      const btn = screen.getByTitle("Add to favorites");
      expect(btn).toBeTruthy();

      fireEvent.click(btn);
      expect(mockAuth.addFavorite).toHaveBeenCalledWith(99);
    });

    it("prevents double execution while processing", () => {
      mockAuth.isAuthenticated = true;
      mockAuth.favoriteToolIds = new Set();
      let resolveFn;
      mockAuth.addFavorite = vi.fn().mockImplementation(() => new Promise((res) => { resolveFn = res; }));

      render(<FavoriteButton toolId={99} />);
      const btn = screen.getByTitle("Add to favorites");
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(mockAuth.addFavorite).toHaveBeenCalledTimes(1);
      resolveFn(true);
    });

    it("alerts when addFavorite or removeFavorite fails", async () => {
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
      mockAuth.isAuthenticated = true;
      mockAuth.favoriteToolIds = new Set();
      mockAuth.addFavorite = vi.fn().mockResolvedValue(false);

      const { unmount } = render(<FavoriteButton toolId={99} />);
      const btn = screen.getByTitle("Add to favorites");
      await act(async () => {
        fireEvent.click(btn);
      });
      expect(alertSpy).toHaveBeenCalledWith("Failed to add favorite.");

      // Now test remove failure
      unmount();
      mockAuth.favoriteToolIds = new Set([99]);
      mockAuth.removeFavorite = vi.fn().mockResolvedValue(false);
      render(<FavoriteButton toolId={99} />);
      const removeBtn = screen.getByTitle("Remove from favorites");
      await act(async () => {
        fireEvent.click(removeBtn);
      });
      expect(alertSpy).toHaveBeenCalledWith("Failed to remove favorite.");

      alertSpy.mockRestore();
    });
  });
});
