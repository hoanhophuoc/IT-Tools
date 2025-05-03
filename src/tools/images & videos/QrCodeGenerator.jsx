// src/tools/images/QrCodeGenerator.jsx
"use client";

import { useState, useCallback, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Button from "@/components/ui/Button";
import { FiDownload } from "react-icons/fi";

const errorCorrectionOptions = [
  { value: "L", label: "Low" },
  { value: "M", label: "Medium" },
  { value: "Q", label: "Quartile" },
  { value: "H", label: "High" },
];

export default function QrCodeGenerator() {
  const [text, setText] = useState("https://it-tools.tech");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [errorLevel, setErrorLevel] = useState("M");
  const [qrSize, setQrSize] = useState(200);
  const [error, setError] = useState("");

  const qrCodeCanvasRef = useRef(null);
  const downloadLinkRef = useRef(null);

  const handleTextChange = (e) => {
    setText(e.target.value);
    setError("");
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
    setError("");
  };
  const handleFgChange = handleColorChange(setFgColor);
  const handleBgChange = handleColorChange(setBgColor);

  const handleErrorLevelChange = (e) => {
    setErrorLevel(e.target.value);
    setError("");
  };

  const handleDownload = useCallback(() => {
    const canvas = qrCodeCanvasRef.current?.querySelector("canvas");
    const link = downloadLinkRef.current;

    if (canvas && link) {
      try {
        const pngUrl = canvas
          .toDataURL("image/png")
          .replace("image/png", "image/octet-stream");
        link.href = pngUrl;
        link.click();
      } catch (err) {
        console.error("Failed to create data URL from canvas:", err);
        setError("Could not prepare QR code for download.");
        alert("Error: Could not prepare QR code for download.");
      }
    } else {
      console.error("Canvas or download link ref not found.");
      setError("Download failed: QR code element not ready.");
      alert("Error: Download failed.");
    }
  }, []);

  const hasValidText = text.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <TextArea
            label="Text or URL:"
            id="qrText"
            value={text}
            onChange={handleTextChange}
            placeholder="Enter text or URL to encode..."
            rows={4}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="fgColor"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Foreground color:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="fgColorPicker"
                  aria-label="Foreground color picker"
                  value={fgColor}
                  onChange={handleFgChange}
                  className="h-10 w-10 shrink-0 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                />
                <Input
                  id="fgColor"
                  name="fgColor"
                  value={fgColor}
                  onChange={handleFgChange}
                  placeholder="#000000"
                  maxLength={7}
                  className="font-mono"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="bgColor"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Background color:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="bgColorPicker"
                  aria-label="Background color picker"
                  value={bgColor}
                  onChange={handleBgChange}
                  className="h-10 w-10 shrink-0 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                />
                <Input
                  id="bgColor"
                  name="bgColor"
                  value={bgColor}
                  onChange={handleBgChange}
                  placeholder="#FFFFFF"
                  maxLength={7}
                  className="font-mono"
                />
              </div>
            </div>
          </div>
          <div>
            <label
              htmlFor="errorLevel"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Error resistance:
            </label>
            <select
              id="errorLevel"
              name="errorLevel"
              value={errorLevel}
              onChange={handleErrorLevelChange}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-400"
            >
              {errorCorrectionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.value})
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}
        </div>
        <div className="flex flex-col items-center justify-start gap-4 lg:col-span-1">
          <div
            ref={qrCodeCanvasRef}
            className="inline-block rounded-md border border-gray-300 bg-white p-2 dark:border-gray-600"
          >
            {hasValidText ? (
              <QRCodeCanvas
                value={text.trim()}
                size={qrSize}
                fgColor={fgColor}
                bgColor={bgColor}
                level={errorLevel}
              />
            ) : (
              <div
                style={{ width: qrSize, height: qrSize }}
                className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400"
              >
                Enter text to generate QR code
              </div>
            )}
          </div>
          <a
            ref={downloadLinkRef}
            download="qr-code.png"
            style={{ display: "none" }}
          >
            Download Link
          </a>
          <Button onClick={handleDownload} disabled={!hasValidText || !!error}>
            <FiDownload className="mr-1.5" /> Download QR Code
          </Button>
        </div>
      </div>
    </div>
  );
}
