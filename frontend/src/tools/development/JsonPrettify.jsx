"use client";
import { useState, useMemo } from "react";
import TextArea from "@/components/ui/TextArea";
import Input from "@/components/ui/Input";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";
import Button from "@/components/ui/Button";

function sortObject(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  } else if (obj && typeof obj === "object" && obj.constructor === Object) {
    return Object.fromEntries(
      Object.keys(obj).sort().map((key) => [key, sortObject(obj[key])])
    );
  }
  return obj;
}

export default function JsonPrettify() {
  const [input, setInput] = useState('{"hello": "world", "foo": "bar"}');
  const [indent, setIndent] = useState(2);
  const [sort, setSort] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input || indent === 0 || indent === "") {
      return { output: "", error: "" };
    }
    try {
      const obj = JSON.parse(input);
      const pretty = JSON.stringify(
        sort ? sortObject(obj) : obj,
        null,
        indent,
      );
      return { output: pretty, error: "" };
    } catch {
      return { output: "", error: "Invalid JSON format" };
    }
  }, [input, indent, sort]);

  return (
    <div className="space-y-4">
      <TextArea
        label="JSON Input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste or type your JSON here"
        rows={8}
      />

      <div className="flex flex-col items-center gap-4">
        <Input
          type="number"
          min={0}
          max={16}
          label="Indent size"
          value={indent}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              setIndent("");
            } else {
              setIndent(Math.max(1, Math.min(10, Number(val))));
            }
          }}
        />
        <div className="flex gap-4 self-start">
          <Button type="button" onClick={() => setSort((s) => !s)}>
            {sort ? "Sorted" : "Sort keys"}
          </Button>
          <CopyToClipboardButton
            textToCopy={output}
            buttonText="Copy"
            disabled={!output}
          />
        </div>
      </div>

      <div className="relative">
        <TextArea
          label="Prettified JSON"
          value={output}
          readOnly
          rows={8}
          placeholder={error || "Result will appear here"}
        />
      </div>
    </div>
  );
}
