"use client";

// A segmented filter, not an action, so it stays a plain button like the other tab toggles.
export default function LmsInsightFilterChipsOS<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors ${
              active
                ? "border-transparent bg-lime-bright text-forest-deep"
                : "border-line text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {option.label}
            {option.count !== undefined && (
              <span
                className={`rounded-full px-1.5 text-[10px] tabular-nums ${
                  active ? "bg-forest-deep/10" : "bg-gray-100 dark:bg-zinc-800"
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
