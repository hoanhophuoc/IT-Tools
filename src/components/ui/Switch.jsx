"use client";
import React from "react";

export default function Switch({ id, checked, onChange, label, ...props }) {
  const switchId = id || `switch-${Math.random().toString(36).substring(2, 9)}`;
  const screenReaderLabel = props.srLabel || label || "Toggle";

  const handleToggle = () => {
    if (!props.disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <div
      className={`flex items-center ${props.disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      onClick={handleToggle}
    >
      <button
        type="button"
        id={switchId}
        disabled={props.disabled}
        className={`${
          checked ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
        } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-gray-800`}
        role="switch"
        aria-checked={checked}
        aria-label={screenReaderLabel}
      >
        <span
          aria-hidden="true"
          className={`${
            checked ? "translate-x-5" : "translate-x-0"
          } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
      </button>
      {label && (
        <label
          htmlFor={switchId}
          className={`ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 ${props.disabled ? "" : "cursor-pointer"}`}
        >
          {label}
        </label>
      )}
    </div>
  );
}
