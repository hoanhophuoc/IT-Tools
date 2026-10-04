export const isValidMacFormat = (mac) => {
  if (!mac || typeof mac !== "string") return false;
  const macRegex =
    /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$|^([0-9A-Fa-f]{12})$/;
  return macRegex.test(mac.trim());
};

export const formatVendorInfo = (infoString) => {
  if (!infoString || typeof infoString !== "string") {
    return [{ id: "unknown", text: "Unknown vendor for this address" }];
  }
  return infoString
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text, i) => ({ id: `${i}-${text}`, text }));
};
