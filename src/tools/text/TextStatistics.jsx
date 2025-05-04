"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";

export default function TextStatistics() {
  const [input, setInput] = useState("");

  const charCount = input.length;
  const wordCount = input.trim() === "" ? 0 : input.trim().split(/\s+/).length;
  const lineCount = input === "" ? 0 : input.split(/\r\n|\r|\n/).length;
  const byteSize = new TextEncoder().encode(input).length;

  return (
    <div className="space-y-4">
      <TextArea
        label="Text Input"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Enter your text here"
        rows={6}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Input label="Character count" value={charCount} readOnly />
        <Input label="Word count" value={wordCount} readOnly />
        <Input label="Line count" value={lineCount} readOnly />
        <Input label="Byte size" value={byteSize} readOnly />
      </div>
    </div>
  );
}