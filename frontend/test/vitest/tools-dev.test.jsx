import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import JsonMinify from "../../src/tools/development/JsonMinify.jsx";
import JsonPrettify from "../../src/tools/development/JsonPrettify.jsx";
import RandomPortGenerator from "../../src/tools/development/RandomPortGenerator.jsx";
import UuidGenerator from "../../src/tools/development/UuidGenerator.jsx";

describe("Development Tools Suite", () => {
  describe("JsonMinify", () => {
    it("minifies valid JSON and handles invalid JSON", () => {
      render(<JsonMinify />);
      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: '{\n  "a": 1\n}' } });
      expect(screen.getByText('{"a":1}')).toBeTruthy();

      fireEvent.change(textarea, { target: { value: "invalid json" } });
      expect(screen.getByText(/Invalid JSON format/i)).toBeTruthy();
    });
  });

  describe("JsonPrettify", () => {
    it("formats json, sorts keys, handles indent changes, and displays errors", () => {
      render(<JsonPrettify />);
      const textareas = screen.getAllByRole("textbox");
      const inputArea = textareas[0];

      // Test valid JSON formatting with sort including nested arrays
      fireEvent.change(inputArea, { target: { value: '{"z": 10, "items": [{"b": 2, "a": 1}], "a": 20}' } });
      const sortButton = screen.getByRole("button", { name: "Sort keys" });
      fireEvent.click(sortButton);

      expect(textareas[1].value).toContain('"a": 20');

      // Test changing indentation
      const indentInput = screen.getByDisplayValue("2");
      fireEvent.change(indentInput, { target: { value: "4" } });
      expect(textareas[1].value).toContain('    "a": 20');

      // Empty indent input
      fireEvent.change(indentInput, { target: { value: "" } });
      expect(textareas[1].value).toBe("");

      // Restore indent to 2
      fireEvent.change(indentInput, { target: { value: "2" } });

      // Test invalid JSON error
      fireEvent.change(inputArea, { target: { value: "{broken json" } });
      expect(screen.getByPlaceholderText(/Invalid JSON format/i)).toBeTruthy();

      // Test empty input
      fireEvent.change(inputArea, { target: { value: "" } });
      expect(textareas[1].value).toBe("");
    });
  });

  describe("RandomPortGenerator", () => {
    it("renders port generator and generates new port on refresh", () => {
      render(<RandomPortGenerator />);
      const initialPort = screen.getByText(/\d{4,5}/).textContent;
      expect(Number(initialPort)).toBeGreaterThanOrEqual(1024);

      const refreshBtn = screen.getByRole("button", { name: /Refresh/i });
      fireEvent.click(refreshBtn);
      const newPort = screen.getByText(/\d{4,5}/).textContent;
      expect(Number(newPort)).toBeGreaterThanOrEqual(1024);
    });
  });

  describe("UuidGenerator", () => {
    it("renders UUID generator controls and handles v4, v7, uppercase, hyphens, and count", () => {
      render(<UuidGenerator />);
      expect(screen.getAllByText(/UUID/i).length).toBeGreaterThan(0);

      // Change version to v7
      const versionSelect = screen.getByLabelText(/UUID Version/i);
      fireEvent.change(versionSelect, { target: { value: "v7" } });

      // Change quantity (including boundaries)
      const quantityInput = screen.getByLabelText(/Quantity/i);
      fireEvent.change(quantityInput, { target: { value: "3" } });
      fireEvent.change(quantityInput, { target: { value: "" } });
      fireEvent.change(quantityInput, { target: { value: "0" } });
      fireEvent.change(quantityInput, { target: { value: "999" } });

      // Toggle uppercase
      const uppercaseCheckbox = screen.getByLabelText(/Uppercase/i);
      fireEvent.click(uppercaseCheckbox);

      // Toggle hyphens
      const hyphensCheckbox = screen.getByLabelText(/Hyphens/i);
      fireEvent.click(hyphensCheckbox);

      // Click regenerate
      const regenBtn = screen.getByRole("button", { name: /Regenerate/i });
      fireEvent.click(regenBtn);

      const copyButtons = screen.getAllByRole("button", { name: /Copy/i });
      expect(copyButtons.length).toBeGreaterThan(0);
    });
  });
});
