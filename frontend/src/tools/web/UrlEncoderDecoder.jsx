"use client";

import { useState, useMemo } from "react";
import TextArea from "@/components/ui/TextArea";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";

export default function UrlEncoderDecoder() {
  const [encodeInput, setEncodeInput] = useState("Hello world :)");
  const [decodeInput, setDecodeInput] = useState("Hello%20world%20%3A%29");

  const { encodeOutput, encodeError } = useMemo(() => {
    if (!encodeInput) return { encodeOutput: "", encodeError: "" };
    try {
      return { encodeOutput: encodeURIComponent(encodeInput), encodeError: "" };
    } catch {
      return { encodeOutput: "", encodeError: "Failed to encode this string." };
    }
  }, [encodeInput]);

  const { decodeOutput, decodeError } = useMemo(() => {
    if (!decodeInput) return { decodeOutput: "", decodeError: "" };
    try {
      return { decodeOutput: decodeURIComponent(decodeInput), decodeError: "" };
    } catch {
      return { decodeOutput: "", decodeError: "Invalid URI sequence." };
    }
  }, [decodeInput]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-md border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-slate-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Encode
        </h3>
        <TextArea
          label="Your string:"
          id="encodeInput"
          value={encodeInput}
          onChange={(e) => setEncodeInput(e.target.value)}
          placeholder="The string to encode"
          rows={4}
          error={encodeError}
        />
        <TextArea
          label="Your string encoded:"
          id="encodeOutput"
          value={encodeOutput}
          readOnly
          placeholder="URL-encoded string"
          rows={4}
          className="bg-gray-100 dark:bg-gray-700"
        />
        <div className="flex justify-center pt-2">
          <CopyToClipboardButton
            textToCopy={encodeOutput}
            disabled={!encodeOutput || !!encodeError}
          />
        </div>
      </div>

      <div className="space-y-4 rounded-md border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-slate-800">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Decode
        </h3>
        <TextArea
          label="Your encoded string:"
          id="decodeInput"
          value={decodeInput}
          onChange={(e) => setDecodeInput(e.target.value)}
          placeholder="The string to decode (e.g., Hello%20world)"
          rows={4}
          error={decodeError}
        />
        <TextArea
          label="Your string decoded:"
          id="decodeOutput"
          value={decodeOutput}
          readOnly
          placeholder="Decoded string"
          rows={4}
          className="bg-gray-100 dark:bg-gray-700"
        />
        <div className="flex justify-center pt-2">
          <CopyToClipboardButton
            textToCopy={decodeOutput}
            disabled={!decodeOutput || !!decodeError}
          />
        </div>
      </div>
    </div>
  );
}
