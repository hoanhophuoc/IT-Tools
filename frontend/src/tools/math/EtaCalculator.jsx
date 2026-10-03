"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { formatMsDuration } from "@/lib/dateUtils";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

const timeSpanUnits = [
  { label: "milliseconds", value: 1 },
  { label: "seconds", value: 1000 },
  { label: "minutes", value: 1000 * 60 },
  { label: "hours", value: 1000 * 60 * 60 },
  { label: "days", value: 1000 * 60 * 60 * 24 },
];

export default function EtaCalculator() {
  const [unitCount, setUnitCount] = useState(187);
  const [startDateString, setStartDateString] = useState(() => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - tzOffset)
      .toISOString()
      .slice(0, 16);
    return localISOTime;
  });
  const [unitPerTimeSpan, setUnitPerTimeSpan] = useState(4);
  const [timeSpanValue, setTimeSpanValue] = useState(6);
  const [timeSpanUnitMultiplier, setTimeSpanUnitMultiplier] = useState(
    1000 * 60 * 60,
  );

  const [error, setError] = useState("");

  const handleNumberChange =
    (setter, allowZero = false) =>
    (e) => {
      const value = parseInt(e.target.value, 10);
      setter(
        isNaN(value) || (!allowZero && value < 1) ? (allowZero ? 0 : 1) : value,
      );
      setError("");
    };
  const handleTimeSpanUnitChange = (e) => {
    setTimeSpanUnitMultiplier(parseInt(e.target.value, 10) || 1);
    setError("");
  };
  const handleDateTimeChange = (e) => {
    setStartDateString(e.target.value);
    setError("");
  };

  const { totalDurationMs, endDate, calculationError } = useMemo(() => {
    setError("");
    const uc = unitCount || 0;
    const upms = unitPerTimeSpan || 0;
    const tsms = timeSpanValue * timeSpanUnitMultiplier || 0;
    const startTimestamp = new Date(startDateString).getTime();

    if (isNaN(startTimestamp)) {
      return {
        totalDurationMs: 0,
        endDate: null,
        calculationError: "Invalid start date/time.",
      };
    }

    if (upms <= 0 || tsms <= 0) {
      return {
        totalDurationMs: 0,
        endDate: new Date(startTimestamp),
        calculationError:
          upms <= 0
            ? "Units consumed cannot be zero or less."
            : "Time span duration cannot be zero or less.",
      };
    }

    try {
      const rateUnitsPerMs = upms / tsms;
      const durationMs = uc / rateUnitsPerMs;

      if (!isFinite(durationMs)) {
        return {
          totalDurationMs: 0,
          endDate: new Date(startTimestamp),
          calculationError: "Calculation resulted in infinity.",
        };
      }

      const endTimestamp = startTimestamp + durationMs;
      const endDateObj = new Date(endTimestamp);

      return {
        totalDurationMs: durationMs,
        endDate: endDateObj,
        calculationError: "",
      };
    } catch (err) {
      console.error("ETA Calculation Error:", err);
      return {
        totalDurationMs: 0,
        endDate: null,
        calculationError: "Calculation error.",
      };
    }
  }, [
    unitCount,
    unitPerTimeSpan,
    timeSpanValue,
    timeSpanUnitMultiplier,
    startDateString,
  ]);

  const formattedDuration = useMemo(() => {
    if (calculationError || totalDurationMs <= 0) return "N/A";
    return formatMsDuration(totalDurationMs);
  }, [totalDurationMs, calculationError]);

  const formattedEndDate = useMemo(() => {
    if (calculationError || !endDate) return "N/A";
    try {
      return format(endDate, "dd/MM/yyyy HH:mm");
    } catch {
      return "Invalid Date";
    }
  }, [endDate, calculationError]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
        <Input
          label="Amount of element to consume:"
          id="unitCount"
          type="number"
          min="1"
          value={unitCount}
          onChange={handleNumberChange(setUnitCount)}
        />
        <Input
          label="The consumption started at:"
          id="startedAt"
          type="datetime-local"
          value={startDateString}
          onChange={handleDateTimeChange}
          max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 16)}
          min="2000-01-01T00:00"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Amount of unit consumed by time span:
        </p>
        <div className="flex flex-col items-stretch gap-x-2 gap-y-3 md:flex-row md:items-end">
          <Input
            id="unitPerTimeSpan"
            type="number"
            aria-label="Units consumed"
            min="1"
            value={unitPerTimeSpan}
            onChange={handleNumberChange(setUnitPerTimeSpan)}
          />
          <span className="flex-shrink-0 px-1 text-gray-600 md:pb-2 dark:text-gray-400">
            in
          </span>
          <Input
            id="timeSpan"
            type="number"
            aria-label="Time span value"
            min="1"
            value={timeSpanValue}
            onChange={handleNumberChange(setTimeSpanValue)}
          />
          <Select
            id="timeSpanUnit"
            aria-label="Time span unit"
            value={timeSpanUnitMultiplier}
            onChange={handleTimeSpanUnitChange}
            options={timeSpanUnits}
            containerClassName="flex-grow"
          />
        </div>
      </div>

      {calculationError && (
        <p className="text-center text-sm text-red-500 dark:text-red-400">
          {calculationError}
        </p>
      )}

      {unitCount > 0 &&
        unitPerTimeSpan > 0 &&
        timeSpanValue > 0 &&
        !calculationError && (
          <>
            <hr className="border-gray-300 dark:border-gray-600" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-slate-800">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total duration
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {formattedDuration}
                </p>
              </div>
              <div className="rounded-md border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-slate-800">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  It will end
                </p>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {formattedEndDate}
                </p>
              </div>
            </div>
          </>
        )}
    </div>
  );
}
