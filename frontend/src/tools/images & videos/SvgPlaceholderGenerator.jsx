"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";
import { FiDownload } from "react-icons/fi";
import Switch from "@/components/ui/Switch";
import { utf8ToBase64 } from "@/lib/utils";
import ColorInput from "@/components/ui/ColorInput";

export default function SvgPlaceholderGenerator() {
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(350);
  const [fontSize, setFontSize] = useState(26);
  const [bgColor, setBgColor] = useState("#cccccc");
  const [fgColor, setFgColor] = useState("#333333");
  const [useExactSize, setUseExactSize] = useState(true);
  const [customText, setCustomText] = useState("");

  const downloadLinkRef = useRef(null);

  const handleNumberChange = (setter) => (e) => {
    const value = parseInt(e.target.value, 10);
    setter(isNaN(value) || value < 1 ? 1 : value);
  };

  const svgString = useMemo(() => {
    const w = width || 1;
    const h = height || 1;
    const text = customText.trim().length > 0 ? customText.trim() : `${w}x${h}`;
    const escapedText = text.replace(/</g, "<").replace(/>/g, ">");
    const sizeAttrs = useExactSize ? ` width="${w}" height="${h}"` : "";

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"${sizeAttrs}>
<rect width="${w}" height="${h}" fill="${bgColor}"></rect>
<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="${fontSize}px" fill="${fgColor}">${escapedText}</text>
</svg>`.trim();
  }, [width, height, fontSize, bgColor, fgColor, useExactSize, customText]);

  const base64Svg = useMemo(() => {
    if (!svgString) return "";
    return `data:image/svg+xml;base64,${utf8ToBase64(svgString)}`;
  }, [svgString]);

  const handleDownload = useCallback(() => {
    if (!base64Svg || !downloadLinkRef.current) return;
    const link = downloadLinkRef.current;
    link.href = base64Svg;
    const textPart =
      customText.trim().length > 0
        ? customText.trim().toLowerCase().replace(/\s+/g, "-")
        : "";
    const filename = `placeholder-${textPart || width + "x" + height}.svg`;
    link.download = filename;
    link.click();
  }, [base64Svg, width, height, customText]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 md:grid-cols-3">
        <Input
          label="Width (px):"
          type="number"
          id="width"
          value={width}
          onChange={handleNumberChange(setWidth)}
          min="1"
        />
        <ColorInput
          label="Background:"
          id="bgColor"
          value={bgColor}
          onChange={setBgColor}
        />
        <Input
          label="Height (px):"
          type="number"
          id="height"
          value={height}
          onChange={handleNumberChange(setHeight)}
          min="1"
        />
        <ColorInput
          label="Text Color:"
          id="fgColor"
          value={fgColor}
          onChange={setFgColor}
        />
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

        <div className="flex items-center pt-5 sm:justify-start sm:pt-0">
          {" "}
          <Switch
            id="useExactSize"
            checked={useExactSize}
            onChange={setUseExactSize}
            label="Use exact size attributes?"
          />
        </div>
      </div>

      <div className="space-y-4">
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
              className="bg-gray-100 pr-10 font-mono dark:bg-gray-700"
            />
          </div>
        </div>

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
              className="bg-gray-100 pr-10 font-mono break-all dark:bg-gray-700"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <CopyToClipboardButton textToCopy={svgString} buttonText="Copy SVG" />
        <CopyToClipboardButton
          textToCopy={base64Svg}
          buttonText="Copy Base64"
        />
        <a ref={downloadLinkRef} style={{ display: "none" }}>
          Hidden Download
        </a>
        <Button onClick={handleDownload} disabled={!base64Svg}>
          <FiDownload className="mr-1.5" /> Download SVG
        </Button>
      </div>

      <div className="mt-6 border-t border-gray-300 pt-6 dark:border-gray-700">
        <h4 className="mb-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
          Preview:
        </h4>
        <div className="flex justify-center">
          {base64Svg ? (
            <img
              src={base64Svg}
              alt="SVG Placeholder Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                border: "1px dashed #ccc",
              }}
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
