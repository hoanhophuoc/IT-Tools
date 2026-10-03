"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import InfoRow from "@/components/ui/InfoRow";

const getWords = (str) =>
  str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

const cap = (w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : "");

export default function CaseConverter() {
  const [input, setInput] = useState("");
  const words = getWords(input);

  const camel = words.map((w, i) => (i ? cap(w) : w.toLowerCase())).join("");
  const pascal = words.map(cap).join("");
  const capital = words.map(cap).join(" ");
  const constant = words.map((w) => w.toUpperCase()).join("_");
  const dot = words.map((w) => w.toLowerCase()).join(".");
  const header = words.map(cap).join("-");
  const param = words.map((w) => w.toLowerCase()).join("-");
  const path = words.map((w) => w.toLowerCase()).join("/");
  const sentence = words.map((w) => w.toLowerCase()).join(" ");
  const sentenceCase = sentence ? sentence[0].toUpperCase() + sentence.slice(1) : "";
  const snake = words.map((w) => w.toLowerCase()).join("_");
  const mocking = input
    .split("")
    .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
    .join("");

  return (
    <div className="space-y-4">
      <Input
        label="Input String"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your text here"
      />

      <InfoRow label="Lowercase" value={input.toLowerCase()} />
      <InfoRow label="Uppercase" value={input.toUpperCase()} />
      <InfoRow label="Camelcase" value={camel} />
      <InfoRow label="Capitalcase" value={capital} />
      <InfoRow label="Constantcase" value={constant} />
      <InfoRow label="Dotcase" value={dot} />
      <InfoRow label="Headercase" value={header} />
      <InfoRow label="Paramcase" value={param} />
      <InfoRow label="Pascalcase" value={pascal} />
      <InfoRow label="Pathcase" value={path} />
      <InfoRow label="Sentencecase" value={sentenceCase} />
      <InfoRow label="Snakecase" value={snake} />
      <InfoRow label="Mockingcase" value={mocking} />
    </div>
  );
}