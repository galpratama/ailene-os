import AppButton from "@/components/buttons/AppButton";
import ProgressBar, { ProgressBarVariant } from "@/components/labels/ProgressBar";
import type { LucideIcon } from "lucide-react";

export type LmsInsightTone = "claude" | "biru" | "ungu" | "toska" | "oranye";

const toneClasses: Record<LmsInsightTone, { tile: string; ring: string }> = {
  claude: { tile: "bg-claude/10 text-claude", ring: "ring-claude/40" },
  biru: { tile: "bg-biru/15 text-biru", ring: "ring-biru/50" },
  ungu: { tile: "bg-ungu/15 text-ungu", ring: "ring-ungu/50" },
  toska: { tile: "bg-toska/15 text-toska", ring: "ring-toska/50" },
  oranye: { tile: "bg-oranye/15 text-oranye", ring: "ring-oranye/50" },
};

// Doubles as the section switcher, so the active card carries a ring in its own tone.
export default function LmsInsightKpiCardOS({
  title,
  icon: Icon,
  tone,
  value,
  caption,
  progress,
  progressVariant = "claude",
  active,
  onClick,
}: {
  title: string;
  icon: LucideIcon;
  tone: LmsInsightTone;
  value: string;
  caption: string;
  progress?: { value: number; total: number; label: string };
  progressVariant?: ProgressBarVariant;
  active: boolean;
  onClick: () => void;
}) {
  const { tile, ring } = toneClasses[tone];
  return (
    <AppButton
      variant="bare"
      size="bare"
      onClick={onClick}
      aria-pressed={active}
      type="button"
      className={`group h-full w-full flex-col items-stretch rounded-2xl border bg-card-bg p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
        active ? `border-transparent ring-2 ${ring} shadow-md` : "border-line"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tile}`}>
          <Icon size={16} />
        </span>
        <span className="truncate text-xs font-semibold text-gray-500 dark:text-zinc-400">
          {title}
        </span>
      </div>
      <p className="mt-3 font-heading text-2xl font-bold tabular-nums text-gray-900 dark:text-zinc-100">
        {value}
      </p>
      <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 dark:text-zinc-400">
        {caption}
      </p>
      {progress && (
        <div className="mt-auto pt-3">
          <ProgressBar
            value={progress.value}
            total={progress.total}
            variant={progressVariant}
          />
          <p className="mt-1.5 text-[11px] text-gray-400 dark:text-zinc-500">
            {progress.label}
          </p>
        </div>
      )}
    </AppButton>
  );
}
