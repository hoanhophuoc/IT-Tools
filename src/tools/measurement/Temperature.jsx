"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import InfoRow from "@/components/ui/InfoRow";

const SCALES = [
  { label: "Kelvin (K)", value: "kelvin" },
  { label: "Celsius (°C)", value: "celsius" },
  { label: "Fahrenheit (°F)", value: "fahrenheit" },
  { label: "Rankine (°R)", value: "rankine" },
  { label: "Delisle (°De)", value: "delisle" },
  { label: "Newton (°N)", value: "newton" },
  { label: "Réaumur (°Ré)", value: "reaumur" },
  { label: "Rømer (°Rø)", value: "romer" },
];

function toKelvin(value, scale) {
  value = parseFloat(value);
  switch (scale) {
    case "kelvin": return value;
    case "celsius": return value + 273.15;
    case "fahrenheit": return (value + 459.67) * 5 / 9;
    case "rankine": return value * 5 / 9;
    case "delisle": return 373.15 - value * 2 / 3;
    case "newton": return value * 100 / 33 + 273.15;
    case "reaumur": return value * 5 / 4 + 273.15;
    case "romer": return (value - 7.5) * 40 / 21 + 273.15;
    default: return NaN;
  }
}

function fromKelvin(k) {
  return {
    kelvin: k,
    celsius: k - 273.15,
    fahrenheit: k * 9 / 5 - 459.67,
    rankine: k * 9 / 5,
    delisle: (373.15 - k) * 3 / 2,
    newton: (k - 273.15) * 33 / 100,
    reaumur: (k - 273.15) * 4 / 5,
    romer: (k - 273.15) * 21 / 40 + 7.5,
  };
}

function format(val) {
    if (typeof val !== "number" || !isFinite(val)) return "";
    const fixed = val.toFixed(2);
    if (fixed.endsWith(".00")) return fixed.slice(0, -3);
    if (fixed.endsWith("0")) return fixed.slice(0, -1);
    return fixed;
  }

export default function Temperature() {
  const [input, setInput] = useState("");
  const [scale, setScale] = useState("celsius");

  const isValid = input !== "" && !isNaN(Number(input));
  const kelvin = isValid ? toKelvin(input, scale) : null;
  const results = isValid && isFinite(kelvin) ? fromKelvin(kelvin) : {};

  return (
    <div className="space-y-4">
      <Input
        label="Temperature"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Enter value"
        type="number"
      />
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
          Input Scale
        </label>
        <select
          className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-400"
          value={scale}
          onChange={e => setScale(e.target.value)}
        >
          {SCALES.map(s => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <InfoRow label="Kelvin (K)" value={format(results.kelvin)} />
      <InfoRow label="Celsius (°C)" value={format(results.celsius)} />
      <InfoRow label="Fahrenheit (°F)" value={format(results.fahrenheit)} />
      <InfoRow label="Rankine (°R)" value={format(results.rankine)} />
      <InfoRow label="Delisle (°De)" value={format(results.delisle)} />
      <InfoRow label="Newton (°N)" value={format(results.newton)} />
      <InfoRow label="Réaumur (°Ré)" value={format(results.reaumur)} />
      <InfoRow label="Rømer (°Rø)" value={format(results.romer)} />
    </div>
  );
}