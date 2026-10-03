"use client";

import { useState, useMemo } from "react";
import Button from "@/components/ui/Button";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";

function utf8ToBase64(str, urlSafe = false) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  let b64 = btoa(binary);
  if (urlSafe) {
    b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return b64;
}

function base64ToUtf8(b64) {
  let normalized = b64.replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4) {
    normalized += "=";
  }
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export default function Base64StringConverter() {
  const [input, setInput] = useState("Hello, IT-Tools!");
  const [mode, setMode] = useState("encode"); // encode | decode
  const [urlSafe, setUrlSafe] = useState(false);
  const [error, setError] = useState("");

  const output = useMemo(() => {
    setError("");
    if (!input) return "";

    try {
      if (mode === "encode") {
        return utf8ToBase64(input, urlSafe);
      } else {
        return base64ToUtf8(input);
      }
    } catch (err) {
      setError(
        mode === "decode"
          ? "Invalid Base64 input string."
          : `Encoding error: ${err.message}`,
      );
      return "";
    }
  }, [input, mode, urlSafe]);

  const handleSwap = () => {
    if (output && !error) {
      setInput(output);
      setMode(mode === "encode" ? "decode" : "encode");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="flex gap-2">
          <Button
            variant={mode === "encode" ? "primary" : "secondary"}
            onClick={() => setMode("encode")}
          >
            Encode
          </Button>
          <Button
            variant={mode === "decode" ? "primary" : "secondary"}
            onClick={() => setMode("decode")}
          >
            Decode
          </Button>
          <Button variant="secondary" onClick={handleSwap} disabled={!output || !!error}>
            ⇄ Swap
          </Button>
        </div>

        <div className="flex items-center gap-4">
          {mode === "encode" && (
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={urlSafe}
                onChange={(e) => setUrlSafe(e.target.checked)}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600"
              />
              URL-Safe Base64 (- and _)
            </label>
          )}
          <Button variant="secondary" onClick={() => setInput("")}>
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {mode === "encode" ? "Plain Text Input" : "Base64 Input"}
            </label>
            <span className="text-xs text-gray-500">{input.length} chars</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            placeholder={
              mode === "encode"
                ? "Enter plain text to encode..."
                : "Enter Base64 string to decode..."
            }
            className="w-full rounded-md border border-gray-300 bg-white p-3 font-mono text-sm shadow-sm focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {mode === "encode" ? "Base64 Output" : "Plain Text Output"}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{output.length} chars</span>
              <CopyToClipboardButton text={output} />
            </div>
          </div>
          {error ? (
            <div className="flex h-48 items-center justify-center rounded-md border border-red-300 bg-red-50 p-4 text-center text-sm text-red-600 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
              {error}
            </div>
          ) : (
            <textarea
              readOnly
              value={output}
              rows={8}
              className="w-full rounded-md border border-gray-200 bg-gray-50 p-3 font-mono text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            />
          )}
        </div>
      </div>
    </div>
  );
}
