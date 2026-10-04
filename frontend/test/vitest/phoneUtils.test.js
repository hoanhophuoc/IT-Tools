import { describe, it, expect } from "vitest";
import {
  formatPhoneNumberType,
  getDefaultCountryCode,
  getCountryOptions,
} from "../../src/lib/phoneUtils.js";

describe("phoneUtils", () => {
  describe("formatPhoneNumberType", () => {
    it("maps recognized phone types to user-friendly names", () => {
      expect(formatPhoneNumberType("MOBILE")).toBe("Mobile");
      expect(formatPhoneNumberType("FIXED_LINE")).toBe("Fixed line");
      expect(formatPhoneNumberType("VOIP")).toBe("VoIP");
      expect(formatPhoneNumberType("TOLL_FREE")).toBe("Toll free");
    });

    it("returns raw value or undefined for fallback", () => {
      expect(formatPhoneNumberType("CUSTOM_TYPE")).toBe("CUSTOM_TYPE");
      expect(formatPhoneNumberType(null)).toBeUndefined();
    });
  });

  describe("getDefaultCountryCode", () => {
    it("returns a valid 2-letter country code based on navigator.language", () => {
      const originalNav = window.navigator;
      
      // Valid region
      Object.defineProperty(window, "navigator", {
        value: { language: "fr-FR" },
        configurable: true,
      });
      expect(getDefaultCountryCode()).toBe("FR");

      // No language
      Object.defineProperty(window, "navigator", {
        value: { language: undefined },
        configurable: true,
      });
      expect(getDefaultCountryCode()).toBe("US");

      // Invalid locale/region
      Object.defineProperty(window, "navigator", {
        value: { language: "invalid-locale-123456" },
        configurable: true,
      });
      expect(getDefaultCountryCode()).toBe("US");

      Object.defineProperty(window, "navigator", {
        value: originalNav,
        configurable: true,
      });
    });

    it("covers all recognized phone number types", () => {
      expect(formatPhoneNumberType("FIXED_LINE_OR_MOBILE")).toBe("Fixed line or mobile");
      expect(formatPhoneNumberType("PERSONAL_NUMBER")).toBe("Personal number");
      expect(formatPhoneNumberType("PREMIUM_RATE")).toBe("Premium rate");
      expect(formatPhoneNumberType("SHARED_COST")).toBe("Shared cost");
      expect(formatPhoneNumberType("UAN")).toBe("UAN");
      expect(formatPhoneNumberType("VOICEMAIL")).toBe("Voicemail");
      expect(formatPhoneNumberType("PAGER")).toBe("Pager");
      expect(formatPhoneNumberType("UNKNOWN")).toBe("Unknown");
    });
  });

  describe("getCountryOptions", () => {
    it("returns sorted list of country options with label and value", () => {
      const options = getCountryOptions();
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(50);
      expect(options[0]).toHaveProperty("label");
      expect(options[0]).toHaveProperty("value");
      expect(options.some((o) => o.value === "US")).toBe(true);
      expect(options.some((o) => o.value === "VN")).toBe(true);

      // Test with invalid country code to trigger fallbacks
      const customOptions = getCountryOptions(["INVALID_CODE"]);
      expect(customOptions[0].label).toBe("INVALID_CODE");
      expect(customOptions[0].value).toBe("INVALID_CODE");
    });
  });
});
