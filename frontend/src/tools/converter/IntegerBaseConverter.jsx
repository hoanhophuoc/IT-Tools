"use client";
import { useState, useMemo } from "react";
import Input from "@/components/ui/Input";
import InfoRow from "@/components/ui/InfoRow";

const BASES = [
  { label: "Binary (2)", value: 2, regex: /^[01]+$/ },
  { label: "Octal (8)", value: 8, regex: /^[0-7]+$/ },
  { label: "Decimal (10)", value: 10, regex: /^[0-9]+$/ },
  { label: "Hexadecimal (16)", value: 16, regex: /^[0-9a-fA-F]+$/ },
  { label: "Base64 (64)", value: 64, regex: /^[A-Za-z0-9+/=]+$/ },
];

function base64ToDecimal(str) {
  try {
    const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(bin, (c) => c.charCodeAt(0))
      .reduce((acc, b) => (acc << 8n) + BigInt(b), 0n)
      .toString(10);
  } catch {
    return "";
  }
}

function decimalToBase64(numStr) {
  try {
    let n = BigInt(numStr);
    const bytes = [];
    while (n > 0n) {
      bytes.unshift(Number(n & 255n));
      n >>= 8n;
    }
    return btoa(String.fromCharCode(...(bytes.length ? bytes : [0])));
  } catch {
    return "";
  }
}

export function convertAllBases(input, inputBase) {
  if (!input) return { 2: "", 8: "", 10: "", 16: "", 64: "" };

  const prefixMap = { 2: "0b", 8: "0o", 10: "", 16: "0x" };
  try {
    const n =
      inputBase === 64
        ? BigInt(base64ToDecimal(input))
        : BigInt(`${prefixMap[inputBase] ?? ""}${input}`);

    return {
      2: n.toString(2),
      8: n.toString(8),
      10: n.toString(10),
      16: n.toString(16).toUpperCase(),
      64: decimalToBase64(n.toString(10)),
    };
  } catch {
    return { 2: "", 8: "", 10: "", 16: "", 64: "" };
  }
}

export default function IntegerBaseConverter() {
  const [input, setInput] = useState("");
  const [base, setBase] = useState(10);

  const baseObj = BASES.find((b) => b.value === Number(base));
  const isValid = baseObj?.regex.test(input);

  const results = useMemo(() => {
    return isValid
      ? convertAllBases(input, Number(base))
      : { 2: "", 8: "", 10: "", 16: "", 64: "" };
  }, [input, base, isValid]);

  return (
    <div className="space-y-4">
      <Input
        label="Input Number"
        value={input}
        onChange={(e) => {
          setInput(e.target.value.trim());
        }}
        placeholder="Enter number"
        error={input && !isValid ? `Invalid number for base ${base}` : ""}
      />

      <div>
        <label htmlFor="input-base" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Input Base
        </label>
        <select
          id="input-base"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-400"
          value={base}
          onChange={(e) => setBase(Number(e.target.value))}
        >
          {BASES.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      <InfoRow label="Binary (2)" value={results[2]} />
      <InfoRow label="Octal (8)" value={results[8]} />
      <InfoRow label="Decimal (10)" value={results[10]} />
      <InfoRow label="Hexadecimal (16)" value={results[16]} />
      <InfoRow label="Base64 (64)" value={results[64]} />
    </div>
  );
}