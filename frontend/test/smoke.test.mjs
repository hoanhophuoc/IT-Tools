import test from "node:test";
import assert from "node:assert/strict";
import { isValidIpv4, ipv4ToInt, intToIpv4, calculateCidrFromRange } from "../src/lib/ipUtils.js";
import { utf8ToBase64, base64ToUtf8 } from "../src/lib/utils.js";
import { formatMsDuration } from "../src/lib/dateUtils.js";

test("ipUtils", () => {
  assert.equal(isValidIpv4("192.168.1.1"), true);
  assert.equal(isValidIpv4("999.1.1.1"), false);
  assert.equal(intToIpv4(ipv4ToInt("10.0.0.1")), "10.0.0.1");
  const cidr = calculateCidrFromRange("192.168.1.0", "192.168.1.255");
  assert.equal(cidr.newCidr, "192.168.1.0/24");
});

test("utils base64", () => {
  assert.equal(base64ToUtf8(utf8ToBase64("hello world")), "hello world");
  assert.equal(base64ToUtf8(utf8ToBase64("hello world", true)), "hello world");
});

test("dateUtils duration", () => {
  assert.equal(formatMsDuration(1000), "1 second");
  assert.equal(formatMsDuration(0), "0 milliseconds");
});
