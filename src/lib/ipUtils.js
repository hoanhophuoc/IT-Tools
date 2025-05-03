export function isValidIpv4(ip) {
  if (!ip || typeof ip !== "string") return false;
  const cleanIp = ip.trim();
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(cleanIp);
}
export function ipv4ToInt(ip) {
  if (!isValidIpv4(ip)) {
    return null;
  }
  return (
    ip
      .split(".")
      .reduce((res, octet) => (res << 8) | parseInt(octet, 10), 0) >>> 0
  );
}
export function intToIpv4(intValue) {
  if (isNaN(intValue) || intValue < 0 || intValue > 0xffffffff) return "";
  return `${intValue >>> 24}.${(intValue >> 16) & 255}.${(intValue >> 8) & 255}.${intValue & 255}`;
}
export function ipv4ToIpv6(ip, shortFormat = false) {
  if (!isValidIpv4(ip)) {
    return "";
  }
  const parts = ip.split(".").map((part) => parseInt(part, 10));
  const hexPart1 = ((parts[0] << 8) | parts[1]).toString(16).padStart(4, "0");
  const hexPart2 = ((parts[2] << 8) | parts[3]).toString(16).padStart(4, "0");
  if (shortFormat) {
    return `::ffff:${hexPart1}:${hexPart2}`;
  } else {
    return `0000:0000:0000:0000:0000:ffff:${hexPart1}:${hexPart2}`;
  }
}
export function convertBase(value, fromBase, toBase) {
  if (value === null || value === undefined || value === "") return "";
  try {
    const decimalValue = parseInt(String(value), fromBase);
    if (isNaN(decimalValue)) {
      throw new Error("Input is not a valid number in the specified base.");
    }
    return decimalValue.toString(toBase);
  } catch (e) {
    return "Invalid input";
  }
}
export function calculateCidrFromRange(startIp, endIp) {
  if (!isValidIpv4(startIp) || !isValidIpv4(endIp)) {
    return null;
  }
  const startInt = ipv4ToInt(startIp);
  const endInt = ipv4ToInt(endIp);
  if (startInt === null || endInt === null || startInt > endInt) {
    return null;
  }
  const startBin = startInt.toString(2).padStart(32, "0");
  const endBin = endInt.toString(2).padStart(32, "0");
  const oldSize = endInt - startInt + 1;
  let mask = 32;
  for (let i = 0; i < 32; i++) {
    if (startBin[i] !== endBin[i]) {
      mask = i;
      break;
    }
  }
  const networkBin = startBin.substring(0, mask) + "0".repeat(32 - mask);
  const networkInt = parseInt(networkBin, 2);
  const newStartIp = intToIpv4(networkInt);
  const broadcastBin = startBin.substring(0, mask) + "1".repeat(32 - mask);
  const broadcastInt = parseInt(broadcastBin, 2);
  const newEndIp = intToIpv4(broadcastInt);
  const newSize = Math.pow(2, 32 - mask);
  const newCidr = `${newStartIp}/${mask}`;
  return {
    oldSize: oldSize,
    newStart: newStartIp,
    newEnd: newEndIp,
    newCidr: newCidr,
    newSize: newSize,
  };
}
