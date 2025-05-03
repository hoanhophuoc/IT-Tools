// src/lib/phoneUtils.js
import {
  getCountries,
  getCountryCallingCode,
  AsYouType,
  parsePhoneNumberFromString,
} from "libphonenumber-js/max"; // Use /max for metadata
import lookup from "country-code-lookup";
// Note: 'country-code-lookup' is a separate npm package. We can achieve similar functionality
// by getting country names directly from libphonenumber-js metadata if needed,
// or install 'country-code-lookup': npm install country-code-lookup
// Let's try without it first. libphonenumber-js might suffice.

/**
 * Formats the phone number type into a readable string.
 */
export function formatPhoneNumberType(type) {
  if (!type) return undefined;
  // Simplified mapping - can be expanded based on libphonenumber's types
  const typeMap = {
    MOBILE: "Mobile",
    FIXED_LINE: "Fixed line",
    FIXED_LINE_OR_MOBILE: "Fixed line or mobile",
    PERSONAL_NUMBER: "Personal number",
    PREMIUM_RATE: "Premium rate",
    SHARED_COST: "Shared cost",
    TOLL_FREE: "Toll free",
    UAN: "UAN",
    VOICEMAIL: "Voicemail",
    VOIP: "VoIP",
    PAGER: "Pager",
    UNKNOWN: "Unknown", // Add unknown type
  };
  return typeMap[type] || type; // Return original type if not in map
}

/**
 * Tries to get the full country name from libphonenumber metadata (requires /max import).
 * This is less direct than 'country-code-lookup'.
 * A dedicated library might be better for reliable full names.
 */
// export function getFullCountryName(countryCode) {
//   if (!countryCode) return undefined;
//   // Placeholder: libphonenumber-js doesn't directly expose a simple country name lookup
//   // You would typically use a separate library or maintain your own mapping.
//   // For now, we'll just return the code.
//   return countryCode;
// }

/**
 * Attempts to determine the user's default country code based on browser locale.
 * Falls back to 'US'.
 */
export function getDefaultCountryCode() {
  const defaultCode = "US"; // Fallback default
  if (typeof window === "undefined" || !window.navigator.language) {
    return defaultCode;
  }
  try {
    const locale = window.navigator.language; // e.g., "en-US", "fr-FR"
    const countryCode = locale.split("-")[1]?.toUpperCase();

    // Check if the extracted code is a valid country code known by the library
    if (countryCode && getCountries().includes(countryCode)) {
      return countryCode;
    }
  } catch (e) {
    console.error("Error getting default country code:", e);
  }
  return defaultCode;
}

/**
 * Generates options for a country select dropdown with full names.
 */
export function getCountryOptions() {
  const countries = getCountries(); // Get all country codes ('US', 'GB', 'FR', ...)
  const options = countries
    .map((code) => {
      const countryInfo = lookup.byIso(code); // <-- Find country info by ISO code
      const defaultLabel = code; // Fallback label
      let displayLabel = defaultLabel;
      let callingCode = "";

      try {
        callingCode = getCountryCallingCode(code); // Get calling code
      } catch (e) {
        /* Ignore if calling code fails */
      }

      // Use the full country name if found by the lookup library
      if (countryInfo?.country) {
        displayLabel = countryInfo.country;
      }

      // Construct the final label
      const finalLabel = callingCode
        ? `${displayLabel} (+${callingCode})`
        : displayLabel;

      return { label: finalLabel, value: code }; // value is still the ISO code ('US')
    })
    // Filter out any potentially problematic entries if lookup failed badly (optional)
    // .filter(opt => opt.label !== opt.value)
    .sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by display label

  return options;
}
