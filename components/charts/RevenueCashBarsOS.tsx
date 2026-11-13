"use client";

import { ChartTooltipCard } from "@/components/elements/ChartHoverOS";
import { money, monthName } from "@/lib/revenue";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type CashMonth = { month: string; partial: boolean; invoiced: number; collected: number };

const series = [
  { key: "invoiced", label: "Invoiced", color: "var(--viz-1)" },
  { key: "collected", label: "Collected", color: "var(--viz-2)" },
] as const;

// Invoiced against collected per month, side by side on one rupiah axis.
export default function RevenueCashBarsOS({ data, height = 240 }: { data: CashMonth[]; height?: number }) {
  return (
    <div className="w-full">
      <div className="mb-2 flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-zinc-300">
        {series.map((entry) => (
          <span key={entry.key} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
            {entry.label}
          </span>
        ))}
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barCategoryGap="24%" barGap={2} accessibilityLayer>
            <CartesianGrid vertical={false} stroke="var(--line-soft)" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--sb-text)", fontSize: 11 }} tickFormatter={monthName} />
            <YAxis width={56} axisLine={false} tickLine={false} tick={{ fill: "var(--sb-text)", fontSize: 11 }} tickFormatter={(value: number) => money(value)} />
            <Tooltip
              cursor={{ fill: "var(--viz-other)", fillOpacity: 0.12 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as CashMonth;
                return (
                  <ChartTooltipCard
                    title={`${monthName(row.month)} ${row.month.slice(0, 4)}${row.partial ? " (partial range)" : ""}`}
                    rows={series.map((entry) => ({ label: entry.label.toLowerCase(), value: money(row[entry.key]), color: entry.color }))}
                  />
                );
              }}
            />
            {series.map((entry) => (
              <Bar key={entry.key} dataKey={entry.key} name={entry.label} fill={entry.color} radius={[4, 4, 0, 0]} maxBarSize={28} isAnimationActive={false} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
