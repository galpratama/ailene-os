import { ArrowDown, ArrowUp } from "lucide-react";

// Period-over-period delta; `invert` reads a rising cost metric as red, not green.
export default function ChangeIndicator({
  value,
  invert = false,
  emptyLabel = "New vs previous",
}: {
  value: number | null;
  invert?: boolean;
  emptyLabel?: string;
}) {
  if (value === null) {
    return <span className="text-xs font-semibold text-claude">{emptyLabel}</span>;
  }

  const isUp = value >= 0;
  const isGood = invert ? !isUp : isUp;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${
        isGood ? "text-hijau" : "text-merah"
      }`}
    >
      {isUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}
