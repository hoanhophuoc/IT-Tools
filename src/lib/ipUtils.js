// src/lib/ipUtils.js

/**
 * Validates if a string is a valid IPv4 address format.
 * @param {string} ip The string to validate.
 * @returns {boolean} True if valid IPv4 format, false otherwise.
 */
export function isValidIpv4(ip) {
  if (!ip || typeof ip !== "string") return false;
  const cleanIp = ip.trim();
  // Regex to check for 4 octets (0-255) separated by dots
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(cleanIp);
}

/**
 * Converts a valid IPv4 string to its 32-bit integer representation.
 * Returns null if the input is not a valid IPv4 address.
 * @param {string} ip The IPv4 string (e.g., "192.168.1.1").
 * @returns {number | null} The decimal integer or null.
 */
export function ipv4ToInt(ip) {
  if (!isValidIpv4(ip)) {
    return null;
  }
  // Use bitwise left shift for efficient calculation
  return (
    ip
      .split(".")
      .reduce((res, octet) => (res << 8) | parseInt(octet, 10), 0) >>> 0
  );
  // >>> 0 ensures the result is treated as an unsigned 32-bit integer
}

/**
 * Converts a 32-bit integer (representing an IPv4) to an IPv4 string.
 * @param {number} intValue The integer value.
 * @returns {string} The IPv4 string.
 */
export function intToIpv4(intValue) {
  if (isNaN(intValue) || intValue < 0 || intValue > 0xffffffff) return ""; // Basic validation
  // Use bitwise right shift and masking
  return `${intValue >>> 24}.${(intValue >> 16) & 255}.${(intValue >> 8) & 255}.${intValue & 255}`;
}

/**
 * Converts a valid IPv4 string to an IPv6 representation (IPv4-mapped IPv6 address).
 * Example: 192.168.1.1 -> 0000:0000:0000:0000:0000:ffff:c0a8:0101 or ::ffff:c0a8:0101
 * Returns an empty string if the input is not a valid IPv4 address.
 * @param {string} ip The IPv4 string.
 * @param {boolean} [shortFormat=false] If true, returns the shortened ::ffff: format.
 * @returns {string} The IPv6 formatted string or empty string.
 */
export function ipv4ToIpv6(ip, shortFormat = false) {
  if (!isValidIpv4(ip)) {
    return "";
  }
  const parts = ip.split(".").map((part) => parseInt(part, 10));
  // Convert octets to hex pairs
  const hexPart1 = ((parts[0] << 8) | parts[1]).toString(16).padStart(4, "0");
  const hexPart2 = ((parts[2] << 8) | parts[3]).toString(16).padStart(4, "0");

  if (shortFormat) {
    return `::ffff:${hexPart1}:${hexPart2}`;
  } else {
    return `0000:0000:0000:0000:0000:ffff:${hexPart1}:${hexPart2}`;
  }
}

/**
 * Converts a number between bases (handles basic positive integers).
 * Note: For large numbers or different number systems, a dedicated library is better.
 * @param {string} value The number string to convert.
 * @param {number} fromBase The base of the input value (e.g., 10).
 * @param {number} toBase The target base (e.g., 2, 16).
 * @returns {string} The converted number string or 'Invalid input'.
 */
export function convertBase(value, fromBase, toBase) {
  if (value === null || value === undefined || value === "") return "";
  try {
    // parseInt handles conversion from various bases (up to 36) to base 10
    const decimalValue = parseInt(String(value), fromBase);
    if (isNaN(decimalValue)) {
      throw new Error("Input is not a valid number in the specified base.");
    }
    // toString handles conversion from base 10 to other bases (up to 36)
    return decimalValue.toString(toBase);
  } catch (e) {
    console.error("Base conversion error:", e);
    return "Invalid input";
  }
}

/**
 * Calculates the smallest CIDR block encompassing the given start and end IPs.
 * @param {string} startIp The starting IPv4 address.
 * @param {string} endIp The ending IPv4 address.
 * @returns {object | null} An object with oldSize, newStart, newEnd, newCidr, newSize, or null if input is invalid.
 */
export function calculateCidrFromRange(startIp, endIp) {
  if (!isValidIpv4(startIp) || !isValidIpv4(endIp)) {
    return null; // Invalid input IPs
  }

  const startInt = ipv4ToInt(startIp);
  const endInt = ipv4ToInt(endIp);

  if (startInt === null || endInt === null || startInt > endInt) {
    return null; // Invalid conversion or end IP is smaller than start IP
  }

  // Convert to 32-bit binary strings, padded with leading zeros
  const startBin = startInt.toString(2).padStart(32, "0");
  const endBin = endInt.toString(2).padStart(32, "0");

  // Calculate original range size (inclusive)
  const oldSize = endInt - startInt + 1;

  // Find the first bit position where they differ
  let mask = 32;
  for (let i = 0; i < 32; i++) {
    if (startBin[i] !== endBin[i]) {
      mask = i;
      break;
    }
  }

  // Calculate the network address (new start) for the CIDR block
  const networkBin = startBin.substring(0, mask) + "0".repeat(32 - mask);
  const networkInt = parseInt(networkBin, 2);
  const newStartIp = intToIpv4(networkInt);

  // Calculate the broadcast address (new end) for the CIDR block
  const broadcastBin = startBin.substring(0, mask) + "1".repeat(32 - mask);
  const broadcastInt = parseInt(broadcastBin, 2);
  const newEndIp = intToIpv4(broadcastInt);

  // Calculate the size of the new CIDR range
  const newSize = Math.pow(2, 32 - mask);

  // Format CIDR notation
  const newCidr = `${newStartIp}/${mask}`;

  return {
    oldSize: oldSize,
    newStart: newStartIp,
    newEnd: newEndIp,
    newCidr: newCidr,
    newSize: newSize,
  };
}
