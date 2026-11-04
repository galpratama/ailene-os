"use client";

import { ChartTooltipCard } from "@/components/elements/ChartHoverOS";
import { compact, dateLabel, dateLongLabel, integer } from "@/lib/analytics-warehouse";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type StackSeries = { key: string; color: string };

// Stacked daily columns: total height is the day's volume, and each band keeps its channel color through every filter.
export default function WarehouseStackedTrendOS({ data, series, height = 240 }: { data: ({ date: string } & Record<string, number | string>)[]; series: StackSeries[]; height?: number }) {
  return (
    <div>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barCategoryGap="20%" accessibilityLayer>
            <CartesianGrid vertical={false} stroke="var(--line-soft)" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} minTickGap={28} tick={{ fill: "var(--sb-text)", fontSize: 11 }} tickFormatter={dateLabel} />
            <YAxis width={40} axisLine={false} tickLine={false} allowDecimals={false} tick={{ fill: "var(--sb-text)", fontSize: 11 }} tickFormatter={compact} />
            <Tooltip
              cursor={{ fill: "var(--viz-other)", fillOpacity: 0.12 }}
              content={({ active, label, payload }) => {
                if (!active || !payload?.length) return null;
                const rows = [...payload].filter((entry) => Number(entry.value) > 0).reverse().map((entry) => ({ label: String(entry.name), value: integer(Number(entry.value)), color: String(entry.color) }));
                const total = rows.reduce((sum, row) => sum + Number(row.value.replaceAll(",", "")), 0);
                return <ChartTooltipCard title={dateLongLabel(String(label))} rows={rows.length ? rows : [{ label: "sessions", value: "0" }]} note={`${integer(total)} sessions in total`} />;
              }}
            />
            {series.map((entry, index) => (
              <Bar key={entry.key} dataKey={entry.key} name={entry.key} stackId="channels" fill={entry.color} stroke="var(--card-bg)" strokeWidth={1} maxBarSize={24} radius={index === series.length - 1 ? [4, 4, 0, 0] : 0} isAnimationActive={false} />
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
