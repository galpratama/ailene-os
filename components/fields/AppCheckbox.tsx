"use client";

import type { ReactNode } from "react";

// A labelled checkbox row with an optional hint underneath.
export default function AppCheckbox({
  inputId,
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  inputId: string;
  label: ReactNode;
  hint?: ReactNode;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={inputId}
      className={`flex items-start gap-2.5 rounded-lg border border-line px-3 py-2.5 ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      }`}
    >
      <input
        id={inputId}
        type="checkbox"
        className="mt-0.5 accent-claude"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-gray-800 dark:text-zinc-200">{label}</span>
        {hint && <span className="text-xs text-gray-500 dark:text-zinc-400">{hint}</span>}
      </span>
    </label>
  );
}
