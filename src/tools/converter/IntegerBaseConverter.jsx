"use client";
import { useState } from "react";
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
    let hex = "";
    for (let i = 0; i < bin.length; i++) {
      hex += ("0" + bin.charCodeAt(i).toString(16)).slice(-2);
    }
    return BigInt("0x" + hex).toString(10);
  } catch {
    return "";
  }
}
function decimalToBase64(numStr) {
  try {
    let n = BigInt(numStr);
    let hex = n.toString(16);
    if (hex.length % 2) hex = "0" + hex;
    let bin = "";
    for (let i = 0; i < hex.length; i += 2) {
      bin += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
    }
    return btoa(bin);
  } catch {
    return "";
  }
}

function convertAllBases(input, inputBase) {
  let dec = "";
  if (!input) return { 2: "", 8: "", 10: "", 16: "", 64: "" };

  if (inputBase === 64) {
    dec = base64ToDecimal(input);
    if (!dec) return { 2: "", 8: "", 10: "", 16: "", 64: "" };
  } else {
    try {
      dec = BigInt(`0b${parseInt(input, inputBase).toString(2)}`).toString(10);
    } catch {
      return { 2: "", 8: "", 10: "", 16: "", 64: "" };
    }
  }

  try {
    const n = BigInt(dec);
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
  const [error, setError] = useState("");

  const baseObj = BASES.find((b) => b.value === Number(base));
  const isValid = baseObj?.regex.test(input);

  const results = isValid ? convertAllBases(input, Number(base)) : { 2: "", 8: "", 10: "", 16: "", 64: "" };

  return (
    <div className="space-y-4">
      <Input
        label="Input Number"
        value={input}
        onChange={(e) => {
          setInput(e.target.value.trim());
          setError("");
        }}
        placeholder="Enter number"
        error={input && !isValid ? `Invalid number for base ${base}` : ""}
      />

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Input Base
        </label>
        <select
          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-400"
          value={base}
          onChange={(e) => {
            setBase(Number(e.target.value));
            setError("");
          }}
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