import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Temperature from "../../src/tools/measurement/Temperature.jsx";
import DataSize, { toBits } from "../../src/tools/measurement/DataSize.jsx";
import Chronometer from "../../src/tools/measurement/Chronometer.jsx";
import Ipv4AddressConverter from "../../src/tools/network/Ipv4AddressConverter.jsx";
import Ipv4RangeExpander, { ResultRow } from "../../src/tools/network/Ipv4RangeExpander.jsx";
import MacAddressLookup, { isValidMacFormat } from "../../src/tools/network/MacAddressLookup.jsx";
import * as ipUtils from "../../src/lib/ipUtils.js";

describe("Network and Measurement Tools Suite", () => {
  describe("Chronometer", () => {
    it("renders stopwatch timer, starts, advances timer, stops, and resets", () => {
      vi.useFakeTimers();
      render(<Chronometer />);
      expect(screen.getByText("00:00.000")).toBeTruthy();

      const startBtn = screen.getByRole("button", { name: "Start" });
      fireEvent.click(startBtn);

      const stopBtn = screen.getByRole("button", { name: "Stop" });
      expect(stopBtn).toBeTruthy();

      vi.advanceTimersByTime(50);
      fireEvent.click(stopBtn);

      const resetBtn = screen.getByRole("button", { name: "Reset" });
      fireEvent.click(resetBtn);
      expect(screen.getByRole("button", { name: "Start" })).toBeTruthy();
      vi.useRealTimers();
    });
  });

  describe("Temperature", () => {
    it("converts across all temperature scales", () => {
      render(<Temperature />);
      const input = screen.getByPlaceholderText("Enter value");
      const scaleSelect = screen.getByLabelText(/Input Scale/i);

      // Celsius 100
      fireEvent.change(input, { target: { value: "100" } });
      expect(screen.getByText("212")).toBeTruthy(); // Fahrenheit
      expect(screen.getByText("373.15")).toBeTruthy(); // Kelvin

      // Test all other scales
      const scales = ["kelvin", "fahrenheit", "rankine", "delisle", "newton", "reaumur", "romer"];
      for (const scale of scales) {
        fireEvent.change(scaleSelect, { target: { value: scale } });
      }

      // Test unknown scale
      const opt = document.createElement("option");
      opt.value = "unknown_scale";
      opt.text = "unknown_scale";
      scaleSelect.appendChild(opt);
      fireEvent.change(scaleSelect, { target: { value: "unknown_scale" } });

      // Empty input
      fireEvent.change(input, { target: { value: "" } });
    });
  });

  describe("DataSize", () => {
    it("converts between bits, bytes, kilobytes, and megabytes", () => {
      render(<DataSize />);
      const input = screen.getByPlaceholderText("Enter value");

      // 1024 Bytes
      fireEvent.change(input, { target: { value: "1024" } });
      expect(screen.getByText("1")).toBeTruthy(); // 1 KB
      expect(screen.getByText("8,192")).toBeTruthy(); // 8192 bits

      // Change unit to megabyte
      const unitSelect = screen.getByLabelText(/Input Unit/i);
      fireEvent.change(unitSelect, { target: { value: "megabyte" } });
      fireEvent.change(input, { target: { value: "1" } });
      expect(screen.getByText("1,024")).toBeTruthy(); // 1024 KB

      // Test toBits with unknown scale
      expect(Number.isNaN(toBits(10, "unknown_scale"))).toBe(true);
    });
  });

  describe("Ipv4AddressConverter", () => {
    it("converts IPv4 addresses across notations and reports invalid format", () => {
      render(<Ipv4AddressConverter />);
      const input = screen.getAllByRole("textbox")[0];

      // Valid IP
      fireEvent.change(input, { target: { value: "192.168.1.1" } });
      expect(screen.getByText("3232235777")).toBeTruthy();

      // Invalid IP
      fireEvent.change(input, { target: { value: "999.999.999.999" } });
      expect(screen.getByText("Invalid IPv4 address format.")).toBeTruthy();

      // Conversion error handling when ipInt is null
      const nullSpy = vi.spyOn(ipUtils, "ipv4ToInt").mockReturnValueOnce(null);
      fireEvent.change(input, { target: { value: "10.0.0.1" } });
      expect(screen.getByText("Error during conversion.")).toBeTruthy();
      nullSpy.mockRestore();

      // Conversion error handling when ipv4ToInt throws
      const origSpy = vi.spyOn(ipUtils, "ipv4ToInt").mockImplementationOnce(() => {
        throw new Error("Conversion error");
      });
      fireEvent.change(input, { target: { value: "10.0.0.1" } });
      expect(screen.getByText("Error during conversion.")).toBeTruthy();
      origSpy.mockRestore();

      // Empty IP
      fireEvent.change(input, { target: { value: "" } });
    });
  });

  describe("Ipv4RangeExpander", () => {
    it("calculates CIDR from IP range and detects invalid ranges with swap functionality", () => {
      render(<Ipv4RangeExpander />);
      const startInput = screen.getByPlaceholderText("Start IPv4 address...");
      const endInput = screen.getByPlaceholderText("End IPv4 address...");

      fireEvent.change(startInput, { target: { value: "192.168.1.0" } });
      fireEvent.change(endInput, { target: { value: "192.168.1.255" } });

      expect(screen.getByText(/192.168.1.0\/24/i)).toBeTruthy();

      // Lower end address
      fireEvent.change(endInput, { target: { value: "192.168.0.1" } });
      expect(screen.getByText("End address cannot be lower than start address.")).toBeTruthy();

      // Click "Switch Start and End" button
      const swapBtn = screen.getByRole("button", { name: /Switch Start and End/i });
      fireEvent.click(swapBtn);
      expect(startInput.value).toBe("192.168.0.1");
      expect(endInput.value).toBe("192.168.1.0");

      // Individual invalid start or end IP
      fireEvent.change(startInput, { target: { value: "999.999.999.999" } });
      fireEvent.change(endInput, { target: { value: "not-an-ip" } });
      expect(screen.getAllByText("Invalid IPv4 format").length).toBeGreaterThanOrEqual(1);

      // Render ResultRow directly with null values
      render(
        <table>
          <tbody>
            <ResultRow label="Direct Row" oldValue={null} newValue={null} />
          </tbody>
        </table>
      );
      expect(screen.getAllByText("N/A").length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("MacAddressLookup", () => {
    it("looks up vendor and reports invalid MAC address format and empty input", () => {
      expect(isValidMacFormat("")).toBe(false);
      expect(isValidMacFormat(null)).toBe(false);
      expect(isValidMacFormat(123)).toBe(false);

      render(<MacAddressLookup />);
      const input = screen.getByRole("textbox");

      // Test valid MAC
      expect(screen.getByDisplayValue("20:37:06:12:34:56")).toBeTruthy();

      // Test copy vendor info
      const copyBtn = screen.getByRole("button", { name: /Copy vendor info/i });
      expect(copyBtn).toBeTruthy();

      // Test invalid MAC
      fireEvent.change(input, { target: { value: "invalid-mac" } });
      expect(screen.getByText("Invalid MAC address format.")).toBeTruthy();

      // Test empty MAC
      fireEvent.change(input, { target: { value: "" } });
      expect(screen.getByText("Enter a MAC address above.")).toBeTruthy();

      // Test unknown vendor
      fireEvent.change(input, { target: { value: "02:00:00:00:00:00" } });
      expect(screen.getByText(/Unknown vendor/i)).toBeTruthy();
    });

    it("handles lookup error when OUI processing throws", () => {
      const origToUpper = String.prototype.toUpperCase;
      const upperSpy = vi.spyOn(String.prototype, "toUpperCase").mockImplementation(function (...args) {
        if (typeof this === "string" && this === "aabbcc") {
          throw new Error("Lookup exception");
        }
        return origToUpper.apply(this, args);
      });

      render(<MacAddressLookup />);
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "aa:bb:cc:11:22:33" } });
      expect(screen.getByText("Vendor lookup failed.")).toBeTruthy();

      upperSpy.mockRestore();
    });
  });
});
