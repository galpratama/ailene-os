"use client";

import { TextareaHTMLAttributes, useState } from "react";
import { fieldErrorClass, fieldInputClass, fieldLabelClass } from "@/lib/field-styles";

interface AppTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  textAreaId: string;
  label?: string;
  errorMessage?: string;
  characterLength?: number;
}

export default function AppTextArea({
  textAreaId,
  label,
  errorMessage,
  characterLength,
  required,
  disabled,
  className,
  onChange,
  ...rest
}: AppTextAreaProps) {
  const [internalError, setInternalError] = useState("");
  const characterLimitErrorMessage = "You've reached the character limit.";

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
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
        <label htmlFor={textAreaId} className={fieldLabelClass}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <textarea
        id={textAreaId}
        required={required}
        disabled={disabled}
        maxLength={characterLength}
        {...rest}
        onChange={handleChange}
        className={[
          fieldInputClass(!!computedError),
          "resize-none",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      />

      {computedError && <p className={fieldErrorClass}>{computedError}</p>}
    </div>
  );
}
