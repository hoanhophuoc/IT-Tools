"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import InfoRow from "@/components/ui/InfoRow";

const SCALES = [
  { label: "Bit (b)", value: "bit", factor: 1 },
  { label: "Byte (B)", value: "byte", factor: 8 },
  { label: "Kilobyte (KB)", value: "kilobyte", factor: 8 * 1024 },
  { label: "Megabyte (MB)", value: "megabyte", factor: 8 * 1024 * 1024 },
  { label: "Gigabyte (GB)", value: "gigabyte", factor: 8 * 1024 * 1024 * 1024 },
  { label: "Terabyte (TB)", value: "terabyte", factor: 8 * 1024 * 1024 * 1024 * 1024 },
  { label: "Petabyte (PB)", value: "petabyte", factor: 8 * 1024 * 1024 * 1024 * 1024 * 1024 },
  { label: "Exabyte (EB)", value: "exabyte", factor: 8 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 },
  { label: "Zettabyte (ZB)", value: "zettabyte", factor: 8 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 },
  { label: "Yottabyte (YB)", value: "yottabyte", factor: 8 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 },
];

function toBits(value, scale) {
  const scaleObj = SCALES.find((s) => s.value === scale);
  if (!scaleObj) return NaN;
  return parseFloat(value) * scaleObj.factor;
}

function fromBits(bits) {
  const result = {};
  SCALES.forEach((s) => {
    result[s.value] = bits / s.factor;
  });
  return result;
}

function format(val) {
  if (typeof val !== "number" || !isFinite(val)) return "";
  if (Math.abs(val) >= 1 && Math.abs(val) < 1000)
    return val.toFixed(2).replace(/\.00$/, "");
  if (Math.abs(val) < 1) return val.toPrecision(3);
  return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function DataSize() {
  const [input, setInput] = useState("");
  const [scale, setScale] = useState("byte");

  const isValid = input !== "" && !isNaN(Number(input));
  const bits = isValid ? toBits(input, scale) : null;
  const results = isValid && isFinite(bits) ? fromBits(bits) : {};

  return (
    <div className="space-y-4">
      <Input
        label="Data Size"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter value"
        type="number"
      />
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Input Unit
        </label>
        <select
          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-400"
          value={scale}
          onChange={(e) => setScale(e.target.value)}
        >
          {SCALES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {SCALES.map((s) => (
        <InfoRow
          key={s.value}
          label={s.label}
          value={format(results[s.value])}
        />
      ))}
    </div>
  );
}
