"use client";

import { InputHTMLAttributes, ReactNode, useState } from "react";
import { fieldErrorClass, fieldInputClass, fieldLabelClass } from "@/lib/field-styles";

export type AppNumberInputMode = "numeric" | "decimal";

interface AppNumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  inputId: string;
  label?: string;
  icon?: ReactNode;
  errorMessage?: string;
  characterLength?: number;
  mode?: AppNumberInputMode;
  value: string;
  onValueChange?: (value: string) => void;
}

const sanitizers: Record<AppNumberInputMode, (raw: string) => string> = {
  numeric: (raw) => raw.replace(/\D/g, "").replace(/^0+(?=\d)/, ""),
  decimal: (raw) =>
    raw
      .replace(/[^0-9.,]/g, "")
      .replace(/,/g, ".")
      .replace(/(\..*)\./g, "$1"),
};

const inputModeMap: Record<AppNumberInputMode, "numeric" | "decimal"> = {
  numeric: "numeric",
  decimal: "decimal",
};

const patternMap: Record<AppNumberInputMode, string> = {
  numeric: "[0-9]*",
  decimal: "^[0-9]*[.,]?[0-9]*$",
};

export default function AppNumberInput({
  inputId,
  label,
  icon,
  errorMessage,
  characterLength,
  mode = "numeric",
  value,
  onValueChange,
  required,
  disabled,
  className,
  ...rest
}: AppNumberInputProps) {
  const [internalError, setInternalError] = useState("");
  const characterLimitErrorMessage = "You've reached the character limit.";

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const rawValue = event.target.value;
    const sanitized = sanitizers[mode](rawValue).slice(0, characterLength);

    if (characterLength && rawValue.length > characterLength) {
      setInternalError(characterLimitErrorMessage);
    } else if (internalError) {
      setInternalError("");
    }

    onValueChange?.(sanitized);
  }

  const computedError = errorMessage || internalError;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className={fieldLabelClass}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="pointer-events-none absolute left-0 flex h-full items-center pl-3 text-gray-400 dark:text-zinc-500">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          type="text"
          inputMode={inputModeMap[mode]}
          pattern={patternMap[mode]}
          required={required}
          disabled={disabled}
          maxLength={characterLength}
          value={value}
          {...rest}
          onChange={handleChange}
          className={[
            fieldInputClass(!!computedError),
            icon ? "pl-9" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </div>

      {computedError && <p className={fieldErrorClass}>{computedError}</p>}
    </div>
  );
}
