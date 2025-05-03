// src/tools/web/HtmlEntitiesEncoder.jsx
"use client"; // Needs state and browser DOM manipulation for unescape

import { useState, useEffect } from "react";
import TextArea from "@/components/ui/TextArea";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton"; // Import reusable button

// --- Helper Functions ---
// Escape basic HTML entities
const escapeHtmlEntities = (str) => {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

// Unescape HTML entities using DOM manipulation (safer for broader range)
const unescapeHtmlEntities = (str) => {
  if (!str) return "";
  // Check if running in a browser environment
  if (typeof window === "undefined" || typeof document === "undefined") {
    console.warn("Cannot unescape HTML entities on the server.");
    return str; // Return original string if not in browser
  }
  try {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  } catch (e) {
    console.error("Error unescaping HTML:", e);
    return str; // Return original on error
  }
};
// ----------------------

export default function HtmlEntitiesEncoder() {
  // State for Escape section
  const [escapeInput, setEscapeInput] = useState("<title>IT Tool</title>");
  // Calculate output directly - useMemo might be overkill here unless input is huge
  const escapeOutput = escapeHtmlEntities(escapeInput);

  // State for Unescape section
  const [unescapeInput, setUnescapeInput] = useState("<title>IT Tool</title>");
  const [unescapeOutput, setUnescapeOutput] = useState(""); // Calculate initially/on change
  const [unescapeError, setUnescapeError] = useState("");

  // Calculate unescaped output when input changes or on mount
  useEffect(() => {
    setUnescapeError("");
    try {
      setUnescapeOutput(unescapeHtmlEntities(unescapeInput));
    } catch (e) {
      setUnescapeError("Failed to unescape string.");
      setUnescapeOutput("");
    }
  }, [unescapeInput]); // Re-run when unescapeInput changes

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Escape Card */}
      <div className="space-y-4 rounded-md border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-slate-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Escape HTML Entities
        </h3>
        <TextArea
          label="Your string:"
          id="escapeInput"
          value={escapeInput}
          onChange={(e) => setEscapeInput(e.target.value)}
          placeholder="Enter HTML or text to escape"
          rows={4}
        />
        <TextArea
          label="Your string escaped:"
          id="escapeOutput"
          value={escapeOutput}
          readOnly
          placeholder="Escaped string"
          rows={4}
          className="bg-gray-100 font-mono dark:bg-gray-700" // Monospace font often good for code/entities
        />
        <div className="flex justify-center pt-2">
          <CopyToClipboardButton textToCopy={escapeOutput} />
        </div>
      </div>

      {/* Unescape Card */}
      <div className="space-y-4 rounded-md border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-slate-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Unescape HTML Entities
        </h3>
        <TextArea
          label="Your escaped string:"
          id="unescapeInput"
          value={unescapeInput}
          onChange={(e) => setUnescapeInput(e.target.value)}
          placeholder="Enter HTML entities (e.g., <div>)"
          rows={4}
          error={unescapeError} // Show potential unescape errors
        />
        <TextArea
          label="Your string unescaped:"
          id="unescapeOutput"
          value={unescapeOutput}
          readOnly
          placeholder="Unescaped string"
          rows={4}
          className="bg-gray-100 dark:bg-gray-700"
        />
        <div className="flex justify-center pt-2">
          <CopyToClipboardButton
            textToCopy={unescapeOutput}
            disabled={!!unescapeError}
          />
        </div>
      </div>
    </div>
  );
}
