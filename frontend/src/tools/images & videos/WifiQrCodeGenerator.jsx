"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { QRCodeCanvas } from "qrcode.react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { FiDownload, FiEye, FiEyeOff } from "react-icons/fi";
import { downloadCanvasAsPng } from "@/lib/utils";
import ColorInput from "@/components/ui/ColorInput";

const EAP_METHODS = [
  "PWD",
  "LEAP",
  "TLS",
  "TTLS",
  "PEAP",
  "SIM",
  "AKA",
  "AKA'",
];
const EAP_PHASE2_METHODS = ["None", "MSCHAPV2", "GTC", "PAP", "MSCHAP"];

function escapeWifiValue(str) {
  if (!str) return "";
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
  if (!ssid) return null;

  const escapedSSID = escapeWifiValue(ssid);
  const hidden = isHidden ? "H:true;" : "";

  switch (encryption) {
    case "nopass":
      return `WIFI:S:${escapedSSID};T:nopass;${hidden};`;
    case "WEP":
      if (!password) return null;
      return `WIFI:S:${escapedSSID};T:WEP;P:${escapeWifiValue(password)};${hidden};`;
    case "WPA":
      if (!password) return null;
      return `WIFI:S:${escapedSSID};T:WPA;P:${escapeWifiValue(password)};${hidden};`;
    case "WPA2-EAP":
      if (!eapMethod || !identity) return null;
      const eapStr = `E:${eapMethod};`;
      const identityStr = `I:${escapeWifiValue(identity)};`;
      const phase2Str =
        phase2Method && phase2Method !== "None" ? `PH2:${phase2Method};` : "";
      const passwordStr = password ? `P:${escapeWifiValue(password)};` : "";

      return `WIFI:S:${escapedSSID};T:WPA2-EAP;${eapStr}${identityStr}${phase2Str}${passwordStr}${hidden};`;
    default:
      console.warn("Unknown encryption type:", encryption);
      return null;
  }
}

export default function WifiQrCodeGenerator() {
  const [ssid, setSsid] = useState("");
  const [isHidden, setIsHidden] = useState(false);
  const [encryption, setEncryption] = useState("WPA");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [eapMethod, setEapMethod] = useState(EAP_METHODS[0]);
  const [identity, setIdentity] = useState("");
  const [phase2Method, setPhase2Method] = useState(EAP_PHASE2_METHODS[0]);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [errorLevel, setErrorLevel] = useState("M");
  const [qrSize, setQrSize] = useState(200);
  const [error, setError] = useState("");

  const qrCodeCanvasRef = useRef(null);
  const downloadLinkRef = useRef(null);

  const showEapFields = useMemo(() => encryption === "WPA2-EAP", [encryption]);
  const showPasswordField = useMemo(
    () => encryption !== "nopass",
    [encryption],
  );

  const qrCodeText = useMemo(() => {
    setError("");
    try {
      return getWifiQrCodeText({
        ssid: ssid.trim(),
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

  const handleDownload = useCallback(() => {
    downloadCanvasAsPng(qrCodeCanvasRef, downloadLinkRef, "wifi-qr-code.png");
  }, [qrCodeText]);

  const canGenerateQr = useMemo(
    () => ssid.trim().length > 0 && qrCodeText !== null,
    [ssid, qrCodeText],
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
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

          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
            <ColorInput
              label="Foreground color:"
              id="fgColor"
              value={fgColor}
              onChange={setFgColor}
            />
            <ColorInput
              label="Background color:"
              id="bgColor"
              value={bgColor}
              onChange={setBgColor}
            />
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
            {canGenerateQr ? (
              <QRCodeCanvas
                value={qrCodeText}
                size={qrSize}
                fgColor={fgColor}
                bgColor={bgColor}
                level={errorLevel}
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
