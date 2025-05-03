// src/tools/images/WifiQrCodeGenerator.jsx
"use client"; // Required for state, refs, effects, event handlers

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { QRCodeCanvas } from "qrcode.react"; // Import the primary component
import Input from "@/components/ui/Input";
// Removed TextArea import as SSID uses Input now
// import TextArea from '@/components/ui/TextArea';
import Button from "@/components/ui/Button";
import { FiDownload, FiEye, FiEyeOff } from "react-icons/fi";
import Spinner from "@/components/ui/Spinner"; // Assuming Spinner component exists

// --- Constants (defined within the component file) ---
const WIFI_ENCRYPTION_TYPES = ["nopass", "WEP", "WPA", "WPA2-EAP"]; // WPA covers WPA/WPA2 Personal
const EAP_METHODS = [
  "PWD",
  "LEAP",
  "TLS",
  "TTLS",
  "PEAP",
  "SIM",
  "AKA",
  "AKA'",
  // Add others if commonly needed
];
const EAP_PHASE2_METHODS = ["None", "MSCHAPV2", "GTC", "PAP", "MSCHAP"];
const ERROR_CORRECTION_LEVELS = [
  // Use object for label/value separation
  { value: "L", label: "Low" },
  { value: "M", label: "Medium" },
  { value: "Q", label: "Quartile" },
  { value: "H", label: "High" },
];
// -----------------------------------------------------

