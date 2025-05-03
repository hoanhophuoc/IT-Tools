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
