// src/tools/web/KeycodeInfo.jsx
"use client"; // Required for hooks and event listeners

import { useState, useEffect, useMemo } from "react";
import InfoRow from "@/components/ui/InfoRow"; // Import the row component

export default function KeycodeInfo() {
  // State to hold the last keydown event object
  const [lastEvent, setLastEvent] = useState(null);

  // Effect to add and remove the global keydown listener
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Optional: Prevent default for some keys if needed (like space scrolling)
      // if (event.key === ' ') { event.preventDefault(); }

      // Set the entire event object in state
      setLastEvent(event);
    };

    console.log("Keycode Info: Adding keydown listener");
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup function: Remove listener when component unmounts
    return () => {
      console.log("Keycode Info: Removing keydown listener");
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Empty dependency array ensures this runs only once on mount/unmount

  // Calculate modifier string using useMemo
  const modifiers = useMemo(() => {
    if (!lastEvent) return "";
    return [
      lastEvent.metaKey &&
        (navigator.platform.toUpperCase().indexOf("MAC") >= 0 ? "Cmd" : "Meta"), // Show Cmd on Mac, Meta otherwise
      lastEvent.shiftKey && "Shift",
      lastEvent.ctrlKey && "Ctrl",
      lastEvent.altKey && "Alt",
    ]
      .filter(Boolean) // Remove false/null values
      .join(" + "); // Join with ' + '
  }, [lastEvent]);

  // Prepare data for display using useMemo
  const fields = useMemo(() => {
    if (!lastEvent) return [];
    return [
      { label: "Key", value: lastEvent.key, placeholder: "Press a key..." },
      { label: "KeyCode", value: lastEvent.keyCode, placeholder: "N/A" }, // Note: keyCode is deprecated but still widely used/informative
      { label: "Code", value: lastEvent.code, placeholder: "N/A" },
      { label: "Location", value: lastEvent.location, placeholder: "N/A" }, // 0: Standard, 1: Left, 2: Right, 3: Numpad
      { label: "Modifiers", value: modifiers, placeholder: "None" },
      { label: "Repeat", value: lastEvent.repeat, placeholder: "false" }, // boolean
      { label: "Alt Pressed", value: lastEvent.altKey, placeholder: "false" },
      { label: "Ctrl Pressed", value: lastEvent.ctrlKey, placeholder: "false" },
      { label: "Meta Pressed", value: lastEvent.metaKey, placeholder: "false" }, // Windows key / Command key
      {
        label: "Shift Pressed",
        value: lastEvent.shiftKey,
        placeholder: "false",
      },
    ];
  }, [lastEvent, modifiers]); // Recalculate when event or modifiers change

  return (
    <div className="space-y-6">
      {/* Display Area for Pressed Key */}
      <div className="flex min-h-[150px] items-center justify-center rounded-lg border border-dashed border-gray-400 bg-gray-50 p-6 text-center dark:border-gray-600 dark:bg-slate-800">
        {lastEvent ? (
          <span className="text-4xl font-bold break-words text-indigo-600 dark:text-indigo-400">
            {" "}
            {/* Added break-words */}
            {/* Display 'Space' for spacebar key */}
            {lastEvent.key === " " ? "Space" : lastEvent.key}
          </span>
        ) : (
          <span className="text-lg text-gray-500 dark:text-gray-400">
            Press any key on your keyboard to see its details.
          </span>
        )}
      </div>

      {/* Key Information Rows */}
      <div className="space-y-2">
        {fields.length === 0 && !lastEvent && (
          <p className="text-center text-sm text-gray-500">
            Waiting for key press...
          </p>
        )}
        {fields.map((field, i) => (
          <InfoRow
            key={i} // Using index is okay here as the list structure is stable
            label={field.label + " :"} // Add colon like reference
            value={field.value}
            placeholder={field.placeholder}
          />
        ))}
      </div>
    </div>
  );
}
