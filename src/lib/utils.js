// src/lib/utils.js

/**
 * Formats a date object or string into a more readable format.
 * @param {Date | string | number} dateInput The date to format.
 * @param {object} options Intl.DateTimeFormat options.
 * @returns {string} Formatted date string or empty string if input is invalid.
 */
export const formatDate = (dateInput, options = {}) => {
  if (!dateInput) return "";
  try {
    const date = new Date(dateInput);
    // Check if date is valid after conversion
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    const defaultOptions = {
      year: "numeric",
      month: "short", // e.g., 'Jan', 'Feb'
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true, // Use AM/PM
      ...options, // Allow overriding defaults
    };
    return new Intl.DateTimeFormat("en-US", defaultOptions).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date"; // Return fallback on error
  }
};

/**
 * Simple function to simulate network delay (for testing loading states).
 * @param {number} ms Delay in milliseconds.
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Truncates a string to a specified length and adds ellipsis.
 * @param {string} str The string to truncate.
 * @param {number} maxLength The maximum length before truncation.
 * @returns {string} The truncated string or the original string.
 */
export const truncateText = (str, maxLength = 50) => {
  if (!str) return "";
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength) + "...";
};

/**
 * Encodes a UTF-8 string to Base64, suitable for data URLs.
 * @param {string} str The UTF-8 string to encode.
 * @returns {string} The Base64 encoded string.
 */
export const utf8ToBase64 = (str) => {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    try {
      // Encode UTF-8 string to Base64 (handles Unicode characters)
      return window.btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
      console.error("Base64 encoding failed:", e);
      // Fallback or simple btoa for basic cases if needed, but might corrupt unicode
      try {
        return window.btoa(str);
      } catch {
        return "";
      }
    }
  } else {
    // Fallback for non-browser environments (SSR, Node.js tests) - might not handle all chars
    try {
      return Buffer.from(str, "utf-8").toString("base64");
    } catch {
      return "";
    }
  }
};

/**
 * Standardized color input handler for hex color fields (for use with text or color input).
 * Ensures value is always in #RRGGBB format and only valid hex digits.
 * @param {function} setter State setter function (e.g., setFgColor)
 * @returns {function} Event handler for onChange
 */
export function handleHexColorChange(setter) {
  return (e) => {
    let value = e.target.value;
    if (e.target.type === "text") {
      if (!value.startsWith("#")) {
        value = "#" + value;
      }
      value = "#" + value.substring(1).replace(/[^0-9a-fA-F]/g, "");
      value = value.substring(0, 7);
    }
    setter(value);
  };
}

/**
 * Download the content of a canvas as a PNG file via a hidden link.
 * @param {HTMLDivElement|HTMLCanvasElement} canvasRef Ref to a div containing a <canvas> or the canvas itself
 * @param {HTMLAnchorElement} linkRef Ref to a hidden <a> element
 * @param {string} filename Name for the downloaded file
 * @returns {boolean} True if download started, false otherwise
 */
export function downloadCanvasAsPng(
  canvasRef,
  linkRef,
  filename = "download.png",
) {
  const canvas = canvasRef?.current?.querySelector
    ? canvasRef.current.querySelector("canvas")
    : canvasRef?.current || canvasRef;
  const link = linkRef?.current || linkRef;
  if (canvas && link) {
    try {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      link.href = pngUrl;
      link.download = filename;
      link.click();
      return true;
    } catch (err) {
      console.error("Failed to create data URL from canvas:", err);
      return false;
    }
  }
  return false;
}
