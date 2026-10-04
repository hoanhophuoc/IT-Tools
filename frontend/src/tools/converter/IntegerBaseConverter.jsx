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

import { convertAllBases } from "./integerBaseConverterUtils.js";

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