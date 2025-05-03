"use client";

import { useState, useEffect, useMemo } from "react";
import {
  parsePhoneNumberFromString,
  getCountryCallingCode,
} from "libphonenumber-js/max";
import {
  getDefaultCountryCode,
  formatPhoneNumberType,
  getCountryOptions,
} from "@/lib/phoneUtils";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import InfoRow from "@/components/ui/InfoRow";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";

export default function PhoneParserFormatter() {
  const [rawPhone, setRawPhone] = useState("");
  const [defaultCountryCode, setDefaultCountryCode] = useState("US");
  const [countryOptions, setCountryOptions] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setDefaultCountryCode(getDefaultCountryCode());
    setCountryOptions(getCountryOptions());
  }, []);

  const parsedPhoneNumber = useMemo(() => {
    setError("");
    if (!rawPhone.trim()) {
      return null;
    }
    try {
      const phoneNumber = parsePhoneNumberFromString(
        rawPhone,
        defaultCountryCode,
      );
      if (phoneNumber) {
        return phoneNumber;
      } else {
        return null;
      }
    } catch (err) {
      console.error("Phone parsing error:", err);
      setError("Error parsing phone number.");
      return null;
    }
  }, [rawPhone, defaultCountryCode]);

  const parsedDetails = useMemo(() => {
    if (!parsedPhoneNumber) return [];

    const details = [
      { label: "Is Valid?", value: parsedPhoneNumber.isValid() ? "Yes" : "No" },
      {
        label: "Is Possible?",
        value: parsedPhoneNumber.isPossible() ? "Yes" : "No",
      },
      { label: "Country", value: parsedPhoneNumber.country },
      { label: "Calling Code", value: parsedPhoneNumber.countryCallingCode },
      { label: "National Number", value: parsedPhoneNumber.nationalNumber },
      {
        label: "Type",
        value: formatPhoneNumberType(parsedPhoneNumber.getType()),
      },
      {
        label: "Format (Intl)",
        value: parsedPhoneNumber.formatInternational(),
      },
      { label: "Format (National)", value: parsedPhoneNumber.formatNational() },
      { label: "Format (E.164)", value: parsedPhoneNumber.format("E.164") },
      { label: "Format (RFC3966)", value: parsedPhoneNumber.format("RFC3966") },
      { label: "URI", value: parsedPhoneNumber.getURI() },
    ];
    return details.filter((d) => d.value !== undefined && d.value !== null);
  }, [parsedPhoneNumber]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Select
          label="Default country code:"
          id="defaultCountryCode"
          value={defaultCountryCode}
          onChange={(e) => setDefaultCountryCode(e.target.value)}
          options={countryOptions}
        />
        <Input
          label="Phone number:"
          id="rawPhone"
          value={rawPhone}
          onChange={(e) => setRawPhone(e.target.value)}
          placeholder="Enter a phone number (e.g., +1 415 555 2671)"
          error={error}
        />
      </div>

      {parsedPhoneNumber && parsedDetails.length > 0 && (
        <div className="mt-6 space-y-2 rounded-md border border-gray-200 p-4 dark:border-gray-700 dark:bg-slate-800">
          <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">
            Parsed Information
          </h3>
          {parsedDetails.map((detail) => (
            <InfoRow
              key={detail.label}
              label={detail.label + " :"}
              value={detail.value}
            />
          ))}
        </div>
      )}

      {rawPhone.trim() && !parsedPhoneNumber && !error && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Could not parse phone number with selected country. Try including the
          country code (e.g., +1).
        </p>
      )}
    </div>
  );
}
