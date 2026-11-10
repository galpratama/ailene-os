import { MARGIN_FLOOR } from "@/lib/pricing-b2b";
import { TriangleAlert } from "lucide-react";

// The bar spans 0-80% margin, so the 45% floor sits a little past the middle.
const SCALE = 0.8;

export default function QuotationMarginMeterOS({ margin, compact = false }: { margin: number | null; compact?: boolean }) {
  if (margin === null) return <span className="text-gray-300 dark:text-zinc-600">—</span>;
  const healthy = margin >= MARGIN_FLOOR;
  const fill = Math.min(Math.max(margin / SCALE, 0), 1) * 100;
  return (
    <div className={`flex flex-col gap-1 ${compact ? "w-24" : "w-full"}`}>
      <span className={`flex items-center gap-1 text-xs font-semibold tabular-nums ${healthy ? "text-hijau" : "text-merah"}`}>
        {!healthy && <TriangleAlert size={12} aria-hidden="true" />}
        {(margin * 100).toFixed(1)}%
        {!compact && <span className="font-normal text-gray-500 dark:text-zinc-400">{healthy ? "di atas" : "di bawah"} batas {MARGIN_FLOOR * 100}%</span>}
      </span>
      <span className="relative h-1.5 overflow-hidden rounded-full bg-line-soft" aria-hidden="true">
        <span className={`absolute inset-y-0 left-0 rounded-full ${healthy ? "bg-hijau" : "bg-merah"}`} style={{ width: `${fill}%` }} />
        <span className="absolute inset-y-0 w-px bg-gray-500 dark:bg-zinc-300" style={{ left: `${(MARGIN_FLOOR / SCALE) * 100}%` }} />
      </span>
    </div>
  );
}
