const isDateValue = (val) => {
  if (val instanceof Date) return true;
  if (typeof val === "string" && val.length >= 10) {
    return /^\d{4}-\d{2}-\d{2}/.test(val) && !Number.isNaN(Date.parse(val));
  }
  return false;
};

export const compareValues = (a, b, direction) => {
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;

  let result = 0;

  if (typeof a === "number" && typeof b === "number") {
    result = a - b;
  } else if (typeof a === "boolean" && typeof b === "boolean") {
    result = a ? -1 : 1;
  } else if (isDateValue(a) && isDateValue(b)) {
    const aTime = a instanceof Date ? a.getTime() : Date.parse(a);
    const bTime = b instanceof Date ? b.getTime() : Date.parse(b);
    result = aTime - bTime;
  } else {
    result = String(a).localeCompare(String(b), undefined, {
      numeric: true,
      sensitivity: "base",
    });
  }

  return direction === "desc" ? -result : result;
};
