const UNITS = [
  [86400000, "day"],
  [3600000, "hour"],
  [60000, "minute"],
  [1000, "second"],
  [1, "millisecond"],
];

export function formatMsDuration(ms) {
  if (isNaN(ms) || ms < 0) return "Invalid duration";
  if (ms === 0) return "0 milliseconds";
  let rem = Math.floor(ms);
  const parts = [];
  for (const [dur, unit] of UNITS) {
    const val = Math.floor(rem / dur);
    if (val > 0) {
      parts.push(`${val} ${unit}${val !== 1 ? "s" : ""}`);
      rem %= dur;
    }
  }
  return parts.join(" ") || "0 milliseconds";
}

const dtFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatDateDdMmYyyyHhMm(date) {
  if (!date || isNaN(date.getTime())) return "Invalid Date";
  return dtFormatter.format(date).replace(",", "");
}
