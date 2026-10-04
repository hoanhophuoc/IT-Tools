import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MathEvaluator from "../../src/tools/math/MathEvaluator.jsx";
import PercentageCalculator, {
  formatResult,
  calculatePercentOf,
  calculateIsWhatPercent,
  calculatePercentChange,
  isValidNumberInput,
} from "../../src/tools/math/PercentageCalculator.jsx";
import EtaCalculator from "../../src/tools/math/EtaCalculator.jsx";

let mockEvalUndefined = false;
let mockEvalError = false;
vi.mock("mathjs", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    evaluate: (...args) => {
      if (mockEvalUndefined) return undefined;
      if (mockEvalError) throw {};
      return actual.evaluate(...args);
    },
  };
});

describe("Math Tools Suite", () => {
  describe("MathEvaluator", () => {
    it("evaluates valid mathematical expressions", () => {
      render(<MathEvaluator />);
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "2 + 2 * 3" } });
      expect(screen.getByText("8")).toBeTruthy();
    });

    it("detects function definitions and empty input", () => {
      render(<MathEvaluator />);
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "f(x) = x ^ 2" } });
      expect(screen.getByText("Result is a function definition.")).toBeTruthy();

      fireEvent.change(input, { target: { value: "" } });
      expect(screen.queryByText("Result")).toBeNull();
    });

    it("handles math syntax errors gracefully without throwing unhandled exceptions", () => {
      render(<MathEvaluator />);
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "2 + * 3" } });
      expect(screen.getAllByText(/Value expected|error/i).length).toBeGreaterThan(0);
    });

    it("handles undefined result from evaluate", () => {
      mockEvalUndefined = true;
      try {
        render(<MathEvaluator />);
        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "x = 10" } });
        expect(screen.queryByText("Result")).toBeNull();
      } finally {
        mockEvalUndefined = false;
      }
    });

    it("handles error without message in evaluate", () => {
      mockEvalError = true;
      try {
        render(<MathEvaluator />);
        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "invalid" } });
        expect(screen.getAllByText("Invalid mathematical expression.").length).toBeGreaterThan(0);
      } finally {
        mockEvalError = false;
      }
    });
  });

  describe("PercentageCalculator", () => {
    it("calculates percentage correctly across all 3 sections and handles zero division", () => {
      render(<PercentageCalculator />);
      const inputs = screen.getAllByRole("textbox");

      // Non-numeric input ignored across fields
      fireEvent.change(inputs[0], { target: { value: "abc" } });
      fireEvent.change(inputs[1], { target: { value: "xyz" } });
      fireEvent.change(inputs[3], { target: { value: "foo" } });
      fireEvent.change(inputs[4], { target: { value: "bar" } });
      fireEvent.change(inputs[6], { target: { value: "baz" } });
      fireEvent.change(inputs[7], { target: { value: "qux" } });
      expect(inputs[0].value).toBe("");

      // Section 1: What is X% of Y
      // Test x valid, y NaN
      fireEvent.change(inputs[0], { target: { value: "20" } });
      fireEvent.change(inputs[1], { target: { value: "" } });
      expect(inputs[2].value).toBe("");
      // Test both valid
      fireEvent.change(inputs[1], { target: { value: "100" } });
      expect(screen.getAllByDisplayValue("20").length).toBeGreaterThan(0);

      // Section 2: X is what percent of Y
      // Test x valid, y NaN
      fireEvent.change(inputs[3], { target: { value: "50" } });
      fireEvent.change(inputs[4], { target: { value: "" } });
      expect(inputs[5].value).toBe("");
      // Test both valid
      fireEvent.change(inputs[4], { target: { value: "200" } });
      expect(screen.getAllByDisplayValue("25").length).toBeGreaterThan(0);

      // Section 2 zero division: Y = 0
      fireEvent.change(inputs[4], { target: { value: "0" } });
      expect(inputs[5].value).toBe("");

      // Section 3: Percentage increase/decrease From X To Y
      // Test from valid, to NaN
      fireEvent.change(inputs[6], { target: { value: "100" } });
      fireEvent.change(inputs[7], { target: { value: "" } });
      expect(inputs[8].value).toBe("");
      // Test both valid
      fireEvent.change(inputs[7], { target: { value: "150" } });
      expect(screen.getAllByDisplayValue("50").length).toBeGreaterThan(0);

      // Section 3 zero division: From = 0
      fireEvent.change(inputs[6], { target: { value: "0" } });
      expect(inputs[8].value).toBe("");

      // Test copy buttons
      const copyBtns = screen.getAllByRole("button", { name: "Copy" });
      expect(copyBtns.length).toBeGreaterThanOrEqual(1);
      copyBtns.forEach((btn) => fireEvent.click(btn));

      // Test negative numbers and decimal input
      fireEvent.change(inputs[0], { target: { value: "-25.5" } });
      fireEvent.change(inputs[1], { target: { value: "100" } });
      expect(screen.getAllByDisplayValue("-25.5").length).toBeGreaterThan(0);

      // Test clearing inputs
      fireEvent.change(inputs[0], { target: { value: "" } });
      fireEvent.change(inputs[1], { target: { value: "" } });
      fireEvent.change(inputs[3], { target: { value: "" } });

      // Test from is valid but to is NaN (hits Number.isNaN(to) true branch)
      fireEvent.change(inputs[6], { target: { value: "100" } });
      fireEvent.change(inputs[7], { target: { value: "" } });
      expect(inputs[8].value).toBe("");

      // Test from is NaN (hits Number.isNaN(from) true branch)
      fireEvent.change(inputs[6], { target: { value: "" } });
      expect(inputs[8].value).toBe("");
      expect(inputs[2].value).toBe("");

      // Direct edge cases of formatResult
      expect(formatResult("")).toBe("");
      expect(formatResult(null)).toBe("");
      expect(formatResult(undefined)).toBe("");
      expect(formatResult(Infinity)).toBe("");
      expect(formatResult(NaN)).toBe("");
      expect(formatResult(50)).toBe("50");

      // Pure function tests
      expect(calculatePercentOf("", "100")).toBe("");
      expect(calculatePercentOf("20", "")).toBe("");
      expect(calculatePercentOf("20", "100")).toBe("20");

      expect(calculateIsWhatPercent("", "100")).toBe("");
      expect(calculateIsWhatPercent("50", "")).toBe("");
      expect(calculateIsWhatPercent("50", "0")).toBe("");
      expect(calculateIsWhatPercent("50", "200")).toBe("25");

      expect(calculatePercentChange("", "100")).toBe("");
      expect(calculatePercentChange("100", "")).toBe("");
      expect(calculatePercentChange("0", "100")).toBe("");
      expect(calculatePercentChange("100", "150")).toBe("50");

      expect(isValidNumberInput("")).toBe(true);
      expect(isValidNumberInput("123")).toBe(true);
      expect(isValidNumberInput("-12.5")).toBe(true);
      expect(isValidNumberInput(".5")).toBe(true);
      expect(isValidNumberInput("abc")).toBe(false);
      expect(isValidNumberInput("1.2.3")).toBe(false);
    });
  });

  describe("EtaCalculator", () => {
    it("renders ETA calculation inputs, updates time span unit, and handles invalid bounds", () => {
      render(<EtaCalculator />);
      expect(screen.getByText("Total duration")).toBeTruthy();

      // Test amount of element input (NaN fallback and zero value)
      const elementInput = screen.getByLabelText(/Amount of element to consume/i);
      fireEvent.change(elementInput, { target: { value: "abc" } });
      expect(elementInput.value).toBe("0");
      expect(screen.queryByText("Total duration")).toBeNull();
      fireEvent.change(elementInput, { target: { value: "100" } });
      expect(screen.getByText("Total duration")).toBeTruthy();

      // Change time span unit multiplier to fallback (empty / NaN) and valid values
      const unitSelect = screen.getByLabelText(/Time span unit/i);
      fireEvent.change(unitSelect, { target: { value: "invalid" } });
      expect(unitSelect.value).toBe("1");
      fireEvent.change(unitSelect, { target: { value: "1" } }); // milliseconds
      expect(unitSelect.value).toBe("1");
      fireEvent.change(unitSelect, { target: { value: "1000" } }); // seconds
      expect(unitSelect.value).toBe("1000");

      // Set units consumed to 0 - triggers error message
      const unitsInput = screen.getByLabelText(/Units consumed/i);
      fireEvent.change(unitsInput, { target: { value: "0" } });
      expect(screen.getByText("Units consumed cannot be zero or less.")).toBeTruthy();
      fireEvent.change(unitsInput, { target: { value: "10" } });

      // Change time span value to 0 - triggers error message
      const timeSpanInput = screen.getByLabelText(/Time span value/i);
      fireEvent.change(timeSpanInput, { target: { value: "0" } });
      expect(screen.getByText("Time span duration cannot be zero or less.")).toBeTruthy();
      fireEvent.change(timeSpanInput, { target: { value: "10" } });

      // Trigger infinity guard
      const isFiniteSpy = vi.spyOn(Number, "isFinite").mockReturnValueOnce(false);
      fireEvent.change(timeSpanInput, { target: { value: "5" } });
      expect(screen.getByText("Calculation resulted in infinity.")).toBeTruthy();
      isFiniteSpy.mockRestore();

      // Trigger catch block
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const throwSpy = vi.spyOn(Number, "isFinite").mockImplementationOnce(() => {
        throw new Error("Simulated calculation error");
      });
      fireEvent.change(timeSpanInput, { target: { value: "6" } });
      expect(screen.getByText("Calculation error.")).toBeTruthy();
      throwSpy.mockRestore();
      errSpy.mockRestore();

      // Change start date to invalid string
      const startDateInput = screen.getByLabelText(/The consumption started at/i);
      fireEvent.change(startDateInput, { target: { value: "invalid-date" } });
      expect(screen.getByText("Invalid start date/time.")).toBeTruthy();
    });
  });
});
