export { formatDate } from "./dateUtils.js";

export const utf8ToBase64 = (str, urlSafe = false) => {
  if (!str) return "";
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    let b64 = btoa(binary);
    if (urlSafe) {
      b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/={1,2}$/, "");
    }
    return b64;
  } catch (e) {
    console.error("Base64 encoding failed:", e);
    return "";
  }
};

export const base64ToUtf8 = (b64) => {
  if (!b64) return "";
  let normalized = b64.replace(/-/g, "+").replace(/_/g, "/");
  while (normalized.length % 4) {
    normalized += "=";
  }
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Document is undefined"));
      return;
    }
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve(src);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.setAttribute("data-dynamic-script", "true");
    script.onload = () => resolve(src);
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
}

export function downloadCanvasAsPng(canvasRef, filename = "download.png") {
  const canvas = canvasRef?.current?.querySelector
    ? canvasRef.current.querySelector("canvas")
    : canvasRef?.current || canvasRef;
  if (!canvas) return false;
  try {
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = filename;
    a.click();
    return true;
  } catch (err) {
    console.error("Failed to create data URL from canvas:", err);
    return false;
  }
}
