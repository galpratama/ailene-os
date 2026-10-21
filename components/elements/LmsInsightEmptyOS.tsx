import type { LucideIcon } from "lucide-react";

export default function LmsInsightEmptyOS({
  icon: Icon,
  title,
  message,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line px-6 py-10 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-claude/10 text-claude">
        <Icon size={20} />
      </span>
      <p className="text-sm font-semibold text-gray-700 dark:text-zinc-200">{title}</p>
      <p className="max-w-sm text-xs text-gray-500 dark:text-zinc-400">{message}</p>
    </div>
  );
}
