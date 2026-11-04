"use client";

// A section's own view switch (metric, dimension, sample rule): a segmented control, so it stays a plain button per the OS button rule.
export default function AnalyticsToggleOS<T extends string>({ options, value, onChange, label }: { options: { value: T; label: string }[]; value: T; onChange: (value: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="flex rounded-lg border border-line p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium transition-colors ${value === option.value ? "bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100" : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
