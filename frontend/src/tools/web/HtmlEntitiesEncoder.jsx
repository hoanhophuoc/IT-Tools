"use client";

import { useState, useEffect } from "react";
import TextArea from "@/components/ui/TextArea";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";

const escapeHtmlEntities = (str) => {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const unescapeHtmlEntities = (str) => {
  if (!str) return "";
  if (typeof window === "undefined" || typeof document === "undefined") {
    return str;
  }
  try {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  } catch (e) {
    return str;
  }
};

export default function HtmlEntitiesEncoder() {
  const [escapeInput, setEscapeInput] = useState("<title>IT Tool</title>");
  const escapeOutput = escapeHtmlEntities(escapeInput);

  const [unescapeInput, setUnescapeInput] = useState("<title>IT Tool</title>");
  const [unescapeOutput, setUnescapeOutput] = useState("");
  const [unescapeError, setUnescapeError] = useState("");

  useEffect(() => {
    setUnescapeError("");
    try {
      setUnescapeOutput(unescapeHtmlEntities(unescapeInput));
    } catch (e) {
      setUnescapeError("Failed to unescape string.");
      setUnescapeOutput("");
    }
  }, [unescapeInput]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
          className="bg-gray-100 font-mono dark:bg-gray-700"
        />
        <div className="flex justify-center pt-2">
          <CopyToClipboardButton textToCopy={escapeOutput} />
        </div>
      </div>

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
          error={unescapeError}
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
