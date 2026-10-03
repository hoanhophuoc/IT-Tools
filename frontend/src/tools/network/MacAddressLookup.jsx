"use client";

import { useState, useMemo } from "react";
import ouiData from "oui-data";
import Input from "@/components/ui/Input";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";

const isValidMacFormat = (mac) => {
  if (!mac || typeof mac !== "string") return false;
  const macRegex =
    /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{12})$/;
  return macRegex.test(mac.trim());
};

const formatVendorInfo = (infoString) => {
  if (!infoString || typeof infoString !== "string") {
    return ["Unknown vendor for this address"];
  }
  return infoString
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
};

export default function MacAddressLookup() {
  const [macAddress, setMacAddress] = useState("20:37:06:12:34:56");
  const [inputError, setInputError] = useState("");

  const vendorInfo = useMemo(() => {
    const cleanMac = macAddress.trim();
    setInputError("");
    if (!cleanMac) return null;
    if (!isValidMacFormat(cleanMac)) {
      setInputError("Invalid MAC address format.");
      return null;
    }
    try {
      const ouiKey = cleanMac
        .replace(/[:-]/g, "")
        .substring(0, 6)
        .toUpperCase();
      const result = ouiData[ouiKey];
      return result ? formatVendorInfo(result) : formatVendorInfo(null);
    } catch (error) {
      setInputError("Vendor lookup failed.");
      return null;
    }
  }, [macAddress]);

  const vendorInfoString = useMemo(
    () => vendorInfo?.join("\n") || "",
    [vendorInfo],
  );

  const handleInputChange = (e) => {
    setMacAddress(e.target.value);
  };

  return (
    <div className="space-y-5">
      <Input
        label="MAC address:"
        id="macAddress"
        value={macAddress}
        onChange={handleInputChange}
        placeholder="Enter MAC address (e.g., 00:1A:2B:3C:4D:5E)"
        error={inputError}
        className={`font-mono ${inputError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
        maxLength={17}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
      <div className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        Vendor info:
      </div>
      <div className="min-h-[80px] rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-slate-800">
        {macAddress.trim() && !inputError && vendorInfo ? (
          vendorInfo.map((line, index) => (
            <div
              key={index}
              className="text-sm text-gray-800 dark:text-gray-200"
            >
              {line}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 italic dark:text-gray-400">
            {inputError
              ? ""
              : macAddress.trim()
                ? "Vendor not found or MAC invalid."
                : "Enter a MAC address above."}
          </p>
        )}
      </div>
      <div className="flex justify-center pt-2">
        <CopyToClipboardButton
          textToCopy={vendorInfoString}
          disabled={!vendorInfoString || !!inputError}
          buttonText="Copy vendor info"
          variant="secondary"
        />
      </div>
    </div>
  );
}
