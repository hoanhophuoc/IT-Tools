import React from "react";
import Input from "@/components/ui/Input";

export default function ColorInput({
  label,
  id,
  value,
  onChange,
  className = "",
  ...rest
}) {
  const handleChange = (e) => {
    let val = e.target.value;
    if (e.target.type === "text") {
      if (!val.startsWith("#")) val = "#" + val;
      val = "#" + val.substring(1).replace(/[^0-9a-fA-F]/g, "").substring(0, 6);
    }
    onChange(val);
  };
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
          aria-label={label ? `${label} color picker` : "Color picker"}
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
