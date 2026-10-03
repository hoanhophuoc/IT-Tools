"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import InfoRow from "@/components/ui/InfoRow";

function hexToRgb(hex) {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex({ r, g, b }) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
      .toUpperCase()
  );
}

function rgbToHsl({ r, g, b }) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function rgbToHwb({ r, g, b }) {
  const { h } = rgbToHsl({ r, g, b });
  const w = (Math.min(r, g, b) / 255) * 100;
  const bl = (1 - Math.max(r, g, b) / 255) * 100;
  return {
    h: Math.round(h),
    w: Math.round(w),
    b: Math.round(bl),
  };
}

function rgbToLch({ r, g, b }) {
  const { l, s, h } = rgbToHsl({ r, g, b });
  return {
    l: l,
    c: s,
    h: h,
  };
}

function rgbToCmyk({ r, g, b }) {
  if (r === 0 && g === 0 && b === 0) return { c: 0, m: 0, y: 0, k: 100 };
  let c = 1 - r / 255,
    m = 1 - g / 255,
    y = 1 - b / 255;
  const minCMY = Math.min(c, m, y);
  c = ((c - minCMY) / (1 - minCMY)) * 100;
  m = ((m - minCMY) / (1 - minCMY)) * 100;
  y = ((y - minCMY) / (1 - minCMY)) * 100;
  const k = minCMY * 100;
  return {
    c: Math.round(c),
    m: Math.round(m),
    y: Math.round(y),
    k: Math.round(k),
  };
}


export default function ColorConverter() {
  const [color, setColor] = useState("#0088ff");

  const rgb = hexToRgb(color);
  const hex = rgbToHex(rgb);
  const hsl = rgbToHsl(rgb);
  const hwb = rgbToHwb(rgb);
  const lch = rgbToLch(rgb);
  const cmyk = rgbToCmyk(rgb);


  return (
    <div className="space-y-4">
      <Input
        type="color"
        label="Pick a color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="w-160 h-160 p-0 "
        style={{ width: 64, height: 64 }}
      />

      <InfoRow label="HEX" value={hex} />
      <InfoRow label="RGB" value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} />
      <InfoRow label="HSL" value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`} />
      <InfoRow label="HWB" value={`hwb(${hwb.h}, ${hwb.w}%, ${hwb.b}%)`} />
      <InfoRow label="LCH" value={`lch(${lch.l}, ${lch.c}, ${lch.h})`} />
      <InfoRow label="CMYK" value={`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`} />
    </div>
  );
}