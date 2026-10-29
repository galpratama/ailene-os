"use client";

import type { ReactNode } from "react";

export default function AppSwitch({
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
      className={`flex items-center justify-between gap-4 rounded-xl border border-line bg-white px-3.5 py-3 dark:bg-zinc-900 ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      }`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-gray-800 dark:text-zinc-200">
          {label}
        </span>
        {hint && (
          <span className="mt-0.5 block text-xs text-gray-500 dark:text-zinc-400">
            {hint}
          </span>
        )}
      </span>
      <span className="relative shrink-0">
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={`block h-5.5 w-10 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-claude/35 peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed ${
            checked
              ? "bg-claude dark:bg-lime-bright"
              : "bg-gray-300 dark:bg-zinc-600"
          }`}
        >
          <span
            className={`block size-4.5 translate-y-0.5 rounded-full bg-white shadow-sm transition-transform ${
              checked
                ? "translate-x-5 dark:bg-forest-deep"
                : "translate-x-0.5"
            }`}
          />
        </span>
      </span>
    </label>
  );
}
