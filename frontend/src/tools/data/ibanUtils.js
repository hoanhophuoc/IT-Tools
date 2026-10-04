import { ValidationErrorsIBAN } from "ibantools";

export const ibanErrorToMessage = {
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

export const getFriendlyErrors = (errorCodes) => {
  if (!errorCodes || errorCodes.length === 0) return "";
  return errorCodes
    .map(
      (errorCode) =>
        ibanErrorToMessage[errorCode] || `Unknown Error (${errorCode})`,
    )
    .filter(Boolean)
    .join(", ");
};
