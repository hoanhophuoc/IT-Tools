export function escapeWifiValue(str) {
  if (!str) return "";
  return str.replace(/([\\;,":])/g, "\\$1");
}
