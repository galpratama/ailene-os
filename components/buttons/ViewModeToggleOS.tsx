"use client";

import { LucideIcon } from "lucide-react";

export type ViewModeOS = "kanban" | "cards" | "table";

interface ViewModeOptionOS {
  value: ViewModeOS;
  label: string;
  icon: LucideIcon;
}

function segmentClass(active: boolean) {
  return `flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold transition-colors ${
    active
      ? "bg-claude text-white"
      : "text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
  }`;
}

// Segmented view-mode switcher — sits next to a list/board's page action
// button. Not a semantic button group, so it stays plain <button> per the
// project's tab/segmented-control convention (see CreateLeadFormOS).
export default function ViewModeToggleOS({
  value,
  onChange,
  options,
  className,
}: {
  value: ViewModeOS;
  onChange: (mode: ViewModeOS) => void;
  options: ViewModeOptionOS[];
  className?: string;
}) {
  return (
    <div
      className={`flex shrink-0 rounded-lg border border-gray-300 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-900 ${
        className ?? ""
      }`}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={segmentClass(value === option.value)}
          aria-pressed={value === option.value}
          title={option.label}
        >
          <option.icon size={13} />
          <span className="hidden sm:inline">{option.label}</span>
        </button>
      ))}
    </div>
  );
}
