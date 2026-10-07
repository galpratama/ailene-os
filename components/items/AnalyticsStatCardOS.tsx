import ChangeIndicator from "@/components/labels/ChangeIndicator";
import type { LucideIcon } from "lucide-react";

export default function AnalyticsStatCardOS({
  label,
  value,
  change,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  change: number | null;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-card-bg p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-claude/10 text-claude">
          <Icon size={16} />
        </div>
        <ChangeIndicator value={change} />
      </div>
      <p className="mt-4 truncate text-2xl font-bold text-gray-900 dark:text-zinc-100">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">{label}</p>
      {hint && (
        <p className="mt-2 border-t border-line-soft pt-2 text-xs text-gray-400 dark:text-zinc-500">
          {hint}
        </p>
      )}
    </div>
  );
}
