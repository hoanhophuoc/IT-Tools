import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TextStatistics from "../../src/tools/text/TextStatistics.jsx";
import StringObfuscator from "../../src/tools/text/StringObfuscator.jsx";
import LoremIpsumGenerator from "../../src/tools/text/LoremIpsumGenerator.jsx";
import HtmlEntitiesEncoder from "../../src/tools/web/HtmlEntitiesEncoder.jsx";
import SlugifyString from "../../src/tools/web/SlugifyString.jsx";
import UrlEncoderDecoder from "../../src/tools/web/UrlEncoderDecoder.jsx";
import KeycodeInfo from "../../src/tools/web/KeycodeInfo.jsx";

describe("Text and Web Tools Suite", () => {
  describe("KeycodeInfo", () => {
    it("renders prompt and captures keyboard events", () => {
      render(<KeycodeInfo />);
      expect(screen.getByText(/Press any key on your keyboard to see its details/i)).toBeTruthy();

      fireEvent.keyDown(document, { key: "Enter", code: "Enter", keyCode: 13 });
      expect(screen.getAllByText("Enter").length).toBeGreaterThanOrEqual(1);

      // Space key with all modifiers
      fireEvent.keyDown(document, {
        key: " ",
        code: "Space",
        keyCode: 32,
        metaKey: true,
        shiftKey: true,
        ctrlKey: true,
        altKey: true,
      });
      expect(screen.getAllByText("Space").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Meta + Shift + Ctrl + Alt")).toBeTruthy();

      // On Mac platform
      const origPlatform = navigator.platform;
      Object.defineProperty(navigator, "platform", { value: "MacIntel", configurable: true });
      fireEvent.keyDown(document, {
        key: "a",
        metaKey: true,
      });
      expect(screen.getByText("Cmd")).toBeTruthy();
      Object.defineProperty(navigator, "platform", { value: origPlatform, configurable: true });
    });
  });

  describe("TextStatistics", () => {
    it("computes word count and character count accurately", () => {
      render(<TextStatistics />);
      const textarea = screen.getByPlaceholderText(/Enter your text here/i);
      fireEvent.change(textarea, { target: { value: "Hello world testing text statistics" } });

      expect(screen.getByDisplayValue("5")).toBeTruthy(); // 5 words
      expect(screen.getAllByDisplayValue("35").length).toBeGreaterThanOrEqual(1); // 35 characters

      // Empty text
      fireEvent.change(textarea, { target: { value: "" } });
      expect(screen.getAllByDisplayValue("0").length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("StringObfuscator", () => {
    it("obfuscates string and handles keep first/last parameters and keep spaces toggle", () => {
      render(<StringObfuscator />);
      const input = screen.getByPlaceholderText(/Enter your secret string/i);
      fireEvent.change(input, { target: { value: "super secret" } });

      const textareas = screen.getAllByRole("textbox");
      const outputTextarea = textareas[1];
      expect(outputTextarea.value).toMatch(/^su.*et$/);

      // Keep spaces toggle
      const keepSpacesBtn = screen.getByLabelText("Keep spaces:");
      expect(keepSpacesBtn.textContent).toBe("Yes");
      fireEvent.click(keepSpacesBtn);
      expect(keepSpacesBtn.textContent).toBe("No");

      // Change keepFirst and keepLast numbers (including empty, 0, negative, and oversize)
      const numberInputs = screen.getAllByRole("spinbutton");
      fireEvent.change(numberInputs[0], { target: { value: "1" } });
      fireEvent.change(numberInputs[0], { target: { value: "" } });
      fireEvent.change(numberInputs[0], { target: { value: "0" } });
      fireEvent.change(numberInputs[0], { target: { value: "-5" } });
      fireEvent.change(numberInputs[0], { target: { value: "999" } });

      fireEvent.change(numberInputs[1], { target: { value: "1" } });
      fireEvent.change(numberInputs[1], { target: { value: "" } });
      fireEvent.change(numberInputs[1], { target: { value: "0" } });
      fireEvent.change(numberInputs[1], { target: { value: "-5" } });
      fireEvent.change(numberInputs[1], { target: { value: "999" } });

      // Empty input
      fireEvent.change(input, { target: { value: "" } });
    });
  });

  describe("LoremIpsumGenerator", () => {
    it("renders lorem ipsum generator and generates text with options and sliders", () => {
      render(<LoremIpsumGenerator />);
      expect(screen.getAllByText(/Paragraph/i).length).toBeGreaterThan(0);

      // Toggle Starts with Lorem Ipsum button
      const toggleLoremBtn = screen.getByRole("button", { name: /Starts with Lorem Ipsum/i });
      fireEvent.click(toggleLoremBtn);
      expect(screen.getByRole("button", { name: /No Lorem Start/i })).toBeTruthy();

      // Toggle As HTML button
      const toggleHtmlBtn = screen.getByRole("button", { name: /As Text/i });
      fireEvent.click(toggleHtmlBtn);
      expect(screen.getByRole("button", { name: /As HTML/i })).toBeTruthy();

      // Adjust range sliders
      const sliders = screen.getAllByRole("slider");
      fireEvent.change(sliders[0], { target: { value: "2" } }); // paragraphs
      fireEvent.change(sliders[1], { target: { value: "3" } }); // sentences
      fireEvent.change(sliders[2], { target: { value: "5" } }); // words

      // Refresh button
      const refreshBtn = screen.getByRole("button", { name: /Refresh/i });
      fireEvent.click(refreshBtn);

      const textareas = screen.getAllByRole("textbox");
      expect(textareas.length).toBeGreaterThan(0);
    });
  });

  describe("SlugifyString", () => {
    it("converts title string to clean URL slug", () => {
      render(<SlugifyString />);
      const input = screen.getByPlaceholderText(/Put your string here/i);
      fireEvent.change(input, { target: { value: "Hello World 2026!" } });
      expect(screen.getByDisplayValue("hello-world-2026")).toBeTruthy();
    });
  });

  describe("UrlEncoderDecoder", () => {
    it("encodes and decodes special URI characters and handles error sequence", () => {
      render(<UrlEncoderDecoder />);
      const textareas = screen.getAllByRole("textbox");

      // Encode input
      fireEvent.change(textareas[0], { target: { value: "https://example.com?query=hello world" } });
      expect(textareas.length).toBeGreaterThan(1);

      // Decode input with invalid URI sequence
      fireEvent.change(textareas[2], { target: { value: "%E0%A4%A" } });
      expect(screen.getByText("Invalid URI sequence.")).toBeTruthy();

      // Empty input
      fireEvent.change(textareas[0], { target: { value: "" } });
      fireEvent.change(textareas[2], { target: { value: "" } });
    });
  });

  describe("HtmlEntitiesEncoder", () => {
    it("escapes and unescapes HTML entities accurately including unknown and empty entities", () => {
      render(<HtmlEntitiesEncoder />);
      const escapeInput = screen.getByPlaceholderText("Enter HTML or text to escape");
      fireEvent.change(escapeInput, { target: { value: "<b>hello & world</b>" } });

      expect(screen.getByDisplayValue("&lt;b&gt;hello &amp; world&lt;/b&gt;")).toBeTruthy();

      const unescapeInput = screen.getByPlaceholderText(/Enter HTML entities/i);
      fireEvent.change(unescapeInput, { target: { value: "&copy; 2026 &#65; &#x42; &unknown;" } });

      expect(screen.getByDisplayValue("© 2026 A B &unknown;")).toBeTruthy();

      // High codepoints & &#X uppercase
      fireEvent.change(unescapeInput, { target: { value: "&#x99999999; &#99999999; &#X41;" } });
      expect(screen.getByDisplayValue("&#x99999999; &#99999999; A")).toBeTruthy();

      // Empty inputs
      fireEvent.change(escapeInput, { target: { value: "" } });
      fireEvent.change(unescapeInput, { target: { value: "" } });
    });
  });
});
