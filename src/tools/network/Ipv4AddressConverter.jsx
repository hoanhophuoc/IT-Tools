// src/tools/network/Ipv4AddressConverter.jsx
"use client";

import { useState, useMemo } from "react";
import Input from "@/components/ui/Input";
import InfoRow from "@/components/ui/InfoRow";
import { isValidIpv4, ipv4ToInt, ipv4ToIpv6, convertBase } from "@/lib/ipUtils";

export default function Ipv4AddressConverter() {
  const [rawIpAddress, setRawIpAddress] = useState("192.168.1.1");
  const [inputError, setInputError] = useState("");

  const conversions = useMemo(() => {
    const ip = rawIpAddress.trim();
    const isValid = isValidIpv4(ip);

    setInputError(isValid || !ip ? "" : "Invalid IPv4 address format.");

    if (!isValid) {
      return {
        decimal: "",
        hexadecimal: "",
        binary: "",
        ipv6: "",
        ipv6Short: "",
      };
    }

    try {
      const ipInt = ipv4ToInt(ip);
      if (ipInt === null) throw new Error("Conversion to Int failed");

      return {
        decimal: String(ipInt),
        hexadecimal: convertBase(ipInt, 10, 16).toUpperCase(),
        binary: convertBase(ipInt, 10, 2).padStart(32, "0"),
        ipv6: ipv4ToIpv6(ip),
        ipv6Short: ipv4ToIpv6(ip, true),
      };
    } catch (error) {
      console.error("Conversion error:", error);
      setInputError("Error during conversion.");
      return {
        decimal: "",
        hexadecimal: "",
        binary: "",
        ipv6: "",
        ipv6Short: "",
      };
    }
  }, [rawIpAddress]);

  return (
    <div className="space-y-6">
      <Input
        label="The IPv4 address:"
        id="ipv4Input"
        value={rawIpAddress}
        onChange={(e) => setRawIpAddress(e.target.value)}
        placeholder="Enter IPv4 address (e.g., 192.168.1.1)"
        error={inputError}
        className={`font-mono ${inputError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
        aria-invalid={!!inputError}
      />

      {rawIpAddress.trim() && !inputError && (
        <div className="mt-4 space-y-2 rounded-md border border-gray-200 p-4 dark:border-gray-700 dark:bg-slate-800">
          <InfoRow
            label="Decimal:"
            value={conversions.decimal}
            placeholder="N/A"
          />
          <InfoRow
            label="Hexadecimal:"
            value={conversions.hexadecimal}
            placeholder="N/A"
          />
          <InfoRow
            label="Binary:"
            value={conversions.binary}
            placeholder="N/A"
          />
          <InfoRow label="IPv6:" value={conversions.ipv6} placeholder="N/A" />
          <InfoRow
            label="IPv6 (short):"
            value={conversions.ipv6Short}
            placeholder="N/A"
          />
        </div>
      )}
      {inputError && rawIpAddress.trim() && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {inputError}
        </p>
      )}
    </div>
  );
}
