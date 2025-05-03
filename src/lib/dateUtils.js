import {
  formatDuration as formatDurationFns,
  intervalToDuration,
} from "date-fns";

export function formatMsDuration(durationMs) {
  if (isNaN(durationMs) || durationMs < 0) {
    return "Invalid duration";
  }
  if (durationMs === 0) {
    return "0 milliseconds";
  }
  const duration = intervalToDuration({
    start: 0,
    end: Math.max(0, Math.floor(durationMs)),
  });
  const ms = Math.floor(durationMs % 1000);
  const formatted = formatDurationFns(duration, {
    format: ["days", "hours", "minutes", "seconds"],
    zero: false,
  });
  const msString = ms > 0 ? `${ms} millisecond${ms !== 1 ? "s" : ""}` : "";
  const parts = [formatted, msString].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "0 milliseconds";
}
