// src/components/ui/InputWithLabel.jsx
// Simple wrapper for Input with optional inline label
import Input from "./Input";

export default function InputWithLabel({
  label,
  inputProps = {},
  labelClassName = "",
  containerClassName = "",
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:gap-2 ${containerClassName}`}
    >
      {label && (
        <label
          htmlFor={inputProps.id || inputProps.name}
          className={`mb-1 flex-shrink-0 text-sm font-medium text-gray-600 sm:mb-0 dark:text-gray-400 ${labelClassName}`} // Adjusted alignment and margin
        >
          {label}
        </label>
      )}
      <Input
        {...inputProps}
        className={`flex-grow ${inputProps.className || ""}`}
      />
    </div>
  );
}
