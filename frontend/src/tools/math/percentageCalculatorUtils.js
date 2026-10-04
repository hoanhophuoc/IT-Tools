export const formatResult = (value) => {
  if (value === "" || value === null || value === undefined || !Number.isFinite(value))
    return "";
  const rounded = Number(value.toFixed(6));
  return String(rounded);
};

export const isValidNumberInput = (value) =>
  value === "" || /^-?\d*(?:\.\d*)?$/.test(value);

export const calculatePercentOf = (xStr, yStr) => {
  const x = Number.parseFloat(xStr);
  const y = Number.parseFloat(yStr);
  if (Number.isNaN(x) || Number.isNaN(y)) return "";
  return formatResult((x / 100) * y);
};

export const calculateIsWhatPercent = (xStr, yStr) => {
  const x = Number.parseFloat(xStr);
  const y = Number.parseFloat(yStr);
  if (Number.isNaN(x) || Number.isNaN(y) || y === 0) return "";
  return formatResult((x / y) * 100);
};

export const calculatePercentChange = (fromStr, toStr) => {
  const from = Number.parseFloat(fromStr);
  const to = Number.parseFloat(toStr);
  if (Number.isNaN(from) || Number.isNaN(to) || from === 0) return "";
  return formatResult(((to - from) / from) * 100);
};