// --- Helper Functions (defined within the component file) ---
function escapeWifiValue(str) {
  if (!str) return "";
  // Escape backslash, semicolon, comma, double quote, colon
  return str.replace(/([\\;,":])/g, "\\$1");
}

function getWifiQrCodeText(options) {
  const {
    ssid,
    password,
    encryption,
    isHidden,
    eapMethod,
    identity,
    phase2Method,
  } = options;
  if (!ssid) return null; // SSID is mandatory

  const escapedSSID = escapeWifiValue(ssid);
  const hidden = isHidden ? "H:true;" : "";

  switch (encryption) {
    case "nopass":
      return `WIFI:S:${escapedSSID};T:nopass;${hidden};`;
    case "WEP":
      if (!password) return null; // Password required
      return `WIFI:S:${escapedSSID};T:WEP;P:${escapeWifiValue(password)};${hidden};`;
    case "WPA": // Covers WPA and WPA2 Personal
      if (!password) return null; // Password required
      return `WIFI:S:${escapedSSID};T:WPA;P:${escapeWifiValue(password)};${hidden};`;
    case "WPA2-EAP":
      // Basic validation: EAP Method and Identity are usually needed
      if (!eapMethod || !identity) return null;
      const eapStr = `E:${eapMethod};`;
      const identityStr = `I:${escapeWifiValue(identity)};`;
      const phase2Str =
        phase2Method && phase2Method !== "None" ? `PH2:${phase2Method};` : "";
      const passwordStr = password ? `P:${escapeWifiValue(password)};` : ""; // Password might be optional

      return `WIFI:S:${escapedSSID};T:WPA2-EAP;${eapStr}${identityStr}${phase2Str}${passwordStr}${hidden};`;
    default:
      console.warn("Unknown encryption type:", encryption);
      return null; // Invalid encryption type
  }
}
// ---------------------------------------------------------

export default function WifiQrCodeGenerator() {
  // --- State Variables ---
  const [ssid, setSsid] = useState(""); // Input for Network Name
  const [isHidden, setIsHidden] = useState(false);
  const [encryption, setEncryption] = useState("WPA"); // Default encryption
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // EAP State
  const [eapMethod, setEapMethod] = useState(EAP_METHODS[0]); // Default EAP
  const [identity, setIdentity] = useState("");
  const [phase2Method, setPhase2Method] = useState(EAP_PHASE2_METHODS[0]); // Default Phase 2
  // QR Code Specific State
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [errorLevel, setErrorLevel] = useState("M"); // Default error correction ('M')
  const [qrSize, setQrSize] = useState(200); // Display size
  const [error, setError] = useState(""); // Error message state

  // Refs
  const qrCodeCanvasRef = useRef(null);
  const downloadLinkRef = useRef(null);

  // --- Derived State ---
  const showEapFields = useMemo(() => encryption === "WPA2-EAP", [encryption]);
  const showPasswordField = useMemo(
    () => encryption !== "nopass",
    [encryption],
  );

  // --- Generate QR Code Text (Memoized) ---
  const qrCodeText = useMemo(() => {
    setError(""); // Clear previous errors when inputs change
    try {
      return getWifiQrCodeText({
        ssid: ssid.trim(), // Trim SSID before generating
        password: showPasswordField ? password : "",
        encryption,
        isHidden,
        eapMethod,
        identity,
        phase2Method,
      });
    } catch (err) {
      console.error("Error generating Wi-Fi string:", err);
      setError("Error preparing QR code data.");
      return null;
    }
  }, [
    ssid,
    password,
    encryption,
    isHidden,
    eapMethod,
    identity,
    phase2Method,
    showPasswordField,
  ]);

  // --- Input Handlers ---
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
  const handleFgChange = handleColorChange(setFgColor);
  const handleBgChange = handleColorChange(setBgColor);
  const handleErrorLevelChange = (e) => {
    setErrorLevel(e.target.value);
  };

  // --- Download Handler ---
  const handleDownload = useCallback(() => {
    const canvas = qrCodeCanvasRef.current?.querySelector("canvas");
    const link = downloadLinkRef.current;
    if (canvas && link && qrCodeText) {
      // Check qrCodeText is valid
      try {
        const pngUrl = canvas
          .toDataURL("image/png")
          .replace("image/png", "image/octet-stream");
        link.href = pngUrl;
        link.click();
      } catch (err) {
        console.error("Canvas toDataURL error:", err);
        setError("Could not prepare QR code for download.");
        alert("Error: Could not prepare QR code for download.");
      }
    } else if (!qrCodeText) {
      setError("Cannot download: Invalid settings for QR code.");
      alert("Error: Invalid settings for QR code generation.");
    } else {
      console.error("Canvas or download link ref not found.");
      setError("Download failed: QR code element not ready.");
      alert("Error: Download failed.");
    }
  }, [qrCodeText]); // Depend on qrCodeText

  // Determine if QR code can be generated based on valid SSID and generated text
  const canGenerateQr = useMemo(
    () => ssid.trim().length > 0 && qrCodeText !== null,
    [ssid, qrCodeText],
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
        {/* Input Options Column */}
        <div className="space-y-4 lg:col-span-2">
          {/* Encryption Method */}
          <div>
            <label
              htmlFor="encryption"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Encryption method:
            </label>
            <select
              id="encryption"
              value={encryption}
              onChange={(e) => setEncryption(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-400"
            >
              <option value="nopass">No password</option>
              <option value="WPA">WPA/WPA2 Personal</option>
              <option value="WEP">WEP (Insecure)</option>
              <option value="WPA2-EAP">WPA2-EAP (Enterprise)</option>
            </select>
          </div>

          {/* SSID and Hidden Checkbox */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-grow">
              <Input
                label="SSID (Network Name):"
                id="ssid"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                placeholder="Your WiFi Network Name"
                required
              />
            </div>
            <div className="flex flex-shrink-0 items-center pb-2">
              <input
                type="checkbox"
                id="isHidden"
                checked={isHidden}
                onChange={(e) => setIsHidden(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-indigo-600 dark:focus:ring-offset-gray-800"
              />
              <label
                htmlFor="isHidden"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Hidden Network
              </label>
            </div>
          </div>

          {/* Password (conditional) */}
          {showPasswordField && (
            <div className="relative">
              <Input
                label="Password:"
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your WiFi Password"
                required={encryption === "WEP" || encryption === "WPA"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 top-6 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          )}

          {/* WPA2-EAP Specific Fields */}
          {showEapFields && (
            <div className="mt-4 space-y-4 rounded border border-gray-300 p-4 dark:border-gray-600">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-200">
                WPA2-EAP Settings
              </h4>
              <div>
                <label
                  htmlFor="eapMethod"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  EAP method:
                </label>
                <select
                  id="eapMethod"
                  value={eapMethod}
                  onChange={(e) => setEapMethod(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-400"
                >
                  {EAP_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Input
                  label="Identity:"
                  id="identity"
                  value={identity}
                  onChange={(e) => setIdentity(e.target.value)}
                  placeholder="Your EAP username/identity"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="phase2Method"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Phase 2 method:
                </label>
                <select
                  id="phase2Method"
                  value={phase2Method}
                  onChange={(e) => setPhase2Method(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-400"
                >
                  {EAP_PHASE2_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Color Pickers */}
          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
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
                  className="h-10 w-10 shrink-0 cursor-pointer appearance-none rounded border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-700"
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
                  className="h-10 w-10 shrink-0 cursor-pointer appearance-none rounded border border-gray-300 bg-white p-0.5 dark:border-gray-600 dark:bg-gray-700"
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
          {/* Error Display */}
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}
        </div>

        {/* QR Code Output Column */}
        <div className="flex flex-col items-center justify-start gap-4 lg:col-span-1">
          <div
            ref={qrCodeCanvasRef}
            className="inline-block rounded-md border border-gray-300 bg-white p-2 dark:border-gray-600"
          >
            {" "}
            {/* Container with white BG */}
            {/* Render QR code only if text is valid AND qrCodeText generated */}
            {canGenerateQr ? (
              <QRCodeCanvas
                value={qrCodeText} // Use the generated WIFI string
                size={qrSize}
                fgColor={fgColor}
                bgColor={bgColor}
                level={errorLevel} // Use state value
                includeMargin={true} // Add margin for better scanning
              />
            ) : (
              <div
                style={{ width: qrSize, height: qrSize }}
                className="flex items-center justify-center p-2 text-center text-xs text-gray-500 dark:text-gray-400"
              >
                {!ssid.trim()
                  ? "Enter SSID to generate QR code"
                  : "Cannot generate QR with current settings"}
              </div>
            )}
          </div>
          {/* Hidden link for download */}
          <a
            ref={downloadLinkRef}
            download="wifi-qr-code.png"
            style={{ display: "none" }}
          >
            Download Link
          </a>
          <Button onClick={handleDownload} disabled={!canGenerateQr || !!error}>
            <FiDownload className="mr-1.5" /> Download QR Code
          </Button>
        </div>
      </div>
    </div>
  );
}
