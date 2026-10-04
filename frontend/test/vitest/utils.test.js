import { describe, it, expect } from "vitest";
import { formatDate, utf8ToBase64, base64ToUtf8, loadScript, downloadCanvasAsPng } from "../../src/lib/utils.js";

describe("utils", () => {
  describe("formatDate", () => {
    it("formats a valid ISO date string", () => {
      const res = formatDate("2025-01-15T12:00:00Z");
      expect(res).toContain("2025");
      expect(res).toContain("Jan");
    });

    it("returns empty string or Invalid Date for invalid inputs", () => {
      expect(formatDate("")).toBe("");
      expect(formatDate(null)).toBe("");
      expect(formatDate("invalid-date-string")).toBe("Invalid Date");
    });

    it("handles unexpected formatter exceptions in formatDate", () => {
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const throwingDateInput = {
        [Symbol.toPrimitive]() {
          throw new Error("Date coercion error");
        },
      };
      expect(formatDate(throwingDateInput)).toBe("Invalid Date");
      expect(errSpy).toHaveBeenCalledWith("Error formatting date:", expect.any(Error));
      errSpy.mockRestore();
    });
  });

  describe("utf8ToBase64 and base64ToUtf8", () => {
    it("encodes and decodes standard ASCII strings", () => {
      const original = "Hello World!";
      const encoded = utf8ToBase64(original);
      expect(encoded).toBe("SGVsbG8gV29ybGQh");
      expect(base64ToUtf8(encoded)).toBe(original);
    });

    it("handles UTF-8 multi-byte unicode characters", () => {
      const original = "Xin chào thế giới 🚀 🦄 🔥";
      const encoded = utf8ToBase64(original);
      expect(base64ToUtf8(encoded)).toBe(original);
    });

    it("supports URL-safe base64 encoding", () => {
      const original = "subjects?query=test&value=123+456";
      const urlSafeEncoded = utf8ToBase64(original, true);
      expect(urlSafeEncoded).not.toContain("+");
      expect(urlSafeEncoded).not.toContain("/");
      expect(urlSafeEncoded).not.toContain("=");
      expect(base64ToUtf8(urlSafeEncoded)).toBe(original);
    });

    it("handles empty strings", () => {
      expect(utf8ToBase64("")).toBe("");
      expect(base64ToUtf8("")).toBe("");
    });

    it("handles encoding failure catch block in utf8ToBase64", () => {
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const btoaSpy = vi.spyOn(window, "btoa").mockImplementationOnce(() => {
        throw new Error("btoa failed");
      });
      expect(utf8ToBase64("some text")).toBe("");
      btoaSpy.mockRestore();
      errSpy.mockRestore();
    });
  });

  describe("loadScript", () => {
    it("resolves immediately if script already exists in document", async () => {
      const testSrc = "https://example.com/existing.js";
      const script = document.createElement("script");
      script.src = testSrc;
      document.body.appendChild(script);

      const res = await loadScript(testSrc);
      expect(res).toBe(testSrc);
      script.remove();
    });

    it("appends new script element and resolves upon onload", async () => {
      const testSrc = "https://example.com/new-lib.js";
      const promise = loadScript(testSrc);

      const injected = document.querySelector(`script[src="${testSrc}"]`);
      expect(injected).toBeTruthy();
      injected.onload();

      const res = await promise;
      expect(res).toBe(testSrc);
      injected.remove();
    });

    it("rejects when script fails to load", async () => {
      const testSrc = "https://example.com/broken.js";
      const promise = loadScript(testSrc);

      const injected = document.querySelector(`script[src="${testSrc}"]`);
      injected.onerror();

      await expect(promise).rejects.toThrow("Failed to load script");
      injected.remove();
    });

    it("rejects when document is undefined", async () => {
      const origDoc = global.document;
      try {
        delete global.document;
        await expect(loadScript("https://example.com/nodoc.js")).rejects.toThrow("Document is undefined");
      } finally {
        global.document = origDoc;
      }
    });
  });

  describe("downloadCanvasAsPng", () => {
    it("handles null or missing canvas gracefully", () => {
      expect(downloadCanvasAsPng(null)).toBe(false);
      expect(downloadCanvasAsPng({ current: null })).toBe(false);
      expect(downloadCanvasAsPng({ current: { querySelector: () => null } })).toBe(false);
    });

    it("triggers click on created anchor element with data URL", () => {
      const mockCanvas = document.createElement("canvas");
      mockCanvas.toDataURL = () => "data:image/png;base64,mockdata";
      const res = downloadCanvasAsPng(mockCanvas, "test.png");
      expect(res).toBe(true);

      // Using ref with querySelector returning canvas
      const refWithCanvas = { current: { querySelector: () => mockCanvas } };
      expect(downloadCanvasAsPng(refWithCanvas, "ref.png")).toBe(true);
    });
  });
});
