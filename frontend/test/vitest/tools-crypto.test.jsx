import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import JwtParser from "../../src/tools/cryto/JwtParser.jsx";
import ULIDGenerator from "../../src/tools/cryto/ULIDGenerator.jsx";
import PasswordStrengthAnalyser from "../../src/tools/cryto/PasswordStrengthAnalyser.jsx";
import HashText from "../../src/tools/cryto/HashText.jsx";
import * as utils from "../../src/lib/utils.js";

describe("Crypto Tools Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("HashText", () => {
    it("renders text input, encoding selector, and calculates hashes", async () => {
      // Mock CryptoJS on window
      window.CryptoJS = {
        MD5: (t) => ({ toString: () => "5d41402abc4b2a76b9719d911017c592" }),
        SHA1: (t) => ({ toString: () => "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d" }),
        SHA256: (t) => ({ toString: () => "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824" }),
        SHA224: (t) => ({ toString: () => "d14a028c2a3a2bc9476102bb288234c415a2b01f828ea62ac5b3e42f" }),
        SHA512: (t) => ({ toString: () => "9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043" }),
        SHA384: (t) => ({ toString: () => "0a0a9f2a6772942557ab5355d76af442f8f65e01" }),
        SHA3: (t) => ({ toString: () => "10c9dd6143697cf5d1a0164e93496c3429169ea9" }),
        RIPEMD160: (t) => ({ toString: () => "108f07b8382412612c048d07d13f814118445acd" }),
        enc: {
          Base64: { stringify: (d) => "aGVsbG8=" },
          Base64url: { stringify: (d) => "aGVsbG8" },
        },
      };

      vi.spyOn(utils, "loadScript").mockResolvedValue(true);

      render(<HashText />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Your string to hash")).toBeTruthy();
      });

      const input = screen.getByPlaceholderText("Your string to hash");
      fireEvent.change(input, { target: { value: "hello" } });

      await waitFor(() => {
        expect(screen.getByText("5d41402abc4b2a76b9719d911017c592")).toBeTruthy();
      });

      // Change encoding type to Base64
      const encodingSelect = screen.getByLabelText(/Digest encoding/i);
      fireEvent.change(encodingSelect, { target: { value: "base64" } });
      await waitFor(() => {
        expect(screen.getAllByText("aGVsbG8=").length).toBeGreaterThan(0);
      });

      // Change encoding type to base2 and base64url
      fireEvent.change(encodingSelect, { target: { value: "base2" } });
      fireEvent.change(encodingSelect, { target: { value: "base64url" } });
      fireEvent.change(encodingSelect, { target: { value: "base16" } });

      // Change to unknown encoding to hit default branch
      fireEvent.change(encodingSelect, { target: { value: "unknown_custom" } });
    });

    it("handles algorithm computation failure and missing window.CryptoJS", async () => {
      window.CryptoJS = {
        MD5: () => {
          throw new Error("MD5 failed");
        },
        SHA1: () => ({ toString: () => "sha1val" }),
        SHA256: () => ({ toString: () => "sha256val" }),
        SHA224: () => ({ toString: () => "sha224val" }),
        SHA512: () => ({ toString: () => "sha512val" }),
        SHA384: () => ({ toString: () => "sha384val" }),
        SHA3: () => ({ toString: () => "sha3val" }),
        RIPEMD160: () => ({ toString: () => "ripemdval" }),
      };
      vi.spyOn(utils, "loadScript").mockResolvedValue(true);

      render(<HashText />);
      const input = screen.getByPlaceholderText("Your string to hash");
      fireEvent.change(input, { target: { value: "test" } });

      await waitFor(() => {
        expect(screen.getByText("Error")).toBeTruthy();
      });
    });

    it("displays error when CryptoJS fails to load or is not available", async () => {
      vi.spyOn(utils, "loadScript").mockRejectedValue(new Error("CDN network error"));

      render(<HashText />);
      await waitFor(() => {
        expect(screen.getByText("CDN network error")).toBeTruthy();
      });
    });

    it("displays error when loadScript resolves but window.CryptoJS is missing", async () => {
      delete window.CryptoJS;
      vi.spyOn(utils, "loadScript").mockResolvedValue(true);

      render(<HashText />);
      await waitFor(() => {
        expect(screen.getByText("CryptoJS is not available.")).toBeTruthy();
      });
    });
  });

  describe("JwtParser", () => {
    it("reports error when token does not have 3 parts", () => {
      render(<JwtParser />);
      const textarea = screen.getByPlaceholderText(/Paste your Bearer \/ JWT token here/i);
      fireEvent.change(textarea, { target: { value: "invalid.token" } });

      expect(screen.getByText(/A valid JWT must contain 3 parts/i)).toBeTruthy();
    });

    it("parses valid JWT header, payload, exp date and active status", () => {
      // Future exp date (Active)
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const headerB64 = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
      const payloadB64 = btoa(JSON.stringify({ name: "John Doe", exp: futureExp }));
      const testJwt = `${headerB64}.${payloadB64}.fakesig`;

      render(<JwtParser />);
      const textarea = screen.getByPlaceholderText(/Paste your Bearer \/ JWT token here/i);
      fireEvent.change(textarea, { target: { value: testJwt } });

      expect(screen.getByText(/John Doe/i)).toBeTruthy();
      expect(screen.getByText("Active")).toBeTruthy();

      // Test Clear button
      const clearBtn = screen.getByRole("button", { name: "Clear" });
      fireEvent.click(clearBtn);
      expect(textarea.value).toBe("");
    });

    it("shows Expired status for past expiration and error on malformed base64", () => {
      // Expired token
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const headerB64 = btoa(JSON.stringify({ alg: "HS256" }));
      const payloadB64 = btoa(JSON.stringify({ exp: pastExp }));
      const expiredJwt = `${headerB64}.${payloadB64}.sig`;

      render(<JwtParser />);
      const textarea = screen.getByPlaceholderText(/Paste your Bearer \/ JWT token here/i);
      fireEvent.change(textarea, { target: { value: expiredJwt } });

      expect(screen.getByText("Expired")).toBeTruthy();

      // Malformed base64 in token
      fireEvent.change(textarea, { target: { value: "bad!base64.bad!base64.sig" } });
      expect(screen.getByText(/Failed to decode JWT/i)).toBeTruthy();
    });
  });

  describe("ULIDGenerator", () => {
    it("renders and generates requested quantity in raw and json formats, tests bounds and empty input", () => {
      render(<ULIDGenerator />);
      expect(screen.getByText(/ULID/i)).toBeTruthy();

      const quantityInput = screen.getByPlaceholderText("How many?");
      fireEvent.change(quantityInput, { target: { value: "3" } });

      const refreshBtn = screen.getByRole("button", { name: /Refresh/i });
      fireEvent.click(refreshBtn);

      // Select JSON radio
      const jsonRadio = screen.getByLabelText(/JSON/i);
      fireEvent.click(jsonRadio);

      // Select Raw radio back
      const rawRadio = screen.getByLabelText(/Raw/i);
      fireEvent.click(rawRadio);

      const copyBtn = screen.getByRole("button", { name: /Copy/i });
      expect(copyBtn).toBeTruthy();

      // Empty quantity input
      fireEvent.change(quantityInput, { target: { value: "" } });
      expect(quantityInput.value).toBe("");

      // Quantity > 50 (capped to 50)
      fireEvent.change(quantityInput, { target: { value: "100" } });
      expect(quantityInput.value).toBe("50");

      // Quantity < 0 (capped to 0)
      fireEvent.change(quantityInput, { target: { value: "-5" } });
      expect(quantityInput.value).toBe("");
    });
  });

  describe("PasswordStrengthAnalyser", () => {
    it("renders password input, computes entropy, and toggles password visibility", async () => {
      window.zxcvbn = vi.fn().mockReturnValue({ score: 4 });
      vi.spyOn(utils, "loadScript").mockResolvedValue(true);

      render(<PasswordStrengthAnalyser />);
      const input = screen.getByPlaceholderText("Enter password");
      fireEvent.change(input, { target: { value: "P@ssw0rd2026!Secure" } });

      await waitFor(() => {
        expect(screen.getByText(/Password Length:/i)).toBeTruthy();
      });

      // Toggle show/hide password
      const toggleBtn = screen.getByRole("button", { name: "Show" });
      fireEvent.click(toggleBtn);
      expect(input.getAttribute("type")).toBe("text");
    });

    it("displays error message when script load fails in PasswordStrengthAnalyser", async () => {
      vi.spyOn(utils, "loadScript").mockRejectedValue(new Error("Zxcvbn network error"));

      render(<PasswordStrengthAnalyser />);
      await waitFor(() => {
        expect(screen.getByText("Zxcvbn network error")).toBeTruthy();
      });
    });
  });
});
