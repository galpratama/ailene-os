"use client";

import { ChartTooltipCard } from "@/components/elements/ChartHoverOS";
import { compact, dateLabel, dateLongLabel, integer } from "@/lib/analytics-warehouse";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type StackSeries = { key: string; color: string };

// Stacked (or side-by-side) date columns: each band keeps its channel color through every filter.
export default function WarehouseStackedTrendOS({
  data,
  series,
  height = 240,
  unit = "sessions",
  stacked = true,
  format = integer,
  axisFormat = compact,
}: {
  data: ({ date: string } & Record<string, number | string>)[];
  series: StackSeries[];
  height?: number;
  unit?: string;
  stacked?: boolean;
  format?: (value: number) => string;
  axisFormat?: (value: number) => string;
}) {
  return (
    <div>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barCategoryGap="20%" accessibilityLayer>
            <CartesianGrid vertical={false} stroke="var(--line-soft)" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} minTickGap={28} tick={{ fill: "var(--sb-text)", fontSize: 11 }} tickFormatter={dateLabel} />
            <YAxis width={axisFormat === compact ? 40 : 60}axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: "var(--sb-text)", fontSize: 11 }} tickFormatter={axisFormat} />
            <Tooltip
              cursor={{ fill: "var(--viz-other)", fillOpacity: 0.12 }}
              content={({ active, label, payload }) => {
                if (!active || !payload?.length) return null;
                const values = stacked ? [...payload].reverse() : [...payload];
                const shown = values.filter((entry) => !stacked || Number(entry.value) > 0);
                const rows = shown.map((entry) => ({ label: String(entry.name), value: format(Number(entry.value)), color: String(entry.color) }));
                const total = shown.reduce((sum, entry) => sum + Number(entry.value), 0);
                return (
                  <ChartTooltipCard
                    title={dateLongLabel(String(label))}
                    rows={rows.length ? rows : [{ label: unit, value: format(0) }]}
                    note={stacked ? `${format(total)} ${unit} in total` : undefined}
                  />
                );
              }}
            />
            {series.map((entry, index) => (
              <Bar
                key={entry.key}
                dataKey={entry.key}
                name={entry.key}
                stackId={stacked ? "channels" : undefined}
                fill={entry.color}
                stroke="var(--card-bg)"
                strokeWidth={1}
                maxBarSize={stacked ? 24 : 14}
                radius={!stacked || index === series.length - 1 ? [4, 4, 0, 0] : 0}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
        {series.map((entry) => (
          <li key={entry.key} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-zinc-300">
            <span aria-hidden="true" className="size-2 rounded-xs" style={{ backgroundColor: entry.color }} />
            {entry.key}
          </li>
        ))}
      </ul>
    </div>
  );
}
