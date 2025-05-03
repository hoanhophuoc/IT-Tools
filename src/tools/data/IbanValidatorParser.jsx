// src/tools/data/IbanValidatorParser.jsx
"use client";

import { useState, useMemo } from "react";
import {
  extractIBAN,
  friendlyFormatIBAN,
  isQRIBAN,
  validateIBAN,
  ValidationErrorsIBAN,
} from "ibantools";
import Input from "@/components/ui/Input";
import InfoRow from "@/components/ui/InfoRow";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";

const ibanErrorToMessage = {
  [ValidationErrorsIBAN.NoIBANProvided]: "No IBAN provided",
  [ValidationErrorsIBAN.NoIBANCountry]: "No IBAN country code found",
  [ValidationErrorsIBAN.WrongBBANLength]: "Incorrect BBAN length for country",
  [ValidationErrorsIBAN.WrongBBANFormat]: "Incorrect BBAN format for country",
  [ValidationErrorsIBAN.ChecksumNotNumber]:
    "Checksum characters are not numbers",
  [ValidationErrorsIBAN.WrongIBANChecksum]: "Invalid IBAN checksum",
  [ValidationErrorsIBAN.WrongAccountBankBranchChecksum]:
    "Invalid BBAN checksum (bank/branch)",
  [ValidationErrorsIBAN.QRIBANNotAllowed]:
    "QR-IBAN not allowed (specific use case)",
};

const getFriendlyErrors = (errorCodes) => {
  if (!errorCodes || errorCodes.length === 0) return "";
  return errorCodes
    .map(
      (errorCode) =>
        ibanErrorToMessage[errorCode] || `Unknown Error (${errorCode})`,
    )
    .filter(Boolean)
    .join(", ");
};

export default function IbanValidatorParser() {
  const [rawIban, setRawIban] = useState("");

  const ibanInfo = useMemo(() => {
    const iban = rawIban.toUpperCase().replace(/\s|-/g, "");

    if (!iban) {
      return { isValid: null, details: [], friendlyFormat: "" };
    }

    const validationResult = validateIBAN(iban);
    const extracted = extractIBAN(iban);

    const details = [
      {
        label: "Is IBAN valid ?",
        value: validationResult.valid ? "Yes" : "No",
      },
      ...(validationResult.errorCodes && validationResult.errorCodes.length > 0
        ? [
            {
              label: "IBAN errors",
              value: getFriendlyErrors(validationResult.errorCodes),
            },
          ]
        : []),
      { label: "Country code", value: extracted.countryCode || "N/A" },
      { label: "Is IBAN a QR-IBAN ?", value: isQRIBAN(iban) ? "Yes" : "No" },
      { label: "BBAN", value: extracted.bban || "N/A" },
    ];

    return {
      isValid: validationResult.valid,
      details: details,
      friendlyFormat: friendlyFormatIBAN(iban),
    };
  }, [rawIban]);

  const ibanExamples = [
    "FR7630006000011234567890189",
    "DE89370400440532013000",
    "GB29NWBK60161331926819",
    "FR7630006060011234567890189",
    "DE8937040044053201300",
  ];

  const handleExampleClick = (exampleIban) => {
    setRawIban(exampleIban);
    document.getElementById("ibanInput")?.focus();
  };

  return (
    <div className="space-y-6">
      <Input
        id="ibanInput"
        value={rawIban}
        onChange={(e) => setRawIban(e.target.value)}
        placeholder="Enter an IBAN to check for validity..."
        aria-label="IBAN Input"
        className={`font-mono text-lg ${
          rawIban &&
          (ibanInfo.isValid === null
            ? ""
            : ibanInfo.isValid
              ? "border-green-500 focus:border-green-500 focus:ring-green-500 dark:border-green-600"
              : "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-600")
        }`}
      />

      {rawIban.trim() !== "" && (
        <div className="rounded-md border border-gray-200 p-4 dark:border-gray-700 dark:bg-slate-800">
          <div className="space-y-2">
            {ibanInfo.details.map((detail) => (
              <InfoRow
                key={detail.label}
                label={detail.label}
                value={detail.value}
                placeholder="N/A"
              />
            ))}
            <InfoRow
              label="IBAN friendly format"
              value={ibanInfo.friendlyFormat}
              placeholder="N/A"
            />
          </div>
        </div>
      )}

      <div className="rounded-md border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-slate-800">
        <h3 className="mb-3 text-lg font-medium text-gray-900 dark:text-white">
          Valid IBAN examples
        </h3>
        <div className="space-y-2">
          {ibanExamples.map((iban) => (
            <div
              key={iban}
              className="flex items-center justify-between gap-2 rounded bg-gray-100 p-2 dark:bg-gray-700/50"
            >
              <span
                className="cursor-pointer font-mono text-sm text-gray-800 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-indigo-400"
                onClick={() => handleExampleClick(iban)}
                title="Click to use this example"
              >
                {friendlyFormatIBAN(iban)}
              </span>
              <CopyToClipboardButton
                textToCopy={iban}
                size="sm"
                variant="secondary"
                buttonText=""
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
