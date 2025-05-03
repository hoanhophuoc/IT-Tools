// src/lib/dateUtils.js (or keep in component file)
import {
  formatDuration as formatDurationFns,
  intervalToDuration,
} from "date-fns";
// Optional: Import locales if needed, e.g., import { enGB } from 'date-fns/locale';

/**
 * Formats a duration in milliseconds into a human-readable string.
 * Example: 123456 ms -> "2 minutes 3 seconds 456 ms"
 * @param {number} durationMs Duration in milliseconds.
 * @returns {string} Formatted duration string.
 */
export function formatMsDuration(durationMs) {
  if (isNaN(durationMs) || durationMs < 0) {
    return "Invalid duration";
  }
  if (durationMs === 0) {
    return "0 milliseconds";
  }

  // Use date-fns intervalToDuration to break down ms
  const duration = intervalToDuration({
    start: 0,
    end: Math.max(0, Math.floor(durationMs)),
  }); // Use floor to avoid float issues

  // Extract milliseconds separately as formatDuration doesn't handle them well
  const ms = Math.floor(durationMs % 1000);

  // Build the formatted string, removing zero values
  const formatted = formatDurationFns(duration, {
    format: ["days", "hours", "minutes", "seconds"], // Specify units
    zero: false, // Don't include zero values (e.g., "0 hours")
    // locale: enGB, // Optional: pass locale if needed
  });

  // Combine with milliseconds if present
  const msString = ms > 0 ? `${ms} millisecond${ms !== 1 ? "s" : ""}` : "";

  // Join parts with spaces, handling cases where only ms exists
  const parts = [formatted, msString].filter(Boolean); // Filter out empty strings
  return parts.length > 0 ? parts.join(" ") : "0 milliseconds"; // Return "0 ms" if all else is zero
}

// You might also want a function to format the end date more precisely
/**
 * Formats an end date relative to now or as an absolute date/time.
 * @param {Date | number} endDateTimestamp The end date timestamp or Date object.
 * @returns {string} Formatted date string.
 */
// import { format, formatRelative as formatRelativeFns, isDate } from 'date-fns';
// export function formatEndDate(endDateTimestamp) {
//   if (!endDateTimestamp) return 'N/A';
//   try {
//     const endDate = isDate(endDateTimestamp) ? endDateTimestamp : new Date(endDateTimestamp);
//     if (isNaN(endDate.getTime())) return 'Invalid Date';

//     // Use formatRelative for dates close to now, otherwise absolute format
//     // return formatRelativeFns(endDate, new Date(), { locale: enGB }); // Using relative format like Vue example
//     // Or use a specific absolute format
//     return format(endDate, 'Pp', { /* locale: enGB */ }); // e.g., 09/05/2025, 5:24:22 PM
//      // Or just date: return format(endDate, 'P'); // e.g., 09/05/2025
//   } catch (error) {
//     console.error("Error formatting end date:", error);
//     return 'Invalid Date';
//   }
// }
