"use client";

import { useState } from "react";
import TextArea from "@/components/ui/TextArea";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";

const HTML_ENTITIES = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
  "&copy;": "©",
  "&reg;": "®",
  "&trade;": "™",
  "&cent;": "¢",
  "&pound;": "£",
  "&yen;": "¥",
  "&euro;": "€",
  "&sect;": "§",
  "&deg;": "°",
  "&plusmn;": "±",
  "&times;": "×",
  "&divide;": "÷",
  "&micro;": "µ",
  "&para;": "¶",
  "&middot;": "·",
};

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
  return str.replace(/&(?:[a-zA-Z]+|#\d+|#[xX][0-9a-fA-F]+);/g, (match) => {
    if (HTML_ENTITIES[match]) return HTML_ENTITIES[match];
    if (match.startsWith("&#x") || match.startsWith("&#X")) {
      const code = Number.parseInt(match.slice(3, -1), 16);
      return Number.isFinite(code) && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    if (match.startsWith("&#")) {
      const code = Number.parseInt(match.slice(2, -1), 10);
      return Number.isFinite(code) && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return match;
  });
};

export default function HtmlEntitiesEncoder() {
  const [escapeInput, setEscapeInput] = useState("<title>IT Tool</title>");
  const escapeOutput = escapeHtmlEntities(escapeInput);

  const [unescapeInput, setUnescapeInput] = useState("&lt;title&gt;IT Tool&lt;/title&gt;");
  const unescapeOutput = unescapeHtmlEntities(unescapeInput);

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
          placeholder="Enter HTML entities (e.g., &lt;div&gt;)"
          rows={4}
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
            disabled={!unescapeOutput}
          />
        </div>
      </div>
    </div>
  );
}
