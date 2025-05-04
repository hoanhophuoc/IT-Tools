"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import InfoRow from "@/components/ui/InfoRow";

function toCamelCase(str) {
  return str
    .replace(/[-_\s.]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^(.)/, (m) => m.toLowerCase());
}
function toPascalCase(str) {
  return str
    .replace(/[-_\s.]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^(.)/, (m) => m.toUpperCase());
}
function toConstantCase(str) {
  return str.replace(/[\s\-\.]+/g, "_").replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();
}
function toDotCase(str) {
  return str
    .replace(/[\s_\-]+/g, ".")
    .replace(/([a-z])([A-Z])/g, "$1.$2")
    .toLowerCase();
}
function toHeaderCase(str) {
  return str
    .replace(/[\s_\-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, "-");
}
function toParamCase(str) {
  return str
    .replace(/[\s_\.]+/g, "-")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
}
function toPathCase(str) {
  return str
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1/$2") 
    .replace(/[\s_\.]+/g, "/")
    .replace(/([a-z])([A-Z])/g, "$1/$2")
    .toLowerCase();
}
function toSentenceCase(str) {
  const s = str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_\-\.]+/g, " ")
    .toLowerCase()
    .trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function toSnakeCase(str) {
  return str
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2") 
    .replace(/[\s\-\.]+/g, "_")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase();
}
function toMockingCase(str) {
  return str
    .split("")
    .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
    .join("");
}
function toCapitalCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_\-\.]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export default function CaseConverter() {
  const [input, setInput] = useState("");

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
      <InfoRow label="Camelcase" value={toCamelCase(input)} />
      <InfoRow label="Capitalcase" value={toCapitalCase(input)} />
      <InfoRow label="Constantcase" value={toConstantCase(input)} />
      <InfoRow label="Dotcase" value={toDotCase(input)} />
      <InfoRow label="Headercase" value={toHeaderCase(input)} />
      <InfoRow label="Paramcase" value={toParamCase(input)} />
      <InfoRow label="Pascalcase" value={toPascalCase(input)} />
      <InfoRow label="Pathcase" value={toPathCase(input)} />
      <InfoRow label="Sentencecase" value={toSentenceCase(input)} />
      <InfoRow label="Snakecase" value={toSnakeCase(input)} />
      <InfoRow label="Mockingcase" value={toMockingCase(input)} />
    </div>
  );
}