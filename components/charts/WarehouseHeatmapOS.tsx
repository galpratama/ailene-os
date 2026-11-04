"use client";

import ChartHoverOS, { type ChartTooltipRow } from "@/components/elements/ChartHoverOS";

export type HeatCell = { row: string; column: string; value: number | null; display: string; rows: ChartTooltipRow[]; note?: string };

// Sequential single-hue grid: darker always means more of the chosen measure; empty cells stay blank instead of reading as zero.
export default function WarehouseHeatmapOS({ rows, columns, cells, rowLabel, scaleLabel }: { rows: string[]; columns: string[]; cells: HeatCell[]; rowLabel: string; scaleLabel: string }) {
  const values = cells.map((cell) => cell.value).filter((value): value is number => value !== null);
  const top = values.length ? Math.max(...values) : 0;
  const find = (row: string, column: string) => cells.find((cell) => cell.row === row && cell.column === column);

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-90 gap-0.5" style={{ gridTemplateColumns: `4.5rem repeat(${columns.length}, minmax(4.5rem, 1fr))` }}>
        <div className="px-1 pb-1 text-xs text-gray-500 dark:text-zinc-400">{rowLabel}</div>
        {columns.map((column) => (
          <div key={column} className="px-1 pb-1 text-center text-xs capitalize text-gray-500 dark:text-zinc-400">{column}</div>
        ))}
        {rows.map((row) => (
          <div key={row} className="contents">
            <div className="flex items-center px-1 text-xs font-medium tabular-nums text-gray-700 dark:text-zinc-300">{row}</div>
            {columns.map((column) => {
              const cell = find(row, column);
              const strength = cell?.value != null && top > 0 ? cell.value / top : 0;
              const mix = cell?.value != null ? Math.round(10 + strength * 85) : 0;
              return cell ? (
                <ChartHoverOS
                  key={column}
                  label={`${row}, ${column}: ${cell.display}`}
                  title={`${row} · ${column}`}
                  rows={cell.rows}
                  note={cell.note}
                  className="flex h-10 items-center justify-center rounded-sm text-xs font-semibold tabular-nums transition-opacity hover:opacity-85"
                  style={{ backgroundColor: cell.value != null ? `color-mix(in srgb, var(--viz-1) ${mix}%, var(--card-bg))` : "transparent", color: mix >= 55 ? "white" : "var(--sb-text-strong)", outline: cell.value == null ? "1px solid var(--line-soft)" : undefined }}
                >
                  {cell.display}
                </ChartHoverOS>
              ) : (
                <div key={column} className="flex h-10 items-center justify-center rounded-sm text-xs text-gray-400 outline-1 outline-line-soft dark:text-zinc-500">—</div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
        <span>Less</span>
        <span aria-hidden="true" className="h-2 w-24 rounded-full" style={{ background: "linear-gradient(to right, color-mix(in srgb, var(--viz-1) 10%, var(--card-bg)), var(--viz-1))" }} />
        <span>More {scaleLabel}</span>
      </div>
    </div>
  );
}
