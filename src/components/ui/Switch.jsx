"use client"; // Needs to handle onClick

import { useState } from "react";

// Props:
// - checked: boolean - whether the switch is on/off
// - onChange: function(newCheckedState) - called when the switch is toggled
// - label (optional): string - text label displayed next to the switch
// - id (optional): string - id for the button and label association
// - disabled (optional): boolean - disables the switch
// - srLabel (optional): string - screen reader label if visible label isn't sufficient
export default function Switch({
  checked,
  onChange,
  label,
  id,
  disabled = false,
  srLabel, // Screen reader label
}) {
  const switchId = id || `switch-${Math.random().toString(36).substring(2, 9)}`; // Generate random ID if none provided
  const screenReaderLabel = srLabel || label || "Toggle"; // Use provided labels or default

  const handleToggle = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div
      className={`flex items-center ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      onClick={handleToggle}
    >
      <button
        type="button"
        id={switchId}
        disabled={disabled}
        className={`${
          checked ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-800`}
        role="switch"
        aria-checked={checked}
        aria-label={screenReaderLabel} // Use aria-label for accessibility
      >
        {/* Optional: Add screen reader text inside the button if needed, but aria-label is often sufficient */}
        {/* <span className="sr-only">{screenReaderLabel}</span> */}
        <span
          aria-hidden="true"
          className={`${
            checked ? "translate-x-5" : "translate-x-0"
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
      {/* Optional Label */}
      {label && (
        <label
          htmlFor={switchId}
          className={`ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 ${disabled ? "" : "cursor-pointer"}`}
        >
          {label}
        </label>
      )}
    </div>
  );
}
