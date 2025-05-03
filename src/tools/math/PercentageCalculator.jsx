// src/tools/math/PercentageCalculator.jsx
"use client";

import { useState, useMemo } from "react";
import Input from "@/components/ui/Input";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";

const formatResult = (value) => {
  if (value === "" || value === null || value === undefined || !isFinite(value))
    return "";
  const rounded = Number(value.toFixed(6));
  return String(rounded);
};

export default function PercentageCalculator() {
  const [percentOfX, setPercentOfX] = useState("");
  const [percentOfY, setPercentOfY] = useState("");
  const [isWhatX, setIsWhatX] = useState("");
  const [isWhatY, setIsWhatY] = useState("");
  const [incDecFrom, setIncDecFrom] = useState("");
  const [incDecTo, setIncDecTo] = useState("");

  const percentageOfResult = useMemo(() => {
    const x = parseFloat(percentOfX);
    const y = parseFloat(percentOfY);
    if (isNaN(x) || isNaN(y)) return "";
    return formatResult((x / 100) * y);
  }, [percentOfX, percentOfY]);

  const isWhatPercentResult = useMemo(() => {
    const x = parseFloat(isWhatX);
    const y = parseFloat(isWhatY);
    if (isNaN(x) || isNaN(y) || y === 0) return "";
    return formatResult((x / y) * 100);
  }, [isWhatX, isWhatY]);

  const percentChangeResult = useMemo(() => {
    const from = parseFloat(incDecFrom);
    const to = parseFloat(incDecTo);
    if (isNaN(from) || isNaN(to) || from === 0) return "";
    return formatResult(((to - from) / from) * 100);
  }, [incDecFrom, incDecTo]);

  const handleNumberChange = (setter) => (e) => {
    const value = e.target.value;
    if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-4 dark:text-gray-300">
      <div className="rounded-md bg-white p-4 shadow-sm dark:bg-slate-800">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap">
          <label htmlFor="percentageX" className="flex-shrink-0 text-sm">
            What is
          </label>
          <Input
            type="text"
            id="percentageX"
            inputMode="decimal"
            placeholder="X"
            value={percentOfX}
            onChange={handleNumberChange(setPercentOfX)}
            className="min-w-[80px] flex-1 sm:w-24"
            aria-label="Percentage value X"
          />
          <span className="flex-shrink-0 text-sm">% of</span>
          <Input
            type="text"
            id="percentageY"
            inputMode="decimal"
            placeholder="Y"
            value={percentOfY}
            onChange={handleNumberChange(setPercentOfY)}
            className="min-w-[80px] flex-1 sm:w-24"
            aria-label="Base value Y"
          />
          <Input
            type="text"
            placeholder="Result"
            value={percentageOfResult}
            readOnly
            className="min-w-[100px] flex-1 bg-gray-100 dark:bg-gray-700"
            aria-label="Percentage result"
          />
          <CopyToClipboardButton
            textToCopy={percentageOfResult}
            disabled={!percentageOfResult}
            size="sm"
            variant="secondary"
            className="flex-shrink-0"
            buttonText="Copy"
          />
        </div>
      </div>
      <div className="rounded-md bg-white p-4 shadow-sm dark:bg-slate-800">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap">
          <Input
            type="text"
            id="isWhatX"
            inputMode="decimal"
            placeholder="X"
            value={isWhatX}
            onChange={handleNumberChange(setIsWhatX)}
            className="min-w-[80px] flex-1 sm:w-24"
            aria-label="Part value X"
          />
          <span className="flex-shrink-0 text-sm">is what percent of</span>
          <Input
            type="text"
            id="isWhatY"
            inputMode="decimal"
            placeholder="Y"
            value={isWhatY}
            onChange={handleNumberChange(setIsWhatY)}
            className="min-w-[80px] flex-1 sm:w-24"
            aria-label="Total value Y"
          />
          <Input
            type="text"
            placeholder="Result"
            value={isWhatPercentResult}
            readOnly
            className="min-w-[100px] flex-1 bg-gray-100 dark:bg-gray-700"
            aria-label="Is what percent result"
          />
          <CopyToClipboardButton
            textToCopy={isWhatPercentResult}
            disabled={!isWhatPercentResult}
            size="sm"
            variant="secondary"
            className="flex-shrink-0"
            buttonText="Copy"
          />
          <span className="flex-shrink-0 text-sm">%</span>
        </div>
      </div>
      <div className="rounded-md bg-white p-4 shadow-sm dark:bg-slate-800">
        <p className="mb-3 block text-sm font-medium">
          What is the percentage increase/decrease
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:flex-nowrap">
          <label htmlFor="incDecFrom" className="flex-shrink-0 text-sm">
            From
          </label>
          <Input
            type="text"
            id="incDecFrom"
            inputMode="decimal"
            placeholder="Value"
            value={incDecFrom}
            onChange={handleNumberChange(setIncDecFrom)}
            className="min-w-[80px] flex-1 sm:w-24"
            aria-label="Starting value"
          />
          <span className="flex-shrink-0 text-sm">To</span>
          <Input
            type="text"
            id="incDecTo"
            inputMode="decimal"
            placeholder="Value"
            value={incDecTo}
            onChange={handleNumberChange(setIncDecTo)}
            className="min-w-[80px] flex-1 sm:w-24"
            aria-label="Ending value"
          />
          <Input
            type="text"
            placeholder="Result"
            value={percentChangeResult}
            readOnly
            className="min-w-[100px] flex-1 bg-gray-100 dark:bg-gray-700"
            aria-label="Percentage change result"
          />
          <CopyToClipboardButton
            textToCopy={percentChangeResult}
            disabled={!percentChangeResult}
            size="sm"
            variant="secondary"
            className="flex-shrink-0"
            buttonText="Copy"
          />
          <span className="flex-shrink-0 text-sm">%</span>
        </div>
      </div>
    </div>
  );
}
