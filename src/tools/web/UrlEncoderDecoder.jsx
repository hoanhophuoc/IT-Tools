// src/tools/web/UrlEncoderDecoder.jsx
"use client"; // Required for state and event handlers

import { useState, useCallback } from "react";
import TextArea from "@/components/ui/TextArea"; // Use the TextArea component
import Button from "@/components/ui/Button";
import { FiCopy } from "react-icons/fi"; // Icon for copy button

export default function UrlEncoderDecoder() {
  // State for Encoder
  const [encodeInput, setEncodeInput] = useState("Hello world :)");
  const [encodeOutput, setEncodeOutput] = useState("");
  const [encodeError, setEncodeError] = useState("");
  const [encodeCopied, setEncodeCopied] = useState(false);

  // State for Decoder
  const [decodeInput, setDecodeInput] = useState("Hello%20world%20%3A%29");
  const [decodeOutput, setDecodeOutput] = useState("");
  const [decodeError, setDecodeError] = useState("");
  const [decodeCopied, setDecodeCopied] = useState(false);

  // --- Encoding Logic ---
  const handleEncodeInputChange = (e) => {
    const value = e.target.value;
    setEncodeInput(value);
    setEncodeError(""); // Clear previous errors
    try {
      setEncodeOutput(encodeURIComponent(value));
    } catch (err) {
      // This usually shouldn't happen with encodeURIComponent unless very strange input
      console.error("Encoding error:", err);
      setEncodeError("Failed to encode this string.");
      setEncodeOutput("");
    }
  };

  // --- Decoding Logic ---
  const handleDecodeInputChange = (e) => {
    const value = e.target.value;
    setDecodeInput(value);
    setDecodeError(""); // Clear previous errors
    try {
      // decodeURIComponent throws an error for invalid sequences
      setDecodeOutput(decodeURIComponent(value));
    } catch (err) {
      console.error("Decoding error:", err);
      setDecodeError("Invalid URI sequence."); // More specific error
      setDecodeOutput("");
    }
  };

  // --- Copy Logic ---
  const copyToClipboard = useCallback(async (textToCopy, setCopiedState) => {
    if (!navigator.clipboard) {
      // Fallback for older browsers or insecure contexts (http)
      alert("Clipboard API not available. Please copy manually.");
      return;
    }
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 1500); // Reset after 1.5 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
      alert("Failed to copy text to clipboard.");
    }
  }, []);

  // --- Initial Calculation (like computed properties) ---
  // Calculate initial outputs when component mounts
  useState(() => {
    try {
      setEncodeOutput(encodeURIComponent(encodeInput));
    } catch {
      setEncodeOutput("");
    }
    try {
      setDecodeOutput(decodeURIComponent(decodeInput));
    } catch {
      setDecodeOutput("");
    }
  }, []); // Empty dependency array runs once on mount

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {" "}
      {/* Grid layout */}
      {/* Encode Card */}
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
          rows={4} // Adjust rows as needed
          error={encodeError}
        />
        <TextArea
          label="Your string encoded:"
          id="encodeOutput"
          value={encodeOutput}
          readOnly // Output is read-only
          placeholder="URL-encoded string"
          rows={4}
          className="bg-gray-100 dark:bg-gray-700" // Slightly different background for output
        />
        <div className="flex justify-center">
          <Button
            onClick={() => copyToClipboard(encodeOutput, setEncodeCopied)}
            disabled={!encodeOutput}
            variant="secondary"
            size="sm"
          >
            <FiCopy className="mr-1.5" /> {encodeCopied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>
      {/* Decode Card */}
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
        <div className="flex justify-center">
          <Button
            onClick={() => copyToClipboard(decodeOutput, setDecodeCopied)}
            disabled={!decodeOutput}
            variant="secondary"
            size="sm"
          >
            <FiCopy className="mr-1.5" /> {decodeCopied ? "Copied!" : "Copy"}
          </Button>
        </div>
      </div>
    </div>
  );
}
