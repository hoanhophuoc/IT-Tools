"use client";

import { useState, useEffect, useMemo } from "react";
import Input from "@/components/ui/Input";
import { loadScript } from "@/lib/utils";

const strengthLabel = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
const strengthColor = ["#dc2626", "#f97316", "#eab308", "#22c55e", "#16a34a"];

const getCharsetSize = (pwd) => {
  let size = 0;
  if (/[a-z]/.test(pwd)) size += 26;
  if (/[A-Z]/.test(pwd)) size += 26;
  if (/[0-9]/.test(pwd)) size += 10;
  if (/[^a-zA-Z0-9]/.test(pwd)) size += 32;
  return size;
};

const calculateEntropy = (length, charsetSize) => {
  if (length === 0 || charsetSize === 0) return "0.00";
  return (length * Math.log2(charsetSize)).toFixed(2);
};

export default function PasswordStrengthAnalyser() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadScript("https://cdn.jsdelivr.net/npm/zxcvbn@4.4.2/dist/zxcvbn.js")
      .then(() => setIsLoaded(true))
      .catch((e) => setError(e.message));
  }, []);

  const analysis = useMemo(() => {
    const length = password.length;
    const charsetSize = getCharsetSize(password);
    const entropy = calculateEntropy(length, charsetSize);

    let score = 0;
    if (isLoaded && typeof window !== "undefined" && window.zxcvbn && password) {
      score = window.zxcvbn(password).score;
    }

    return { length, charsetSize, entropy, score };
  }, [password, isLoaded]);

  return (
    <div className="max-w-md space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="relative">
        <Input
          label="Password Strength Analyser"
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute top-7 right-2 rounded bg-gray-600 px-2 py-1 text-white text-xs"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <div className="space-y-1 rounded-lg border-gray-600 bg-gray-700 p-3 text-sm text-white">
        <div>
          <span>Password Length:</span>{" "}
          <span style={{ color: strengthColor[analysis.score] }}>
            {analysis.length}
          </span>
        </div>
        <div>
          <span>Character Set Size:</span>{" "}
          <span style={{ color: strengthColor[analysis.score] }}>
            {analysis.charsetSize}
          </span>
        </div>
        <div>
          <span>Entropy:</span>{" "}
          <span style={{ color: strengthColor[analysis.score] }}>
            {analysis.entropy} bits
          </span>
        </div>
        <div>
          <span>Strength:</span>{" "}
          <span style={{ color: strengthColor[analysis.score] }}>
            {strengthLabel[analysis.score]}
          </span>
        </div>
      </div>
    </div>
  );
}
