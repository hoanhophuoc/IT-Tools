"use client";

import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";

const strengthLabel = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
const strengthColor = ["#dc2626", "#f97316", "#eab308", "#22c55e", "#16a34a"];

export default function PasswordStrengthAnalyser() {
  const [password, setPassword] = useState("");
  const [analysis, setAnalysis] = useState({
    length: 0,
    charsetSize: 0,
    entropy: "0.00",
    score: 0,
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.setAttribute("data-dynamic-script", "true");

      script.onload = () => {
        console.log(`Script loaded successfully: ${src}`);
        resolve(src);
      };

      script.onerror = () => {
        console.error(`Failed to load script: ${src}`);
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.body.appendChild(script);
    });
  };

  const calculateEntropy = (length, charsetSize) => {
    return (length * Math.log2(charsetSize)).toFixed(2);
  };

  const getCharsetSize = (password) => {
    let size = 0;
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if (hasLower || hasUpper) size += 26;
    if (hasUpper && hasLower) size += 0;
    if (hasDigit) size += 10;
    if (hasSpecial) size += 32;

    return size;
  };

  useEffect(() => {
    const loadScripts = async () => {
      try {
        await loadScript(
          "https://cdn.jsdelivr.net/npm/zxcvbn@4.4.2/dist/zxcvbn.js",
        );
      } catch (e) {
        setError(e.message);
      }
    };

    loadScripts();

    return () => {
      const scripts = document.querySelectorAll(
        'script[data-dynamic-script="true"]',
      );
      scripts.forEach((s) => document.body.removeChild(s));
    };
  }, []);

  useEffect(() => {
    if (window.zxcvbn) {
      const result = password ? window.zxcvbn(password) : { score: 0 };
      const length = password.length;
      const charsetSize = getCharsetSize(password);
      const entropy = calculateEntropy(length, charsetSize);

      setAnalysis({
        length,
        charsetSize,
        entropy,
        score: result.score,
      });
    }
  }, [password]);

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
          className="absolute top-7 right-2 rounded bg-gray-600 px-2 py-1 text-white"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <div className="space-y-1 rounded-lg border-gray-600 bg-gray-700 p-3 text-sm">
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
