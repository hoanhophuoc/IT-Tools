// src/tools/web/SlugifyString.jsx
"use client";

import { useState, useMemo } from "react"; // useMemo for derived state
import TextArea from "@/components/ui/TextArea"; // Reusable TextArea
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton"; // Reusable Button
import slugify from "slugify"; // Import the slugify utility function

export default function SlugifyString() {
  // State for the input string
  const [inputString, setInputString] = useState(""); // Start with empty string

  // Calculate the slug whenever the input string changes
  // useMemo prevents recalculating if inputString hasn't changed
  const generatedSlug = useMemo(() => {
    // Add basic error handling for the slugify function itself if needed
    try {
      return slugify(inputString);
    } catch (error) {
      console.error("Slugify error:", error);
      return "Error generating slug"; // Placeholder on error
    }
  }, [inputString]); // Dependency: recalculate only when inputString changes

  const handleInputChange = (e) => {
    setInputString(e.target.value);
  };

  return (
    <div className="space-y-6">
      {" "}
      {/* Add spacing between elements */}
      <TextArea
        label="Your string to slugify:"
        id="inputString"
        value={inputString}
        onChange={handleInputChange}
        placeholder="Put your string here (ex: My File Path!)"
        rows={5} // Slightly more rows for input
        autoFocus // Automatically focus this input on load
      />
      <TextArea
        label="Your slug:"
        id="outputSlug"
        value={generatedSlug}
        readOnly
        placeholder="Your slug will be generated here (ex: my-file-path)"
        rows={5}
        className="bg-gray-100 font-mono dark:bg-gray-700" // Monospace, different background
      />
      <div className="flex justify-center pt-2">
        <CopyToClipboardButton
          textToCopy={generatedSlug}
          disabled={!generatedSlug || generatedSlug === "Error generating slug"} // Disable if empty or error
          buttonText="Copy Slug" // Custom button text
        />
      </div>
    </div>
  );
}
