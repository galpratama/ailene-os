"use client";

import ChartHoverOS from "@/components/elements/ChartHoverOS";
import { dateLabel, daysBetween } from "@/lib/analytics-warehouse";

export type CoverageRow = { key: string; label: string; first: string | null; last: string | null };

// A Gantt of what each dataset holds, with the selected period as a band: any gap inside the band is a day with no data.
export default function WarehouseCoverageChartOS({ rows, start, end, today }: { rows: CoverageRow[]; start: string; end: string; today: string }) {
  const firsts = rows.map((row) => row.first).filter((value): value is string => !!value);
  const axisStart = [...firsts, start].sort()[0];
  const axisEnd = [today, end].sort().at(-1) as string;
  const span = Math.max(daysBetween(axisStart, axisEnd) + 1, 1);
  const offset = (value: string) => (daysBetween(axisStart, value) / span) * 100;
  const width = (from: string, to: string) => ((daysBetween(from, to) + 1) / span) * 100;

  return (
    <div>
      <div className="relative">
        <div aria-hidden="true" className="absolute inset-y-0 rounded-sm bg-viz-4/10 ring-1 ring-inset ring-viz-4/40" style={{ left: `calc(9.5rem + (100% - 9.5rem) * ${offset(start) / 100})`, width: `calc((100% - 9.5rem) * ${width(start, end) / 100})` }} />
        <ul className="relative flex flex-col gap-2 py-1">
          {rows.map((row) => (
            <li key={row.key} className="grid grid-cols-[9.5rem_1fr] items-center">
              <span className="truncate pr-2 text-xs text-gray-700 dark:text-zinc-300">{row.label}</span>
              <div className="relative h-4">
                {row.first && row.last ? (
                  <ChartHoverOS
                    label={`${row.label}: ${dateLabel(row.first)} to ${dateLabel(row.last)}`}
                    title={row.label}
                    rows={[
                      { label: "first day", value: dateLabel(row.first) },
                      { label: "latest day", value: dateLabel(row.last) },
                      { label: "days held", value: String(daysBetween(row.first, row.last) + 1) },
                    ]}
                    className="absolute inset-y-0 rounded-sm bg-viz-1"
                    style={{ left: `${offset(row.first)}%`, width: `${width(row.first, row.last)}%` }}
                  />
                ) : (
                  <span className="text-xs text-gray-500 dark:text-zinc-400">No data</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2 grid grid-cols-[9.5rem_1fr] text-xs tabular-nums text-gray-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5"><span aria-hidden="true" className="size-2 rounded-xs bg-viz-4/30 ring-1 ring-viz-4/60" />Selected period</span>
        <div className="flex justify-between"><span>{dateLabel(axisStart)}</span><span>{dateLabel(axisEnd)}</span></div>
      </div>
    </div>
  );
}
