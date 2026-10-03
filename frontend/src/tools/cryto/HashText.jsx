"use client";
import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import InfoRow from "@/components/ui/InfoRow";

export default function HashText() {
  const [error, setError] = useState("");
  const [hashText, setHashText] = useState("");

  const [md5Result, setMd5Result] = useState("");
  const [sha1Result, setSha1Result] = useState("");
  const [sha256Result, setSha256Result] = useState("");
  const [sha224Result, setSha224Result] = useState("");
  const [sha512Result, setSha512Result] = useState("");
  const [sha384Result, setSha384Result] = useState("");
  const [sha3Result, setSha3Result] = useState("");
  const [ripemd160Result, setRipemd160Result] = useState("");

  const [encodingType, setEncodingType] = useState("base16");

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.setAttribute("data-dynamic-script", "true");

      script.onload = () => {
        console.log(`Script loaded successfully: ${src}`);
        resolve(src);
      };

      script.onerror = () => {
        console.error(`Failed to load script: ${src}`);
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    const loadScripts = async () => {
      try {
        await loadScript(
          "https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/crypto-js.min.js",
        );
        if (!window.CryptoJS) {
          throw new Error("CryptoJS is not available.");
        }
      } catch (e) {
        console.error(e.message);
        setError(e.message);
      }
    };

    loadScripts();

    return () => {
      const scriptElements = document.querySelectorAll(
        'script[data-dynamic-script="true"]',
      );
      scriptElements.forEach((script) => {
        document.body.removeChild(script);
        console.log(`Removed script: ${script.src}`);
      });
    };
  }, []);

  const handleHashChange = (text, encodingType) => {
    setHashText(text);

    const crypto = typeof window !== "undefined" ? window.CryptoJS : null;
    if (!crypto) return;

    try {
      let encoder;
      switch (encodingType) {
        case "base2":
          encoder = (digest) => parseInt(digest.toString(), 16).toString(2);
          break;
        case "base16":
          encoder = (digest) => digest.toString();
          break;
        case "base64":
          encoder = (digest) => crypto.enc.Base64.stringify(digest);
          break;
        case "base64url":
          encoder = (digest) => crypto.enc.Base64url.stringify(digest);
          break;
        default:
          encoder = (digest) => digest.toString();
      }

      setMd5Result(encoder(crypto.MD5(text)));
      setSha1Result(encoder(crypto.SHA1(text)));
      setSha224Result(encoder(crypto.SHA224(text)));
      setSha256Result(encoder(crypto.SHA256(text)));
      setSha512Result(encoder(crypto.SHA512(text)));
      setSha384Result(encoder(crypto.SHA384(text)));
      setSha3Result(encoder(crypto.SHA3(text)));
      setRipemd160Result(encoder(crypto.RIPEMD160(text)));
    } catch (e) {
      console.error("Error while hashing:", e.message);
      setError("Failed to compute hash.");
    }
  };

  const handleEncodingChange = (e) => {
    const value = e.target.value;
    setEncodingType(value);
    handleHashChange(hashText, value);
  };

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2"></div>

      <div className="mb-5 border-b border-gray-500 pb-5">
        <Input
          label="Text to Hash"
          id="hashText"
          value={hashText}
          onChange={(e) => handleHashChange(e.target.value, encodingType)}
          placeholder="Your string to hash"
        />
      </div>

      <div className="mb-7">
        <label
          htmlFor="encodingType"
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Digest encoding
        </label>

        <select
          id="encodingType"
          name="encodingType"
          required
          value={encodingType}
          onChange={handleEncodingChange}
          className={`mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-indigo-400`}
        >
          <option value="" disabled>
            -- Select Category --
          </option>
          <option value="base2">Binary (base 2)</option>
          <option value="base16">Hexadecimal (base 16)</option>
          <option value="base64">Base64 (base 64)</option>
          <option value="base64url">
            Base64url (base 64 with url safe chars)
          </option>
        </select>
      </div>

      <InfoRow label="MD5 Hash" value={md5Result} placeholder="MD5 hash result" />
      <InfoRow label="SHA1 Hash" value={sha1Result} placeholder="SHA1 hash result" />
      <InfoRow label="SHA256 Hash" value={sha256Result} placeholder="SHA256 hash result" />
      <InfoRow label="SHA224 Hash" value={sha224Result} placeholder="SHA224 hash result" />
      <InfoRow label="SHA512 Hash" value={sha512Result} placeholder="SHA512 hash result" />
      <InfoRow label="SHA384 Hash" value={sha384Result} placeholder="SHA384 hash result" />
      <InfoRow label="SHA3 Hash" value={sha3Result} placeholder="SHA3 hash result" />
      <InfoRow label="RIPEMD160 Hash" value={ripemd160Result} placeholder="RIPEMD160 hash result" />

    </div>
  );
}
