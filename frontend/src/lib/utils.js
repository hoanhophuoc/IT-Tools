export const formatDate = (dateInput, options = {}) => {
  if (!dateInput) return "";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    const defaultOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      ...options,
    };
    return new Intl.DateTimeFormat("en-US", defaultOptions).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

export const utf8ToBase64 = (str) => {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    try {
      return window.btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
      console.error("Base64 encoding failed:", e);
      try {
        return window.btoa(str);
      } catch {
        return "";
      }
    }
  } else {
    try {
      return Buffer.from(str, "utf-8").toString("base64");
    } catch {
      return "";
    }
  }
};

export function handleHexColorChange(setter) {
  return (e) => {
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
}

export function downloadCanvasAsPng(
  canvasRef,
  linkRef,
  filename = "download.png",
) {
  const canvas = canvasRef?.current?.querySelector
    ? canvasRef.current.querySelector("canvas")
    : canvasRef?.current || canvasRef;
  const link = linkRef?.current || linkRef;
  if (canvas && link) {
    try {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      link.href = pngUrl;
      link.download = filename;
      link.click();
      return true;
    } catch (err) {
      console.error("Failed to create data URL from canvas:", err);
      return false;
    }
  }
  return false;
}
