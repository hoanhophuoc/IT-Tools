import { getCountries, getCountryCallingCode } from "libphonenumber-js/max";
import lookup from "country-code-lookup";

export function formatPhoneNumberType(type) {
  if (!type) return undefined;
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
    UNKNOWN: "Unknown",
  };
  return typeMap[type] || type;
}

export function getDefaultCountryCode() {
  const defaultCode = "US";
  if (typeof window === "undefined" || !window.navigator.language) {
    return defaultCode;
  }
  try {
    const locale = window.navigator.language;
    const countryCode = locale.split("-")[1]?.toUpperCase();
    if (countryCode && getCountries().includes(countryCode)) {
      return countryCode;
    }
  } catch (e) {}
  return defaultCode;
}

export function getCountryOptions() {
  const countries = getCountries();
  const options = countries
    .map((code) => {
      const countryInfo = lookup.byIso(code);
      const defaultLabel = code;
      let displayLabel = defaultLabel;
      let callingCode = "";
      try {
        callingCode = getCountryCallingCode(code);
      } catch (e) {}
      if (countryInfo?.country) {
        displayLabel = countryInfo.country;
      }
      const finalLabel = callingCode
        ? `${displayLabel} (+${callingCode})`
        : displayLabel;
      return { label: finalLabel, value: code };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
  return options;
}
