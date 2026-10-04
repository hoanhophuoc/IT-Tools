import { describe, it, expect } from "vitest";
import { formatMsDuration, formatDateDdMmYyyyHhMm } from "../../src/lib/dateUtils.js";

describe("dateUtils", () => {
  describe("formatMsDuration", () => {
    it("formats 0 ms", () => {
      expect(formatMsDuration(0)).toBe("0 milliseconds");
      expect(formatMsDuration(0.5)).toBe("0 milliseconds");
    });

    it("formats sub-second and seconds durations", () => {
      expect(formatMsDuration(500)).toBe("500 milliseconds");
      expect(formatMsDuration(1000)).toBe("1 second");
      expect(formatMsDuration(2000)).toBe("2 seconds");
      expect(formatMsDuration(1500)).toBe("1 second 500 milliseconds");
    });

    it("formats minutes and hours", () => {
      expect(formatMsDuration(60000)).toBe("1 minute");
      expect(formatMsDuration(120000)).toBe("2 minutes");
      expect(formatMsDuration(3600000)).toBe("1 hour");
      expect(formatMsDuration(86400000)).toBe("1 day");
      expect(formatMsDuration(90061001)).toBe(
        "1 day 1 hour 1 minute 1 second 1 millisecond"
      );
    });

    it("handles invalid inputs", () => {
      expect(formatMsDuration(-10)).toBe("Invalid duration");
      expect(formatMsDuration(NaN)).toBe("Invalid duration");
    });
  });

  describe("formatDateDdMmYyyyHhMm", () => {
    it("formats valid date correctly", () => {
      const d = new Date(Date.UTC(2025, 4, 15, 14, 30));
      const res = formatDateDdMmYyyyHhMm(d);
      expect(typeof res).toBe("string");
      expect(res).not.toBe("Invalid Date");
    });

    it("handles null or invalid date", () => {
      expect(formatDateDdMmYyyyHhMm(null)).toBe("Invalid Date");
      expect(formatDateDdMmYyyyHhMm(new Date("invalid"))).toBe("Invalid Date");
    });
  });
});
