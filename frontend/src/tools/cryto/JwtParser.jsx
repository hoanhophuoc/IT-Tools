"use client";

import { useState, useMemo } from "react";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";
import Button from "@/components/ui/Button";
import { base64ToUtf8 } from "@/lib/utils";

export default function JwtParser() {
  const [token, setToken] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxODAwMDAwMDAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  );

  const parsed = useMemo(() => {
    if (!token.trim()) return null;

    const parts = token.trim().split(".");
    if (parts.length !== 3) {
      return { error: "A valid JWT must contain 3 parts separated by dots (header.payload.signature)." };
    }

    try {
      const headerStr = base64ToUtf8(parts[0]);
      const payloadStr = base64ToUtf8(parts[1]);

      const header = JSON.parse(headerStr);
      const payload = JSON.parse(payloadStr);

      let isExpired = null;
      let expDateStr = null;

      if (payload && payload.exp) {
        const expMs = payload.exp * 1000;
        const expDate = new Date(expMs);
        expDateStr = expDate.toLocaleString();
        isExpired = Date.now() > expMs;
      }

      return {
        header,
        payload,
        signature: parts[2],
        isExpired,
        expDateStr,
        error: null,
      };
    } catch (err) {
      return { error: `Failed to decode JWT: ${err.message}` };
    }
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="jwt-token"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Encoded JWT Token
          </label>
          <Button variant="secondary" onClick={() => setToken("")}>
            Clear
          </Button>
        </div>
        <textarea
          id="jwt-token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          rows={4}
          placeholder="Paste your Bearer / JWT token here..."
          className="w-full rounded-md border border-gray-300 bg-white p-3 font-mono text-sm shadow-sm focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {parsed?.error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
          {parsed.error}
        </div>
      )}

      {parsed && !parsed.error && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Header */}
          <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-red-600 dark:text-red-400">
                HEADER: Algorithm & Token Type
              </span>
              <CopyToClipboardButton text={JSON.stringify(parsed.header, null, 2)} />
            </div>
            <pre className="overflow-x-auto rounded bg-white p-3 font-mono text-xs text-gray-800 shadow-sm dark:bg-gray-900 dark:text-gray-200">
              {JSON.stringify(parsed.header, null, 2)}
            </pre>
          </div>

          {/* Payload */}
          <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  PAYLOAD: Data & Claims
                </span>
                {parsed.isExpired !== null && (
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      parsed.isExpired
                        ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                        : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                    }`}
                  >
                    {parsed.isExpired ? "Expired" : "Active"}
                  </span>
                )}
              </div>
              <CopyToClipboardButton text={JSON.stringify(parsed.payload, null, 2)} />
            </div>

            {parsed.expDateStr && (
              <p className="text-xs text-gray-500">
                Expires at: <span className="font-medium">{parsed.expDateStr}</span>
              </p>
            )}

            <pre className="overflow-x-auto rounded bg-white p-3 font-mono text-xs text-gray-800 shadow-sm dark:bg-gray-900 dark:text-gray-200">
              {JSON.stringify(parsed.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
