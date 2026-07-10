export type ProgressBarVariant = "claude" | "hijau" | "kuning" | "merah" | "gray";

const fillClasses: Record<ProgressBarVariant, string> = {
  claude: "bg-claude",
  hijau: "bg-hijau",
  kuning: "bg-kuning",
  merah: "bg-merah",
  gray: "bg-gray-400 dark:bg-zinc-500",
};

export default function ProgressBar({
  value,
  total,
  variant = "claude",
  className,
}: {
  value: number;
  total: number;
  variant?: ProgressBarVariant;
  className?: string;
}) {
  const percent = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={total}
      className={`h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800 ${
        className ?? ""
      }`}
    >
      <div
        className={`h-full rounded-full transition-all ${fillClasses[variant]}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
