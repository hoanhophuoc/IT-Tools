// src/tools/web/SlugifyString.jsx
"use client";

import { useState, useMemo } from "react";
import TextArea from "@/components/ui/TextArea";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";
import slugify from "slugify";

export default function SlugifyString() {
  const [inputString, setInputString] = useState("");

  const generatedSlug = useMemo(() => {
    try {
      return slugify(inputString);
    } catch (error) {
      console.error("Slugify error:", error);
      return "Error generating slug";
    }
  }, [inputString]);

  const handleInputChange = (e) => {
    setInputString(e.target.value);
  };

  return (
    <div className="space-y-6">
      <TextArea
        label="Your string to slugify:"
        id="inputString"
        value={inputString}
        onChange={handleInputChange}
        placeholder="Put your string here (ex: My File Path!)"
        rows={5}
        autoFocus
      />
      <TextArea
        label="Your slug:"
        id="outputSlug"
        value={generatedSlug}
        readOnly
        placeholder="Your slug will be generated here (ex: my-file-path)"
        rows={5}
        className="bg-gray-100 font-mono dark:bg-gray-700"
      />
      <div className="flex justify-center pt-2">
        <CopyToClipboardButton
          textToCopy={generatedSlug}
          disabled={!generatedSlug || generatedSlug === "Error generating slug"}
          buttonText="Copy Slug"
        />
      </div>
    </div>
  );
}
