"use client";

import { useState, useMemo } from "react";
import TextArea from "@/components/ui/TextArea";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";

function slugify(text) {
  if (!text) return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function SlugifyString() {
  const [inputString, setInputString] = useState("");

  const generatedSlug = useMemo(() => {
    return slugify(inputString);
  }, [inputString]);

  return (
    <div className="space-y-6">
      <TextArea
        label="Your string to slugify:"
        id="inputString"
        value={inputString}
        onChange={(e) => setInputString(e.target.value)}
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
          disabled={!generatedSlug}
          buttonText="Copy Slug"
        />
      </div>
    </div>
  );
}
