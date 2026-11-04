"use client";

import ChartHoverOS from "@/components/elements/ChartHoverOS";

export type ShareSegment = { key: string; value: number; color: string; ink?: string };
export type ShareRow = { key: string; label: string; total: string; format: (value: number) => string; segments: ShareSegment[] };

// Tall segmented bars: comparing the rows shows where one group takes more of leads or spend than of traffic.
export default function WarehouseShareBarsOS({ rows, legend }: { rows: ShareRow[]; legend: { key: string; color: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => {
        const total = row.segments.reduce((sum, segment) => sum + segment.value, 0);
        return (
          <div key={row.key}>
            <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
              <span className="font-medium text-gray-600 dark:text-zinc-300">{row.label}</span>
              <span className="font-semibold text-gray-900 dark:text-zinc-100">{row.total}</span>
            </div>
            {total <= 0 ? (
              <div className="flex h-7 items-center justify-center rounded-sm bg-gray-100 text-xs text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">No data in this slice</div>
            ) : (
              <div className="flex h-7 gap-0.5">
                {row.segments.filter((segment) => segment.value > 0).map((segment) => {
                  const share = segment.value / total;
                  return (
                    <ChartHoverOS
                      key={segment.key}
                      label={`${row.label}, ${segment.key}: ${row.format(segment.value)}`}
                      title={`${row.label} · ${segment.key}`}
                      rows={[{ label: "share", value: `${(share * 100).toFixed(1)}%`, color: segment.color }, { label: "total", value: row.format(segment.value) }]}
                      className="flex h-full min-w-0.5 items-center rounded-xs px-1.5 text-xs font-semibold transition-opacity hover:opacity-85"
                      style={{ width: `${share * 100}%`, backgroundColor: segment.color }}
                    >
                      {share >= 0.09 && <span className={segment.ink ?? "text-white"}>{(share * 100).toFixed(0)}%</span>}
                    </ChartHoverOS>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
        {legend.map((entry) => (
          <li key={entry.key} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-zinc-300">
            <span aria-hidden="true" className="size-2 rounded-xs" style={{ backgroundColor: entry.color }} />
            {entry.key}
          </li>
        ))}
      </ul>
    </div>
  );
}
