"use client";
import { useState, useEffect } from "react";
import InfoRow from "@/components/ui/InfoRow";
import TextArea from "@/components/ui/TextArea";

const exampleJson = `{
\t"hello": [
\t\t"world"
\t]
}`;

export default function JsonMinify() {
  const [input, setInput] = useState(exampleJson);
  const [minified, setMinified] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const obj = JSON.parse(input);
      setMinified(JSON.stringify(obj));
      setError("");
    } catch (err) {
      setMinified("");
      setError("Invalid JSON format");
    }
  }, [input]);

  const handleInput = (e) => {
    setInput(e.target.value);
  };

  return (
    <div className="space-y-4">
      <TextArea
        label="JSON Input"
        value={input}
        onChange={handleInput}
        placeholder='Paste or type your JSON here'
        rows={8}
      />
      <InfoRow
        label="Minified JSON"
        value={minified}
        placeholder={error || "Result will appear here"}
      />
    </div>
  );
}