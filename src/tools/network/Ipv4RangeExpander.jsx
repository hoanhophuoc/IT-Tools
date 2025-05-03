"use client";

import { useState, useMemo } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";
import { isValidIpv4, calculateCidrFromRange } from "@/lib/ipUtils";
import { FiRepeat } from "react-icons/fi";

const ResultRow = ({ label, oldValue, newValue }) => (
  <tr className="border-b border-gray-200 dark:border-gray-700">
    <td className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400">
      {label}
    </td>
    <td className="px-4 py-2 font-mono text-sm text-gray-800 dark:text-gray-200">
      {oldValue ?? <span className="opacity-50">N/A</span>}
    </td>
    <td className="px-4 py-2 font-mono text-sm text-gray-800 dark:text-gray-200">
      {newValue ? (
        <div className="flex items-center justify-between">
          <span>{newValue}</span>
          <CopyToClipboardButton
            textToCopy={newValue}
            size="sm"
            variant="ghost"
            buttonText=""
            title={`Copy ${label}`}
          />
        </div>
      ) : (
        <span className="opacity-50">N/A</span>
      )}
    </td>
  </tr>
);

export default function Ipv4RangeExpander() {
  const [startIp, setStartIp] = useState("192.168.1.11");
  const [endIp, setEndIp] = useState("192.168.6.251");
  const [startIpError, setStartIpError] = useState("");
  const [endIpError, setEndIpError] = useState("");
  const [calculationError, setCalculationError] = useState("");

  const { result, isValidInput } = useMemo(() => {
    const isStartValid = isValidIpv4(startIp);
    const isEndValid = isValidIpv4(endIp);
    let calcError = "";

    setStartIpError(startIp && !isStartValid ? "Invalid IPv4 format" : "");
    setEndIpError(endIp && !isEndValid ? "Invalid IPv4 format" : "");

    if (isStartValid && isEndValid) {
      const calculationResult = calculateCidrFromRange(startIp, endIp);
      if (calculationResult === null) {
        calcError = "End address cannot be lower than start address.";
        setCalculationError(calcError);
        return { result: null, isValidInput: false };
      }
      setCalculationError("");
      return { result: calculationResult, isValidInput: true };
    }

    setCalculationError("");
    return { result: null, isValidInput: false };
  }, [startIp, endIp]);

  const handleSwap = () => {
    setStartIp(endIp);
    setEndIp(startIp);
  };

  const calculatedValues = [
    {
      label: "Start address",
      key: "startIp",
      getOldValue: () => startIp,
      getNewValue: (res) => res?.newStart,
    },
    {
      label: "End address",
      key: "endIp",
      getOldValue: () => endIp,
      getNewValue: (res) => res?.newEnd,
    },
    {
      label: "Addresses in range",
      key: "size",
      getOldValue: (res) => res?.oldSize?.toLocaleString(),
      getNewValue: (res) => res?.newSize?.toLocaleString(),
    },
    {
      label: "CIDR",
      key: "cidr",
      getOldValue: () => "",
      getNewValue: (res) => res?.newCidr,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Start address"
          id="startIp"
          value={startIp}
          onChange={(e) => setStartIp(e.target.value)}
          placeholder="Start IPv4 address..."
          error={startIpError}
          className={`font-mono ${startIpError ? "border-red-500 ..." : ""}`}
        />
        <Input
          label="End address"
          id="endIp"
          value={endIp}
          onChange={(e) => setEndIp(e.target.value)}
          placeholder="End IPv4 address..."
          error={endIpError}
          className={`font-mono ${endIpError ? "border-red-500 ..." : ""}`}
        />
      </div>

      {calculationError && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-600/50 dark:bg-red-900/30 dark:text-red-300">
          <p className="font-medium">Invalid Range:</p>
          <p className="text-sm">{calculationError}</p>
          <Button
            onClick={handleSwap}
            variant="secondary"
            size="sm"
            className="mt-2"
          >
            <FiRepeat className="mr-1.5" /> Switch Start and End
          </Button>
        </div>
      )}

      {isValidInput && result && !calculationError && (
        <div className="overflow-hidden rounded-md border border-gray-200 shadow-sm dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th
                  scope="col"
                  className="w-[150px] px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                >
                   
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                >
                  Old Value
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400"
                >
                  Expanded Value (Smallest CIDR)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800/50">
              {calculatedValues.map((item) => (
                <ResultRow
                  key={item.key}
                  label={item.label}
                  oldValue={item.getOldValue(result)}
                  newValue={item.getNewValue(result)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
