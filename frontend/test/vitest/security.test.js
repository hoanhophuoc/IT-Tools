import { describe, it, expect } from "vitest";
import { isValidIpv4 } from "../../src/lib/ipUtils.js";
import { utf8ToBase64, base64ToUtf8 } from "../../src/lib/utils.js";

describe("Frontend Security and Sanitization Suite", () => {
  it("rejects null-byte injection and prototype pollution in IP validation", () => {
    expect(isValidIpv4("192.168.1.1\0.evil.com")).toBe(false);
    expect(isValidIpv4("__proto__")).toBe(false);
    expect(isValidIpv4("constructor")).toBe(false);
    expect(isValidIpv4("127.0.0.1; DROP TABLE users;--")).toBe(false);
  });

  it("handles XSS payloads safely in Base64 conversion without evaluation", () => {
    const xssPayload = `<script>alert("XSS")</script><img src=x onerror=alert(1)>`;
    const encoded = utf8ToBase64(xssPayload);
    const decoded = base64ToUtf8(encoded);

    expect(decoded).toBe(xssPayload);
    // Ensure no global DOM corruption
    expect(document.querySelector("script[src='x']")).toBeNull();
  });
});
