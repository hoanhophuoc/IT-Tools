// src/components/ui/Select.jsx
"use client"; // If using internal state or specific event handlers

import React from "react";

// Props:
// - label (optional): Text label for the select input
// - id (optional): HTML id for the select and label association
// - name (optional): HTML name attribute
// - options: Array of { value: string | number, label: string } objects
// - value: The currently selected value (for controlled component)
// - onChange: Function to call when the value changes (for controlled component)
// - placeholder (optional): Text for the default disabled option
// - required (optional): boolean
// - disabled (optional): boolean
// - error (optional): string - error message to display
// - className (optional): Additional classes for the select element
// - containerClassName (optional): Additional classes for the wrapping div
const Select = React.forwardRef(
  (
    {
      label,
      id,
      name,
      options = [], // Default to empty array
      value, // Controlled value
      onChange, // Controlled change handler
      placeholder = "-- Select --", // Default placeholder text
      required = false,
      disabled = false,
      error,
      className = "",
      containerClassName = "",
      ...props // Pass rest of the props to the select element
    },
    ref,
  ) => {
    const selectId =
      id || name || `select-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            name={name}
            ref={ref}
            value={value} // Bind to controlled value prop
            onChange={onChange} // Use controlled onChange prop
            required={required}
            disabled={disabled}
            className={`block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-400 ${disabled ? "cursor-not-allowed opacity-60" : ""} ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""} ${className}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : undefined}
            {...props}
          >
            {/* Optional Placeholder */}
            {placeholder && (
              <option value="" disabled={required}>
                {placeholder}
              </option>
            )}

            {/* Map options */}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Dropdown Arrow Styling */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
            <svg
              className="h-5 w-5 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        {error && (
          <p
            id={`${selectId}-error`}
            className="mt-1 text-xs text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
export default Select;
