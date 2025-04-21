// src/tools/converters/ColorConverter.jsx
"use client"; // This specific tool needs client-side interaction
import { useState } from "react";
import Input from "@/components/ui/Input";

// Basic color conversion logic (needs a robust library for real use)
function hexToRgb(hex) {
  // Simplified - Doesn't handle shorthand hex, errors, etc.
  if (!hex) return null;
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r, g, b) {
  // Simplified
  if (r == null || g == null || b == null) return "";
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
}

export default function ColorConverter() {
  const [hexValue, setHexValue] = useState("#FFFFFF");
  const [rgbValue, setRgbValue] = useState({ r: 255, g: 255, b: 255 });
  const [error, setError] = useState("");

  const handleHexChange = (e) => {
    const newHex = e.target.value;
    setHexValue(newHex);
    const rgb = hexToRgb(newHex);
    if (rgb) {
      setRgbValue(rgb);
      setError("");
    } else if (newHex.length >= 3) {
      // Only show error for potentially invalid input
      setError("Invalid HEX format");
    } else {
      setError(""); // Clear error for empty or short input
    }
  };

  const handleRgbChange = (channel, value) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 0 || numValue > 255) {
      setError(`Invalid RGB value for ${channel.toUpperCase()}`);
      // Optionally revert or just keep the invalid input state
      setRgbValue((prev) => ({ ...prev, [channel]: value })); // Keep input state
      return;
    }

    const newRgb = { ...rgbValue, [channel]: numValue };
    setRgbValue(newRgb);
    setHexValue(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    setError("");
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Enter a color value in one format to see it in the other.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* HEX Input */}
        <div className="space-y-2">
          <Input
            label="HEX Color"
            id="hexColor"
            value={hexValue}
            onChange={handleHexChange}
            placeholder="#RRGGBB"
            maxLength={7}
          />
          <div
            className="h-16 w-full rounded border border-gray-300"
            style={{ backgroundColor: error ? "transparent" : hexValue }}
          ></div>
        </div>

        {/* RGB Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            RGB Color
          </label>
          <div className="flex gap-3">
            <Input
              type="number"
              id="rgbR"
              aria-label="Red value"
              value={rgbValue?.r ?? ""}
              onChange={(e) => handleRgbChange("r", e.target.value)}
              min="0"
              max="255"
              placeholder="R"
            />
            <Input
              type="number"
              id="rgbG"
              aria-label="Green value"
              value={rgbValue?.g ?? ""}
              onChange={(e) => handleRgbChange("g", e.target.value)}
              min="0"
              max="255"
              placeholder="G"
            />
            <Input
              type="number"
              id="rgbB"
              aria-label="Blue value"
              value={rgbValue?.b ?? ""}
              onChange={(e) => handleRgbChange("b", e.target.value)}
              min="0"
              max="255"
              placeholder="B"
            />
          </div>
          <div
            className="h-16 w-full rounded border border-gray-300"
            style={{
              backgroundColor: error
                ? "transparent"
                : `rgb(${rgbValue?.r ?? 0}, ${rgbValue?.g ?? 0}, ${rgbValue?.b ?? 0})`,
            }}
          ></div>
        </div>
      </div>
      {/* Add more formats (HSL, CMYK etc.) here */}
    </div>
  );
}
