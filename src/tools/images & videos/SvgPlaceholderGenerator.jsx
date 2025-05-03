// src/tools/images/SvgPlaceholderGenerator.jsx
"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea"; // For displaying SVG code
import Button from "@/components/ui/Button";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";
import { FiDownload, FiCopy } from "react-icons/fi";
import Switch from "@/components/ui/Switch"; // Assuming you have a Switch component
import { utf8ToBase64 } from "@/lib/utils"; // Import Base64 helper

export default function SvgPlaceholderGenerator() {
  // --- State ---
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(350);
  const [fontSize, setFontSize] = useState(26);
  const [bgColor, setBgColor] = useState("#cccccc");
  const [fgColor, setFgColor] = useState("#333333");
  const [useExactSize, setUseExactSize] = useState(true);
  const [customText, setCustomText] = useState("");

  const downloadLinkRef = useRef(null);

  // --- Input Handlers ---
  const handleNumberChange = (setter) => (e) => {
    const value = parseInt(e.target.value, 10);
    setter(isNaN(value) || value < 1 ? 1 : value); // Ensure positive integer
  };
  const handleColorChange = (setter) => (e) => {
    let value = e.target.value;
    if (e.target.type === "text") {
      if (!value.startsWith("#")) {
        value = "#" + value;
      }
      value = "#" + value.substring(1).replace(/[^0-9a-fA-F]/g, "");
      value = value.substring(0, 7);
    }
    setter(value);
  };
  const handleBgChange = handleColorChange(setBgColor);
  const handleFgChange = handleColorChange(setFgColor);

  // --- Generate SVG String (Memoized) ---
  const svgString = useMemo(() => {
    const w = width || 1; // Fallback to 1 if somehow invalid
    const h = height || 1;
    const text = customText.trim().length > 0 ? customText.trim() : `${w}x${h}`;
    // Escape text to prevent SVG injection issues if text contains < or >
    const escapedText = text.replace(/</g, "<").replace(/>/g, ">");
    const sizeAttrs = useExactSize ? ` width="${w}" height="${h}"` : "";

    // Trim() removes leading/trailing whitespace which can invalidate SVG XML
    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"${sizeAttrs}>
<rect width="${w}" height="${h}" fill="${bgColor}"></rect>
<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="${fontSize}px" fill="${fgColor}">${escapedText}</text>
</svg>`.trim();
  }, [width, height, fontSize, bgColor, fgColor, useExactSize, customText]);

  // --- Generate Base64 (Memoized) ---
  const base64Svg = useMemo(() => {
    if (!svgString) return "";
    return `data:image/svg+xml;base64,${utf8ToBase64(svgString)}`;
  }, [svgString]); // Depends only on the generated svgString

  // --- Download Handler ---
  const handleDownload = useCallback(() => {
    if (!base64Svg || !downloadLinkRef.current) return;
    const link = downloadLinkRef.current;
    link.href = base64Svg;
    // Generate filename based on dimensions/text
    const textPart =
      customText.trim().length > 0
        ? customText.trim().toLowerCase().replace(/\s+/g, "-")
        : "";
    const filename = `placeholder-${textPart || width + "x" + height}.svg`;
    link.download = filename;
    link.click();
  }, [base64Svg, width, height, customText]); // Add dependencies

  return (
    <div className="space-y-6">
      {/* --- Input Form --- */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
        {/* Width & Background */}
        <Input
          label="Width (px):"
          type="number"
          id="width"
          value={width}
          onChange={handleNumberChange(setWidth)}
          min="1"
        />
        <div>
          <label
            htmlFor="bgColor"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Background:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="bgColorPicker"
              value={bgColor}
              onChange={handleBgChange}
              className="h-10 w-10 ..."
            />
            <Input
              id="bgColor"
              value={bgColor}
              onChange={handleBgChange}
              maxLength={7}
              className="font-mono"
            />
          </div>
        </div>

        {/* Height & Text Color */}
        <Input
          label="Height (px):"
          type="number"
          id="height"
          value={height}
          onChange={handleNumberChange(setHeight)}
          min="1"
        />
        <div>
          <label
            htmlFor="fgColor"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Text Color:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="fgColorPicker"
              value={fgColor}
              onChange={handleFgChange}
              className="h-10 w-10 ..."
            />
            <Input
              id="fgColor"
              value={fgColor}
              onChange={handleFgChange}
              maxLength={7}
              className="font-mono"
            />
          </div>
        </div>

        {/* Font Size & Custom Text */}
        <Input
          label="Font Size (px):"
          type="number"
          id="fontSize"
          value={fontSize}
          onChange={handleNumberChange(setFontSize)}
          min="1"
        />
        <Input
          label="Custom Text:"
          id="customText"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder={`Default: ${width}x${height}`}
        />

        {/* Use Exact Size Toggle */}
        <div className="flex items-center pt-5 sm:justify-start sm:pt-0">
          {" "}
          <Switch
            id="useExactSize"
            checked={useExactSize}
            onChange={setUseExactSize} // Pass the state setter function
            label="Use exact size attributes?" // Pass the label text
          />
        </div>
      </div>

      {/* --- Output Areas --- */}
      <div className="space-y-4">
        {/* SVG HTML Output */}
        <div>
          <label
            htmlFor="svgOutput"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            SVG HTML element:
          </label>
          <div className="relative">
            <TextArea
              id="svgOutput"
              value={svgString}
              readOnly
              rows={6}
              className="bg-gray-100 pr-10 font-mono dark:bg-gray-700" // Add padding for button
            />
            <div className="absolute top-2 right-2">
              <CopyToClipboardButton
                textToCopy={svgString}
                size="sm"
                variant="secondary"
                title="Copy SVG Code"
              />
            </div>
          </div>
        </div>

        {/* Base64 Output */}
        <div>
          <label
            htmlFor="base64Output"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            SVG in Base64:
          </label>
          <div className="relative">
            <TextArea
              id="base64Output"
              value={base64Svg}
              readOnly
              rows={4}
              className="bg-gray-100 pr-10 font-mono break-all dark:bg-gray-700" // Added break-all
            />
            <div className="absolute top-2 right-2">
              <CopyToClipboardButton
                textToCopy={base64Svg}
                size="sm"
                variant="secondary"
                title="Copy Base64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- Action Buttons --- */}
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopyToClipboardButton textToCopy={svgString} buttonText="Copy SVG" />
        <CopyToClipboardButton
          textToCopy={base64Svg}
          buttonText="Copy Base64"
        />
        {/* Hidden link for download */}
        <a ref={downloadLinkRef} style={{ display: "none" }}>
          Hidden Download
        </a>
        <Button onClick={handleDownload} disabled={!base64Svg}>
          <FiDownload className="mr-1.5" /> Download SVG
        </Button>
      </div>

      {/* --- Preview --- */}
      <div className="mt-6 border-t border-gray-300 pt-6 dark:border-gray-700">
        <h4 className="mb-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
          Preview:
        </h4>
        <div className="flex justify-center">
          {/* Render the SVG using the base64 string for preview */}
          {base64Svg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={base64Svg}
              alt="SVG Placeholder Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                border: "1px dashed #ccc",
              }} // Limit preview size
            />
          ) : (
            <div className="flex h-[100px] w-full items-center justify-center rounded border border-dashed border-gray-400 text-gray-500">
              Configure options to generate preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
