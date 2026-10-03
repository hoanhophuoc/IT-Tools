export function formatMsDuration(durationMs) {
  if (isNaN(durationMs) || durationMs < 0) {
    return "Invalid duration";
  }
  if (durationMs === 0) {
    return "0 milliseconds";
  }

  const totalMs = Math.floor(durationMs);
  const ms = totalMs % 1000;
  const totalSeconds = Math.floor(totalMs / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const days = Math.floor(totalHours / 24);

  const parts = [];
  if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
  if (seconds > 0) parts.push(`${seconds} second${seconds !== 1 ? "s" : ""}`);
  if (ms > 0) parts.push(`${ms} millisecond${ms !== 1 ? "s" : ""}`);

  return parts.length > 0 ? parts.join(" ") : "0 milliseconds";
}

export function formatDateDdMmYyyyHhMm(date) {
  if (!date || isNaN(date.getTime())) return "Invalid Date";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
