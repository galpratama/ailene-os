import { ReactNode } from "react";

// A compact number for the strip under a section header.
export default function LmsInsightStatOS({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-card-bg px-4 py-3">
      <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <div className="mt-1 font-heading text-xl font-bold tabular-nums text-gray-900 dark:text-zinc-100">
        {value}
      </div>
      {hint && (
        <p className="truncate text-xs text-gray-500 dark:text-zinc-400">{hint}</p>
      )}
    </div>
  );
}
