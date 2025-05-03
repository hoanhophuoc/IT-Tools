import React from "react";
import Input from "@/components/ui/Input";
import { handleHexColorChange } from "@/lib/utils";

export default function ColorInput({
  label,
  id,
  value,
  onChange,
  className = "",
  ...rest
}) {
  const handleChange = handleHexColorChange(onChange);
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          type="color"
          id={id + "Picker"}
          value={value}
          onChange={handleChange}
          className="h-10 w-10 shrink-0 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
        />
        <Input
          id={id}
          name={id}
          value={value}
          onChange={handleChange}
          maxLength={7}
          className={`font-mono ${className}`}
          {...rest}
        />
      </div>
    </div>
  );
}
