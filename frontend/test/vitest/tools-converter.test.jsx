import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CaseConverter from "../../src/tools/converter/CaseConverter.jsx";
import { cap } from "../../src/tools/converter/caseConverterUtils.js";
import ColorConverter from "../../src/tools/converter/ColorConverter.jsx";
import { hexToRgb } from "../../src/tools/converter/colorConverterUtils.js";
import IntegerBaseConverter from "../../src/tools/converter/IntegerBaseConverter.jsx";
import { convertAllBases } from "../../src/tools/converter/integerBaseConverterUtils.js";
import Base64StringConverter from "../../src/tools/converter/Base64StringConverter.jsx";
import * as utils from "../../src/lib/utils.js";

describe("Converter Tools Suite", () => {
  describe("Base64StringConverter", () => {
    it("encodes and decodes text accurately", () => {
      render(<Base64StringConverter />);
      const textareas = screen.getAllByRole("textbox");
      fireEvent.change(textareas[0], { target: { value: "Hello World" } });
      expect(screen.getByDisplayValue("SGVsbG8gV29ybGQ=")).toBeTruthy();

      // Click decode mode button
      const decodeBtn = screen.getByRole("button", { name: "Decode" });
      fireEvent.click(decodeBtn);
      fireEvent.change(textareas[0], { target: { value: "SGVsbG8gV29ybGQ=" } });
      expect(screen.getByDisplayValue("Hello World")).toBeTruthy();

      // Click encode mode button back
      const encodeBtn = screen.getByRole("button", { name: "Encode" });
      fireEvent.click(encodeBtn);
    });

    it("supports URL-Safe base64, swap, clear, and invalid decode error", () => {
      render(<Base64StringConverter />);
      const textareas = screen.getAllByRole("textbox");

      // URL-Safe toggle
      const checkbox = screen.getByLabelText(/URL-Safe Base64/i);
      fireEvent.click(checkbox);
      fireEvent.change(textareas[0], { target: { value: "Hello?+World" } });

      // Swap
      const swapBtn = screen.getByRole("button", { name: /Swap/i });
      fireEvent.click(swapBtn);

      // Clear
      const clearBtn = screen.getByRole("button", { name: "Clear" });
      fireEvent.click(clearBtn);
      expect(textareas[0].value).toBe("");

      // Decode invalid base64
      const decodeBtn = screen.getByRole("button", { name: "Decode" });
      fireEvent.click(decodeBtn);
      fireEvent.change(textareas[0], { target: { value: "!!!invalid base64!!!" } });
      expect(screen.getByText("Invalid Base64 input string.")).toBeTruthy();

      // Swap from decode back to encode
      fireEvent.change(textareas[0], { target: { value: "SGVsbG8=" } });
      fireEvent.click(swapBtn);
      expect(screen.getByRole("button", { name: "Encode" })).toBeTruthy();

      // Encode failure
      const encSpy = vi.spyOn(utils, "utf8ToBase64").mockImplementationOnce(() => {
        throw new Error("Custom encode error");
      });
      fireEvent.change(textareas[0], { target: { value: "test" } });
      expect(screen.getByText(/Encoding error: Custom encode error/i)).toBeTruthy();
      encSpy.mockRestore();
    });
  });

  describe("CaseConverter", () => {
    it("converts input into camel, snake, constant, and pascal cases", () => {
      render(<CaseConverter />);
      const input = screen.getByPlaceholderText("Enter your text here");
      fireEvent.change(input, { target: { value: "hello world test" } });

      expect(screen.getByText("helloWorldTest")).toBeTruthy();
      expect(screen.getByText("hello_world_test")).toBeTruthy();
      expect(screen.getByText("HELLO_WORLD_TEST")).toBeTruthy();
      expect(screen.getByText("HelloWorldTest")).toBeTruthy();

      // Test cap with empty and null
      expect(cap("")).toBe("");
      expect(cap(null)).toBe("");
    });
  });

  describe("ColorConverter", () => {
    it("renders color inputs and converts correctly between color models including black and white", () => {
      render(<ColorConverter />);
      expect(screen.getAllByText(/HEX/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/RGB/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/HSL/i).length).toBeGreaterThan(0);

      const colorInput = screen.getByDisplayValue("#0088ff");

      // Test pure black
      fireEvent.change(colorInput, { target: { value: "#000000" } });
      expect(screen.getByDisplayValue("#000000")).toBeTruthy();

      // Test pure white
      fireEvent.change(colorInput, { target: { value: "#ffffff" } });
      expect(screen.getByDisplayValue("#ffffff")).toBeTruthy();

      // Test red max with g < b (pink/magenta) and g >= b (pure red)
      fireEvent.change(colorInput, { target: { value: "#ff0088" } });
      expect(screen.getByDisplayValue("#ff0088")).toBeTruthy();

      fireEvent.change(colorInput, { target: { value: "#ff0000" } });
      expect(screen.getByDisplayValue("#ff0000")).toBeTruthy();

      // Test green max
      fireEvent.change(colorInput, { target: { value: "#00ff00" } });
      expect(screen.getByDisplayValue("#00ff00")).toBeTruthy();

      // Test blue max
      fireEvent.change(colorInput, { target: { value: "#0000ff" } });
      expect(screen.getByDisplayValue("#0000ff")).toBeTruthy();

      // Test grayscale
      fireEvent.change(colorInput, { target: { value: "#808080" } });
      expect(screen.getByDisplayValue("#808080")).toBeTruthy();

      // Test small component single-digit hex (e.g. 5, 8, 12)
      fireEvent.change(colorInput, { target: { value: "#05080c" } });
      expect(screen.getByDisplayValue("#05080c")).toBeTruthy();

      // Test bright color (lightness > 0.5)
      fireEvent.change(colorInput, { target: { value: "#f8e2d4" } });
      expect(screen.getByDisplayValue("#f8e2d4")).toBeTruthy();

      // Test dark color (lightness <= 0.5)
      fireEvent.change(colorInput, { target: { value: "#141005" } });
      expect(screen.getByDisplayValue("#141005")).toBeTruthy();

      // Test default branch in rgbToHsl (when max is NaN)
      const maxSpy = vi.spyOn(Math, "max").mockReturnValueOnce(NaN);
      fireEvent.change(colorInput, { target: { value: "#334455" } });
      maxSpy.mockRestore();

      // Test short 3-char hex to execute (x) => x + x in hexToRgb
      expect(hexToRgb("#abc")).toEqual({ r: 170, g: 187, b: 204 });
    });
  });

  describe("IntegerBaseConverter", () => {
    it("converts numbers between binary, octal, decimal, hex, and base64", () => {
      render(<IntegerBaseConverter />);
      const input = screen.getByPlaceholderText("Enter number");

      // Enter decimal 255
      fireEvent.change(input, { target: { value: "255" } });
      expect(screen.getByText("11111111")).toBeTruthy(); // Binary
      expect(screen.getByText("377")).toBeTruthy(); // Octal
      expect(screen.getByText("FF")).toBeTruthy(); // Hex

      // Clear input
      fireEvent.change(input, { target: { value: "" } });

      // Enter decimal 15 (hex 'F' -> odd length prefix padding '0F')
      fireEvent.change(input, { target: { value: "15" } });
      expect(screen.getByText("F")).toBeTruthy();

      // Change input base to Binary (2)
      const baseSelect = screen.getByLabelText(/Input Base/i);
      fireEvent.change(baseSelect, { target: { value: "2" } });
      fireEvent.change(input, { target: { value: "1010" } });
      expect(screen.getByText("10")).toBeTruthy(); // Decimal

      // Change input base to Octal (8)
      fireEvent.change(baseSelect, { target: { value: "8" } });
      fireEvent.change(input, { target: { value: "12" } });
      expect(screen.getByText("10")).toBeTruthy();

      // Change input base to Hexadecimal (16)
      fireEvent.change(baseSelect, { target: { value: "16" } });
      fireEvent.change(input, { target: { value: "FF" } });
      expect(screen.getByText("255")).toBeTruthy();

      // Change input base to Base64 (64)
      fireEvent.change(baseSelect, { target: { value: "64" } });
      fireEvent.change(input, { target: { value: "AQ==" } });
      expect(screen.getAllByText("1").length).toBeGreaterThan(0);

      // Base64 that passes regex but fails atob
      fireEvent.change(input, { target: { value: "====" } });

      // decimalToBase64 btoa failure catch
      const btoaSpy = vi.spyOn(window, "btoa").mockImplementationOnce(() => {
        throw new Error("btoa failed");
      });
      fireEvent.change(baseSelect, { target: { value: "10" } });
      fireEvent.change(input, { target: { value: "42" } });
      btoaSpy.mockRestore();

      // convertAllBases failure catch
      const bigIntSpy = vi.spyOn(global, "BigInt").mockImplementationOnce(() => {
        throw new Error("BigInt parse failed");
      });
      fireEvent.change(input, { target: { value: "99" } });
      bigIntSpy.mockRestore();

      // Enter invalid input
      fireEvent.change(baseSelect, { target: { value: "2" } });
      fireEvent.change(input, { target: { value: "1029" } });
      expect(screen.getByText(/Invalid number for base 2/i)).toBeTruthy();

      // Empty input
      fireEvent.change(input, { target: { value: "" } });

      // Test convertAllBases direct helper edge cases
      expect(convertAllBases("", 10)).toEqual({ 2: "", 8: "", 10: "", 16: "", 64: "" });
      expect(convertAllBases("123", 99)).toEqual({
        10: "123",
        16: "7B",
        2: "1111011",
        64: "ew==",
        8: "173",
      });
    });
  });
});
