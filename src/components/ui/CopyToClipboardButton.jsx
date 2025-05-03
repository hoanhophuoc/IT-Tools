// src/components/ui/CopyToClipboardButton.jsx
"use client";

import { useState, useCallback } from 'react';
import Button from '@/components/ui/Button';
import { FiCopy, FiCheck } from 'react-icons/fi';

export default function CopyToClipboardButton({
    textToCopy,
    buttonText = "Copy",
    copiedText = "Copied!",
    size = "sm",
    variant = "secondary",
    className = "",
    disabled = false,
    ...props
}) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!navigator.clipboard) {
      alert("Clipboard API not supported by your browser. Please copy manually.");
      return;
    }
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); 
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert("Failed to copy text to clipboard.");
      setIsCopied(false);
    }
  }, [textToCopy]);

  return (
    <Button
        onClick={handleCopy}
        disabled={disabled || !textToCopy || isCopied} // Disable if no text, already copied, or externally disabled
        variant={variant}
        size={size}
        className={`min-w-[80px] ${className}`} // Add min-width for consistent size
        {...props}
    >
        {isCopied ? (
            <>
                 <FiCheck size={16} className="mr-1.5 text-green-500"/> {copiedText}
            </>
        ) : (
            <>
                 <FiCopy size={16} className="mr-1.5"/> {buttonText}
            </>
        )}
    </Button>
  );
}