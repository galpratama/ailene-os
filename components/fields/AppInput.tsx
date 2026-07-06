"use client";

import { InputHTMLAttributes, ReactNode, useState } from "react";
import { fieldErrorClass, fieldInputClass, fieldLabelClass } from "@/lib/field-styles";

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputId: string;
  label?: string;
  icon?: ReactNode;
  errorMessage?: string;
  characterLength?: number;
}

export default function AppInput({
  inputId,
  label,
  icon,
  errorMessage,
  characterLength,
  required,
  disabled,
  className,
  onChange,
  ...rest
}: AppInputProps) {
  const [internalError, setInternalError] = useState("");
  const characterLimitErrorMessage = "You've reached the character limit.";

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (characterLength && event.target.value.length > characterLength) {
      setInternalError(characterLimitErrorMessage);
    } else if (internalError) {
      setInternalError("");
    }
    onChange?.(event);
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
          <div className="pointer-events-none absolute left-0 flex h-full items-center pl-3 text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          required={required}
          disabled={disabled}
          maxLength={characterLength}
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
