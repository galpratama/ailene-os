"use client";

import ChartHoverOS from "@/components/elements/ChartHoverOS";

export type DumbbellRow = { key: string; label: string; left: number | null; right: number | null; leftSessions: number; rightSessions: number };

function percent(value: number | null) {
  return value === null ? "—" : `${(value * 100).toFixed(0)}%`;
}

// Two dots per page on one shared 0-100% track: the wider the gap, the more one device loses people.
export default function WarehouseDumbbellOS({ rows, leftName, rightName }: { rows: DumbbellRow[]; leftName: string; rightName: string }) {
  return (
    <div>
      <ul className="mb-3 flex gap-3 text-xs text-gray-600 dark:text-zinc-300">
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="size-2 rounded-full bg-viz-3" />{leftName}</li>
        <li className="flex items-center gap-1.5"><span aria-hidden="true" className="size-2 rounded-full bg-viz-1" />{rightName}</li>
      </ul>
      <ul className="flex flex-col gap-3">
        {rows.map((row) => {
          const low = Math.min(row.left ?? 0, row.right ?? 0);
          const high = Math.max(row.left ?? 0, row.right ?? 0);
          const gap = row.left !== null && row.right !== null ? Math.round((row.left - row.right) * 100) : null;
          return (
            <li key={row.key}>
              <ChartHoverOS
                label={`${row.label}: ${leftName} ${percent(row.left)}, ${rightName} ${percent(row.right)}`}
                title={row.label}
                rows={[
                  { label: `${leftName} · ${row.leftSessions} sessions`, value: percent(row.left), color: "var(--viz-3)" },
                  { label: `${rightName} · ${row.rightSessions} sessions`, value: percent(row.right), color: "var(--viz-1)" },
                ]}
                className="rounded-sm"
              >
                <div className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate text-gray-700 dark:text-zinc-300">{row.label}</span>
                  <span className="shrink-0 font-semibold tabular-nums text-gray-900 dark:text-zinc-100">{gap === null ? "—" : `${gap > 0 ? "+" : ""}${gap} pts`}</span>
                </div>
                <div className="relative mt-2 h-3">
                  <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line-soft" />
                  {row.left !== null && row.right !== null && <div className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-viz-other" style={{ left: `${low * 100}%`, width: `${(high - low) * 100}%` }} />}
                  {row.left !== null && <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-viz-3 ring-2 ring-card-bg" style={{ left: `${row.left * 100}%` }} />}
                  {row.right !== null && <span className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-viz-1 ring-2 ring-card-bg" style={{ left: `${row.right * 100}%` }} />}
                </div>
              </ChartHoverOS>
            </li>
          );
        })}
      </ul>
      <div className="mt-1 flex justify-between text-xs tabular-nums text-gray-500 dark:text-zinc-400"><span>0%</span><span>50%</span><span>100%</span></div>
    </div>
  );
}
