export const SCALES = [
  { label: "Bit (b)", value: "bit", factor: 1 },
  { label: "Byte (B)", value: "byte", factor: 8 },
  { label: "Kilobyte (KB)", value: "kilobyte", factor: 8 * 1024 },
  { label: "Megabyte (MB)", value: "megabyte", factor: 8 * 1024 * 1024 },
  { label: "Gigabyte (GB)", value: "gigabyte", factor: 8 * 1024 * 1024 * 1024 },
  { label: "Terabyte (TB)", value: "terabyte", factor: 8 * 1024 * 1024 * 1024 * 1024 },
  { label: "Petabyte (PB)", value: "petabyte", factor: 8 * 1024 * 1024 * 1024 * 1024 * 1024 },
  { label: "Exabyte (EB)", value: "exabyte", factor: 8 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 },
  { label: "Zettabyte (ZB)", value: "zettabyte", factor: 8 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 },
  { label: "Yottabyte (YB)", value: "yottabyte", factor: 8 * 1024 * 1024 * 1024 * 1024 * 1024 * 1024 },
];

export function toBits(value, scale) {
  const scaleObj = SCALES.find((s) => s.value === scale);
  if (!scaleObj) return Number.NaN;
  return Number.parseFloat(value) * scaleObj.factor;
}

export function fromBits(bits) {
  const result = {};
  SCALES.forEach((s) => {
    result[s.value] = bits / s.factor;
  });
  return result;
}

export function format(val) {
  if (typeof val !== "number" || !Number.isFinite(val)) return "";
  if (Math.abs(val) >= 1 && Math.abs(val) < 1000)
    return val.toFixed(2).replace(/\.00$/, "");
  if (Math.abs(val) < 1) return val.toPrecision(3);
  return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
