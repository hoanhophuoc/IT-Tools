import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import IbanValidatorParser, { getFriendlyErrors } from "../../src/tools/data/IbanValidatorParser.jsx";
import PhoneParserFormatter from "../../src/tools/data/PhoneParserFormatter.jsx";
import SvgPlaceholderGenerator from "../../src/tools/images & videos/SvgPlaceholderGenerator.jsx";
import QrCodeGenerator from "../../src/tools/images & videos/QrCodeGenerator.jsx";
import WifiQrCodeGenerator, { escapeWifiValue } from "../../src/tools/images & videos/WifiQrCodeGenerator.jsx";
import * as utils from "../../src/lib/utils.js";

let mockPhoneParseThrow = false;
vi.mock("libphonenumber-js/max", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    parsePhoneNumberFromString: (...args) => {
      if (mockPhoneParseThrow) {
        throw new Error("Crash");
      }
      return actual.parsePhoneNumberFromString(...args);
    },
  };
});

describe("Data and Media Tools Suite", () => {
  describe("IbanValidatorParser", () => {
    it("renders IBAN validation input and checks invalid IBAN", () => {
      render(<IbanValidatorParser />);
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "INVALID_IBAN_123" } });
      expect(screen.getAllByText("No").length).toBeGreaterThanOrEqual(1);

      // Whitespace-only input (hits rawIban && isValid === null branch)
      fireEvent.change(input, { target: { value: "   " } });

      // Swiss QR-IBAN (hits isQRIBAN Yes branch)
      fireEvent.change(input, { target: { value: "CH4431999123000889012" } });
      expect(screen.getAllByText("Yes").length).toBeGreaterThanOrEqual(1);

      // Non-country IBAN
      fireEvent.change(input, { target: { value: "1234" } });
    });

    it("populates input and details when clicking an example IBAN button", () => {
      render(<IbanValidatorParser />);
      const exampleBtns = screen.getAllByTitle("Click to use this example");
      expect(exampleBtns.length).toBeGreaterThan(0);

      fireEvent.click(exampleBtns[0]);
      expect(screen.getAllByText("Yes").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("IBAN friendly format")).toBeTruthy();

      expect(getFriendlyErrors([])).toBe("");
      expect(getFriendlyErrors(null)).toBe("");
      expect(getFriendlyErrors([9999])).toBe("Unknown Error (9999)");
    });
  });

  describe("PhoneParserFormatter", () => {
    it("renders international phone number input and formats valid phone numbers", async () => {
      render(<PhoneParserFormatter />);
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "+1 650 253 0000" } });

      await waitFor(() => {
        expect(screen.getAllByText("Yes").length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText("US").length).toBeGreaterThanOrEqual(1);
      });

      // Phone number that is not valid (hits isValid() ? 'Yes' : 'No' false branch)
      fireEvent.change(input, { target: { value: "+44 00000000" } });
      await waitFor(() => {
        expect(screen.getAllByText("No").length).toBeGreaterThanOrEqual(1);
      });

      // Phone number that is not possible (hits isPossible() ? 'Yes' : 'No' false branch)
      fireEvent.change(input, { target: { value: "+1 99" } });
      await waitFor(() => {
        expect(screen.getAllByText("No").length).toBeGreaterThanOrEqual(2);
      });
    });

    it("shows message when phone number cannot be parsed", () => {
      render(<PhoneParserFormatter />);
      const input = screen.getByRole("textbox");
      fireEvent.change(input, { target: { value: "invalid-number-string" } });

      expect(screen.getByText(/Could not parse phone number with selected country/i)).toBeTruthy();
    });

    it("changes country code selection", () => {
      render(<PhoneParserFormatter />);
      const select = screen.getByLabelText(/Default country code/i);
      fireEvent.change(select, { target: { value: "GB" } });
      expect(select.value).toBe("GB");
    });

    it("handles parsing error when parsePhoneNumberFromString throws", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockPhoneParseThrow = true;
      try {
        render(<PhoneParserFormatter />);
        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "+12345" } });
        expect(screen.getByText("Error parsing phone number.")).toBeTruthy();
      } finally {
        mockPhoneParseThrow = false;
        errorSpy.mockRestore();
      }
    });
  });

  describe("SvgPlaceholderGenerator", () => {
    it("renders width, height, text controls, handles escaping, and downloads svg", () => {
      const clickSpy = vi.fn();
      const originalCreate = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tag) => {
        const el = originalCreate(tag);
        if (tag === "a") {
          el.click = clickSpy;
        }
        return el;
      });

      render(<SvgPlaceholderGenerator />);
      expect(screen.getAllByText(/Width/i).length).toBeGreaterThan(0);

      // Change width to valid and invalid (NaN or < 1)
      const widthInput = screen.getByLabelText(/Width \(px\):/i);
      fireEvent.change(widthInput, { target: { value: "800" } });
      expect(widthInput.value).toBe("800");
      fireEvent.change(widthInput, { target: { value: "-5" } });
      expect(widthInput.value).toBe("1");
      fireEvent.change(widthInput, { target: { value: "abc" } });
      expect(widthInput.value).toBe("1");

      // Change height and font size
      const heightInput = screen.getByLabelText(/Height \(px\):/i);
      fireEvent.change(heightInput, { target: { value: "500" } });
      const fontInput = screen.getByLabelText(/Font Size \(px\):/i);
      fireEvent.change(fontInput, { target: { value: "32" } });

      // Change custom text with special characters to test HTML escaping (&, <, >)
      const customTextInput = screen.getByLabelText(/Custom Text:/i);
      fireEvent.change(customTextInput, { target: { value: "A & B < C > D" } });
      expect(screen.getByText(/&amp;/)).toBeTruthy();
      expect(screen.getByText(/&lt;/)).toBeTruthy();
      expect(screen.getByText(/&gt;/)).toBeTruthy();

      // Change colors
      const bgPicker = screen.getByLabelText(/Background: color picker/i);
      fireEvent.change(bgPicker, { target: { value: "#123456" } });
      const fgPicker = screen.getByLabelText(/Text Color: color picker/i);
      fireEvent.change(fgPicker, { target: { value: "#654321" } });

      // Toggle useExactSize switch
      const switchToggle = screen.getByRole("switch");
      fireEvent.click(switchToggle);
      fireEvent.click(switchToggle);

      // Trigger download with custom text
      const downloadBtn = screen.getByRole("button", { name: /Download SVG/i });
      fireEvent.click(downloadBtn);
      expect(clickSpy).toHaveBeenCalled();

      // Clear custom text to test fallback filename
      fireEvent.change(customTextInput, { target: { value: "" } });
      fireEvent.click(downloadBtn);
      expect(clickSpy).toHaveBeenCalledTimes(2);

      vi.restoreAllMocks();
    });
  });

  describe("QrCodeGenerator", () => {
    it("renders text input, error correction, and handles download trigger", () => {
      const downloadSpy = vi.spyOn(utils, "downloadCanvasAsPng").mockImplementation(() => true);

      render(<QrCodeGenerator />);
      const textarea = screen.getByPlaceholderText(/Enter text or URL to encode.../i);
      fireEvent.change(textarea, { target: { value: "https://example.com" } });

      const errorSelect = screen.getByLabelText(/Error resistance/i);
      fireEvent.change(errorSelect, { target: { value: "H" } });

      // Change colors
      const fgPicker = screen.getByLabelText(/Foreground color: color picker/i);
      fireEvent.change(fgPicker, { target: { value: "#112233" } });

      const bgPicker = screen.getByLabelText(/Background color: color picker/i);
      fireEvent.change(bgPicker, { target: { value: "#eeeeee" } });

      const downloadBtn = screen.getByRole("button", { name: /Download/i });
      fireEvent.click(downloadBtn);

      expect(downloadSpy).toHaveBeenCalled();
    });

    it("shows placeholder message when text is empty", () => {
      render(<QrCodeGenerator />);
      const textarea = screen.getByPlaceholderText(/Enter text or URL to encode.../i);
      fireEvent.change(textarea, { target: { value: "" } });

      expect(screen.getByText("Enter text to generate QR code")).toBeTruthy();
    });
  });

  describe("WifiQrCodeGenerator", () => {
    it("renders WiFi SSID input and generates WPA QR code with toggled password visibility", () => {
      render(<WifiQrCodeGenerator />);
      const ssidInput = screen.getByPlaceholderText(/Your WiFi Network Name/i);
      fireEvent.change(ssidInput, { target: { value: "MyHomeWifi" } });

      const passInput = screen.getByPlaceholderText(/Your WiFi Password/i);
      fireEvent.change(passInput, { target: { value: "SecretPass123" } });

      // Toggle show password
      const showBtn = screen.getByLabelText("Show password");
      fireEvent.click(showBtn);
      expect(screen.getByLabelText("Hide password")).toBeTruthy();

      // Toggle hidden network checkbox
      const hiddenCheckbox = screen.getByLabelText(/Hidden Network/i);
      fireEvent.click(hiddenCheckbox);
      expect(hiddenCheckbox.checked).toBe(true);
    });

    it("handles nopass encryption mode and downloads QR code", () => {
      const downloadSpy = vi.spyOn(utils, "downloadCanvasAsPng").mockImplementation(() => true);
      render(<WifiQrCodeGenerator />);

      const encSelect = screen.getByLabelText(/Encryption method/i);
      fireEvent.change(encSelect, { target: { value: "nopass" } });

      const ssidInput = screen.getByPlaceholderText(/Your WiFi Network Name/i);
      fireEvent.change(ssidInput, { target: { value: "OpenGuestWifi" } });

      const downloadBtn = screen.getByRole("button", { name: /Download QR Code/i });
      fireEvent.click(downloadBtn);

      expect(downloadSpy).toHaveBeenCalled();
    });

    it("handles WEP and WPA2-EAP Enterprise encryption modes", () => {
      render(<WifiQrCodeGenerator />);
      const encSelect = screen.getByLabelText(/Encryption method/i);

      // WEP mode
      fireEvent.change(encSelect, { target: { value: "WEP" } });
      const ssidInput = screen.getByPlaceholderText(/Your WiFi Network Name/i);
      fireEvent.change(ssidInput, { target: { value: "LegacyWep" } });
      const passInput = screen.getByPlaceholderText(/Your WiFi Password/i);
      fireEvent.change(passInput, { target: { value: "12345" } });

      // WPA2-EAP mode
      fireEvent.change(encSelect, { target: { value: "WPA2-EAP" } });
      expect(screen.getByText("WPA2-EAP Settings")).toBeTruthy();

      const identityInput = screen.getByPlaceholderText(/Your EAP username\/identity/i);
      fireEvent.change(identityInput, { target: { value: "employee@corp.com" } });

      const eapSelect = screen.getByLabelText(/EAP method/i);
      fireEvent.change(eapSelect, { target: { value: "TLS" } });

      const phase2Select = screen.getByLabelText(/Phase 2 method/i);
      fireEvent.change(phase2Select, { target: { value: "MSCHAPV2" } });

      // Test with empty password in WPA2-EAP
      fireEvent.change(passInput, { target: { value: "" } });
    });

    it("displays message when SSID is empty or required fields are missing", () => {
      render(<WifiQrCodeGenerator />);
      expect(screen.getByText("Enter SSID to generate QR code")).toBeTruthy();

      const ssidInput = screen.getByPlaceholderText(/Your WiFi Network Name/i);
      fireEvent.change(ssidInput, { target: { value: "MyWifi" } });

      // In WPA without password, cannot generate
      expect(screen.getByText("Cannot generate QR with current settings")).toBeTruthy();
    });

    it("handles color picking and unknown encryption warning", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(<WifiQrCodeGenerator />);

      const ssidInput = screen.getByPlaceholderText(/Your WiFi Network Name/i);
      fireEvent.change(ssidInput, { target: { value: "ColorWifi" } });

      // Colors
      const fgPicker = screen.getByLabelText(/Foreground color: color picker/i);
      fireEvent.change(fgPicker, { target: { value: "#112233" } });
      const bgPicker = screen.getByLabelText(/Background color: color picker/i);
      fireEvent.change(bgPicker, { target: { value: "#eeddcc" } });

      // Unknown encryption type via select
      const encSelect = screen.getByLabelText(/Encryption method/i);
      const customOpt = document.createElement("option");
      customOpt.value = "CUSTOM_UNKNOWN";
      customOpt.text = "CUSTOM_UNKNOWN";
      encSelect.appendChild(customOpt);
      fireEvent.change(encSelect, { target: { value: "CUSTOM_UNKNOWN" } });

      expect(warnSpy).toHaveBeenCalledWith("Unknown encryption type:", "CUSTOM_UNKNOWN");
      warnSpy.mockRestore();
    });

    it("handles error in getWifiQrCodeText catch block", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const origReplace = String.prototype.replace;
      const replaceSpy = vi.spyOn(String.prototype, "replace").mockImplementation(function (...args) {
        if (
          args[0] instanceof RegExp &&
          args[0].source.includes(";,") &&
          typeof this === "string" &&
          this.includes("TRIGGER_CRASH")
        ) {
          throw new Error("Targeted test error");
        }
        return origReplace.apply(this, args);
      });

      render(<WifiQrCodeGenerator />);
      const ssidInput = screen.getByPlaceholderText(/Your WiFi Network Name/i);
      fireEvent.change(ssidInput, { target: { value: "TRIGGER_CRASH" } });

      expect(screen.getByText("Error preparing QR code data.")).toBeTruthy();

      expect(escapeWifiValue("")).toBe("");

      replaceSpy.mockRestore();
      errorSpy.mockRestore();
    });
  });
});
