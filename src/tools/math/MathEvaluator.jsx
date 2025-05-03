// src/tools/math/MathEvaluator.jsx
"use client";

import { useState, useMemo } from "react";
import { evaluate } from "mathjs";
import Input from "@/components/ui/Input";

export default function MathEvaluator() {
  const [expression, setExpression] = useState("");
  const [error, setError] = useState("");

  const result = useMemo(() => {
    if (!expression.trim()) {
      setError("");
      return "";
    }
    try {
      const evalResult = evaluate(expression);

      if (typeof evalResult === "function") {
        setError("");
        return "Result is a function definition.";
      }
      if (typeof evalResult === "undefined") {
        setError("");
        return "";
      }
      setError("");
      return String(evalResult);
    } catch (err) {
      console.error("Math evaluation error:", err);
      setError(err.message || "Invalid mathematical expression.");
      return "";
    }
  }, [expression]);

  return (
    <div className="space-y-5">
      <Input
        id="mathExpression"
        label="Your math expression (e.g., 2*sqrt(6), sin(pi/4)^2):"
        value={expression}
        onChange={(e) => setExpression(e.target.value)}
        placeholder="Enter expression..."
        autoFocus
        className="font-mono text-lg"
        error={error}
      />

      {(result !== "" || (error && expression.trim())) && (
        <div className="rounded-md border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-slate-800">
          <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">
            Result
          </h3>
          {result !== "" && !error && (
            <pre className="rounded bg-gray-100 p-3 text-lg font-semibold break-all whitespace-pre-wrap text-gray-800 dark:bg-gray-700 dark:text-gray-100">
              {result}
            </pre>
          )}
          {error && expression.trim() && (
            <p className="text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
