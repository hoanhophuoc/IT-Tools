"use client";

import { useState, useEffect, useMemo } from "react";
import InfoRow from "@/components/ui/InfoRow";

export default function KeycodeInfo() {
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      setLastEvent(event);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const modifiers = useMemo(() => {
    if (!lastEvent) return "";
    return [
      lastEvent.metaKey &&
        (navigator.platform.toUpperCase().indexOf("MAC") >= 0 ? "Cmd" : "Meta"),
      lastEvent.shiftKey && "Shift",
      lastEvent.ctrlKey && "Ctrl",
      lastEvent.altKey && "Alt",
    ]
      .filter(Boolean)
      .join(" + ");
  }, [lastEvent]);

  const fields = useMemo(() => {
    if (!lastEvent) return [];
    return [
      { label: "Key", value: lastEvent.key, placeholder: "Press a key..." },
      { label: "KeyCode", value: lastEvent.keyCode, placeholder: "N/A" },
      { label: "Code", value: lastEvent.code, placeholder: "N/A" },
      { label: "Location", value: lastEvent.location, placeholder: "N/A" },
      { label: "Modifiers", value: modifiers, placeholder: "None" },
      { label: "Repeat", value: lastEvent.repeat, placeholder: "false" },
      { label: "Alt Pressed", value: lastEvent.altKey, placeholder: "false" },
      { label: "Ctrl Pressed", value: lastEvent.ctrlKey, placeholder: "false" },
      { label: "Meta Pressed", value: lastEvent.metaKey, placeholder: "false" },
      {
        label: "Shift Pressed",
        value: lastEvent.shiftKey,
        placeholder: "false",
      },
    ];
  }, [lastEvent, modifiers]);

  return (
    <div className="space-y-6">
      <div className="flex min-h-[150px] items-center justify-center rounded-lg border border-dashed border-gray-400 bg-gray-50 p-6 text-center dark:border-gray-600 dark:bg-slate-800">
        {lastEvent ? (
          <span className="text-4xl font-bold break-words text-indigo-600 dark:text-indigo-400">
            {lastEvent.key === " " ? "Space" : lastEvent.key}
          </span>
        ) : (
          <span className="text-lg text-gray-500 dark:text-gray-400">
            Press any key on your keyboard to see its details.
          </span>
        )}
      </div>

      <div className="space-y-2">
        {fields.length === 0 && !lastEvent && (
          <p className="text-center text-sm text-gray-500">
            Waiting for key press...
          </p>
        )}
        {fields.map((field, i) => (
          <InfoRow
            key={i}
            label={field.label + " :"}
            value={field.value}
            placeholder={field.placeholder}
          />
        ))}
      </div>
    </div>
  );
}
