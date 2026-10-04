"use client";

import { useState, useEffect, useMemo } from "react";
import Input from "@/components/ui/Input";
import InfoRow from "@/components/ui/InfoRow";
import { loadScript } from "@/lib/utils";

const HASH_ALGORITHMS = [
  { key: "md5", label: "MD5 Hash", fn: (c, t) => c.MD5(t) },
  { key: "sha1", label: "SHA1 Hash", fn: (c, t) => c.SHA1(t) },
  { key: "sha256", label: "SHA256 Hash", fn: (c, t) => c.SHA256(t) },
  { key: "sha224", label: "SHA224 Hash", fn: (c, t) => c.SHA224(t) },
  { key: "sha512", label: "SHA512 Hash", fn: (c, t) => c.SHA512(t) },
  { key: "sha384", label: "SHA384 Hash", fn: (c, t) => c.SHA384(t) },
  { key: "sha3", label: "SHA3 Hash", fn: (c, t) => c.SHA3(t) },
  { key: "ripemd160", label: "RIPEMD160 Hash", fn: (c, t) => c.RIPEMD160(t) },
];

export default function HashText() {
  const [error, setError] = useState("");
  const [hashText, setHashText] = useState("");
  const [encodingType, setEncodingType] = useState("base16");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadScript("https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/crypto-js.min.js")
      .then(() => {
        if (!window.CryptoJS) throw new Error("CryptoJS is not available.");
        setIsLoaded(true);
      })
      .catch((e) => setError(e.message));
  }, []);

  const results = useMemo(() => {
    if (!isLoaded || !hashText || typeof window === "undefined" || !window.CryptoJS) {
      return {};
    }

    const crypto = window.CryptoJS;
    const encoders = {
      base2: (d) => Number.parseInt(d.toString(), 16).toString(2),
      base64: (d) => crypto.enc.Base64.stringify(d),
      base64url: (d) => crypto.enc.Base64url.stringify(d),
    };
    const encoder = encoders[encodingType] || ((d) => d.toString());

    const calculated = {};
    for (const algo of HASH_ALGORITHMS) {
      try {
        calculated[algo.key] = encoder(algo.fn(crypto, hashText));
      } catch {
        calculated[algo.key] = "Error";
      }
    }
    return calculated;
  }, [hashText, encodingType, isLoaded]);

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="border-b border-gray-300 pb-4 dark:border-gray-700">
        <Input
          label="Text to Hash"
          id="hashText"
          value={hashText}
          onChange={(e) => setHashText(e.target.value)}
          placeholder="Your string to hash"
        />
      </div>

      <div>
        <label
          htmlFor="encodingType"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Digest encoding
        </label>
        <select
          id="encodingType"
          name="encodingType"
          value={encodingType}
          onChange={(e) => setEncodingType(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-400"
        >
          <option value="base2">Binary (base 2)</option>
          <option value="base16">Hexadecimal (base 16)</option>
          <option value="base64">Base64 (base 64)</option>
          <option value="base64url">Base64url (base 64 with url safe chars)</option>
        </select>
      </div>

      <div className="space-y-2 pt-2">
        {HASH_ALGORITHMS.map((algo) => (
          <InfoRow
            key={algo.key}
            label={algo.label}
            value={results[algo.key] || ""}
            placeholder={`${algo.label} result`}
          />
        ))}
      </div>
    </div>
  );
}
