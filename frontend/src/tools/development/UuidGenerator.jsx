"use client";

import { useState, useCallback, useEffect } from "react";
import Button from "@/components/ui/Button";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";

function generateUUIDv4() {
  return crypto.randomUUID();
}

function generateUUIDv7() {
  const now = Date.now();
  const timeHex = now.toString(16).padStart(12, "0");
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(10)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${timeHex.slice(0, 8)}-${timeHex.slice(8, 12)}-7${rand.slice(0, 3)}-${((parseInt(rand.slice(3, 4), 16) & 0x3) | 0x8).toString(16)}${rand.slice(4, 7)}-${rand.slice(7, 19)}`;
}

export default function UuidGenerator() {
  const [version, setVersion] = useState("v4");
  const [quantity, setQuantity] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [uuids, setUuids] = useState([]);

  const generate = useCallback(() => {
    const result = [];
    const count = Math.min(Math.max(1, parseInt(quantity) || 1), 50);

    for (let i = 0; i < count; i++) {
      let id = version === "v7" ? generateUUIDv7() : generateUUIDv4();
      if (!hyphens) {
        id = id.replace(/-/g, "");
      }
      if (uppercase) {
        id = id.toUpperCase();
      }
      result.push(id);
    }
    setUuids(result);
  }, [version, quantity, uppercase, hyphens]);

  useEffect(() => {
    generate();
  }, [generate]);

  const allUuidsText = uuids.join("\n");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            UUID Version
          </label>
          <select
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="v4">Version 4 (Random)</option>
            <option value="v7">Version 7 (Timestamp + Random)</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Quantity (1-50)
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-4 pt-6">
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600"
            />
            Uppercase
          </label>
          <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={hyphens}
              onChange={(e) => setHyphens(e.target.checked)}
              className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600"
            />
            Hyphens
          </label>
        </div>

        <div className="flex items-end">
          <Button onClick={generate} variant="primary" className="w-full">
            Regenerate
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Generated UUIDs ({uuids.length})
          </span>
          <CopyToClipboardButton text={allUuidsText} />
        </div>

        <div className="space-y-2">
          {uuids.map((id) => (
            <div
              key={id}
              className="flex items-center justify-between rounded bg-white p-2.5 font-mono text-sm shadow-sm dark:bg-gray-900"
            >
              <span className="truncate select-all text-gray-800 dark:text-gray-200">
                {id}
              </span>
              <CopyToClipboardButton text={id} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
