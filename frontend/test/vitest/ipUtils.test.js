import { describe, it, expect } from "vitest";
import {
  isValidIpv4,
  ipv4ToInt,
  intToIpv4,
  ipv4ToIpv6,
  calculateCidrFromRange,
} from "../../src/lib/ipUtils.js";

describe("ipUtils", () => {
  describe("isValidIpv4", () => {
    it("validates standard IPv4 addresses", () => {
      expect(isValidIpv4("192.168.1.1")).toBe(true);
      expect(isValidIpv4("10.0.0.1")).toBe(true);
      expect(isValidIpv4("0.0.0.0")).toBe(true);
      expect(isValidIpv4("255.255.255.255")).toBe(true);
    });

    it("rejects invalid IPv4 addresses", () => {
      expect(isValidIpv4("256.0.0.1")).toBe(false);
      expect(isValidIpv4("192.168.1")).toBe(false);
      expect(isValidIpv4("192.168.1.1.1")).toBe(false);
      expect(isValidIpv4("abc.def.ghi.jkl")).toBe(false);
      expect(isValidIpv4("")).toBe(false);
      expect(isValidIpv4(null)).toBe(false);
      expect(isValidIpv4(undefined)).toBe(false);
      expect(isValidIpv4(12345)).toBe(false);
    });
  });

  describe("ipv4ToInt and intToIpv4", () => {
    it("converts IPv4 to integer and back", () => {
      const testIps = ["0.0.0.0", "127.0.0.1", "192.168.1.1", "255.255.255.255"];
      for (const ip of testIps) {
        const intVal = ipv4ToInt(ip);
        expect(typeof intVal).toBe("number");
        expect(intToIpv4(intVal)).toBe(ip);
      }
    });

    it("handles invalid inputs gracefully", () => {
      expect(ipv4ToInt("invalid")).toBeNull();
      expect(intToIpv4(NaN)).toBe("");
      expect(intToIpv4(-1)).toBe("");
      expect(intToIpv4(0x100000000)).toBe("");
    });
  });

  describe("ipv4ToIpv6", () => {
    it("converts IPv4 to IPv6 mapped address", () => {
      expect(ipv4ToIpv6("192.168.1.1")).toBe(
        "0000:0000:0000:0000:0000:ffff:c0a8:0101"
      );
      expect(ipv4ToIpv6("192.168.1.1", true)).toBe("::ffff:c0a8:0101");
    });

    it("returns empty string for invalid IPv4", () => {
      expect(ipv4ToIpv6("invalid")).toBe("");
    });
  });

  describe("calculateCidrFromRange", () => {
    it("calculates correct CIDR block for standard /24 range", () => {
      const result = calculateCidrFromRange("192.168.1.0", "192.168.1.255");
      expect(result).not.toBeNull();
      expect(result.newCidr).toBe("192.168.1.0/24");
      expect(result.oldSize).toBe(256);
      expect(result.newSize).toBe(256);
      expect(result.newStart).toBe("192.168.1.0");
      expect(result.newEnd).toBe("192.168.1.255");
    });

    it("returns null for inverted or invalid ranges", () => {
      expect(calculateCidrFromRange("192.168.1.200", "192.168.1.100")).toBeNull();
      expect(calculateCidrFromRange("invalid", "192.168.1.100")).toBeNull();
    });
  });
});
