"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";

function obfuscate(str, keepFirst, keepLast, keepSpaces) {
  if (!str) return "";
  let chars = str.split("");
  let len = chars.length;
  return chars
    .map((c, i) => {
      if (keepSpaces && c === " ") return " ";
      if (i < keepFirst || i >= len - keepLast) return c;
      return "*";
    })
    .join("");
}

export default function StringObfuscator() {
  const [input, setInput] = useState("");
  const [keepFirst, setKeepFirst] = useState(2);
  const [keepLast, setKeepLast] = useState(2);
  const [keepSpaces, setKeepSpaces] = useState(true);

  const output = obfuscate(input, keepFirst, keepLast, keepSpaces);

  return (
    <div className="space-y-4">
      <TextArea
        label="String to obfuscate"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your secret string"
        rows={3}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Input
          type="number"
          min={0}
          max={input.length}
          label="Keep first"
          value={keepFirst === 0 ? "" : keepFirst}
          onChange={(e) => {
            const val = e.target.value;
            setKeepFirst(
              val === "" ? 0 : Math.max(0, Math.min(Number(val), input.length)),
            );
          }}
        />
        <Input
          type="number"
          min={0}
          max={input.length}
          label="Keep last"
          value={keepLast === 0 ? "" : keepLast}
          onChange={(e) => {
            const val = e.target.value;
            setKeepLast(
              val === "" ? 0 : Math.max(0, Math.min(Number(val), input.length)),
            );
          }}
        />
        <div className="flex items-end gap-2">
          <label className="mb-1 font-medium">Keep spaces:</label>
          <button
            type="button"
            onClick={() => setKeepSpaces((v) => !v)}
            className={
              "rounded px-3 py-1 " +
              (keepSpaces
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200")
            }
          >
            {keepSpaces ? "Yes" : "No"}
          </button>
        </div>
      </div>
      <TextArea label="Obfuscated string" value={output} readOnly rows={3} />
      <CopyToClipboardButton textToCopy={output} buttonText="Copy" />
    </div>
  );
}
