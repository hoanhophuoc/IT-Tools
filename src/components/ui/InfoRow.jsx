// src/components/ui/InfoRow.jsx
"use client";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";

// Renders a label, a value (often in a read-only input style), and a copy button
export default function InfoRow({ label, value, placeholder = "N/A" }) {
  const displayValue =
    value === undefined || value === null || value === ""
      ? placeholder
      : String(value);

  return (
    <div className="flex items-center gap-2 overflow-hidden rounded-md border border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/50">
      {" "}
      {/* Use overflow-hidden to contain focus ring */}
      <label className="flex-shrink-0 basis-[200px] border-r border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 dark:border-gray-600 dark:text-gray-400">
        {label}
      </label>
      <span className="flex-grow truncate px-3 py-2 font-mono text-sm text-gray-900 dark:text-gray-100">
        {" "}
        {/* Monospace font, truncate long values */}
        {displayValue}
      </span>
      <div className="flex-shrink-0 border-l border-gray-300 dark:border-gray-600">
        {" "}
        {/* Container for button ensures border */}
        <CopyToClipboardButton
          textToCopy={displayValue === placeholder ? "" : displayValue} // Don't copy placeholder
          disabled={displayValue === placeholder}
          variant="secondary"
          size="sm"
          className="h-full rounded-l-none border-0 focus:ring-offset-0" // Remove button border/rounding to merge with row
          buttonText="" // No text, just icon
          copiedText=""
        />
      </div>
    </div>
  );
}
