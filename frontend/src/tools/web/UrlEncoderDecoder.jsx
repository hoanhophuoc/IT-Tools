"use client";

import { useState, useEffect } from "react";
import TextArea from "@/components/ui/TextArea";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";

export default function UrlEncoderDecoder() {
  const [encodeInput, setEncodeInput] = useState("Hello world :)");
  const [encodeOutput, setEncodeOutput] = useState("");
  const [encodeError, setEncodeError] = useState("");

  const [decodeInput, setDecodeInput] = useState("Hello%20world%20%3A%29");
  const [decodeOutput, setDecodeOutput] = useState("");
  const [decodeError, setDecodeError] = useState("");

  const handleEncodeInputChange = (e) => {
    const value = e.target.value;
    setEncodeInput(value);
    setEncodeError("");
    try {
      setEncodeOutput(encodeURIComponent(value));
    } catch (err) {
      console.error("Encoding error:", err);
      setEncodeError("Failed to encode this string.");
      setEncodeOutput("");
    }
  };

  const handleDecodeInputChange = (e) => {
    const value = e.target.value;
    setDecodeInput(value);
    setDecodeError("");
    try {
      setDecodeOutput(decodeURIComponent(value));
    } catch (err) {
      console.error("Decoding error:", err);
      setDecodeError("Invalid URI sequence.");
      setDecodeOutput("");
    }
  };

  useEffect(() => {
    try {
      setEncodeOutput(encodeURIComponent("Hello world :)"));
    } catch {
      setEncodeOutput("");
    }
    try {
      setDecodeOutput(decodeURIComponent("Hello%20world%20%3A%29"));
    } catch {
      setDecodeOutput("");
    }
  }, []);

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
          onChange={handleEncodeInputChange}
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
          onChange={handleDecodeInputChange}
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
