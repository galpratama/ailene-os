"use client";

import ChartHoverOS, { type ChartTooltipRow } from "@/components/elements/ChartHoverOS";
import type { ReactNode } from "react";

export type RankedItem = {
  key: string;
  label: string;
  sublabel?: string;
  value: number;
  display: string;
  rows: ChartTooltipRow[];
  note?: string;
  color?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
};

// Long names sit above a thin bar so nothing truncates into a narrow axis; every bar shares one baseline.
export default function WarehouseRankedBarsOS({ items, color = "var(--viz-1)", maxValue }: { items: RankedItem[]; color?: string; maxValue?: number }) {
  const top = maxValue ?? Math.max(...items.map((item) => item.value), 0);
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item.key}>
          <ChartHoverOS label={`${item.label}: ${item.display}`} title={item.label} rows={item.rows} note={item.note} className="flex items-center gap-2.5 rounded-sm">
            {item.leading}
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate text-xs text-gray-700 dark:text-zinc-300">
                  {item.label}
                  {item.sublabel && <span className="ml-1.5 text-gray-500 dark:text-zinc-400">{item.sublabel}</span>}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {item.trailing}
                  <span className="text-xs font-semibold tabular-nums text-gray-900 dark:text-zinc-100">{item.display}</span>
                </span>
              </div>
              <div className="mt-1 h-2 rounded-r-full">
                <div className="h-full rounded-r-full" style={{ width: `${top > 0 ? Math.max((item.value / top) * 100, 0.5) : 0}%`, backgroundColor: item.color ?? color }} />
              </div>
            </div>
          </ChartHoverOS>
        </li>
      ))}
    </ul>
  );
}
