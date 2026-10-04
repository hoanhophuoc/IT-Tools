export function base64ToDecimal(str) {
  try {
    const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(bin, (c) => c.charCodeAt(0))
      .reduce((acc, b) => (acc << 8n) + BigInt(b), 0n)
      .toString(10);
  } catch {
    return "";
  }
}

export function decimalToBase64(numStr) {
  try {
    let n = BigInt(numStr);
    const bytes = [];
    while (n > 0n) {
      bytes.unshift(Number(n & 255n));
      n >>= 8n;
    }
    return btoa(String.fromCharCode(...(bytes.length ? bytes : [0])));
  } catch {
    return "";
  }
}

export function convertAllBases(input, inputBase) {
  if (!input) return { 2: "", 8: "", 10: "", 16: "", 64: "" };

  const prefixMap = { 2: "0b", 8: "0o", 10: "", 16: "0x" };
  try {
    const n =
      inputBase === 64
        ? BigInt(base64ToDecimal(input))
        : BigInt(`${prefixMap[inputBase] ?? ""}${input}`);

    return {
      2: n.toString(2),
      8: n.toString(8),
      10: n.toString(10),
      16: n.toString(16).toUpperCase(),
      64: decimalToBase64(n.toString(10)),
    };
  } catch {
    return { 2: "", 8: "", 10: "", 16: "", 64: "" };
  }
}
