"use client";

import { ChartTooltipCard } from "@/components/elements/ChartHoverOS";
import { count, money, monthName } from "@/lib/revenue";
import { Bar, CartesianGrid, Cell, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type MonthBar = { month: string; partial: boolean; revenue: number; closings: number; target?: number | null };

const TARGET_STROKE = "var(--sb-text)";

// Closed revenue per month; partly covered months are drawn lighter, and a dashed line marks the monthly target when one is set.
export default function RevenueMonthBarsOS({ data, height = 240 }: { data: MonthBar[]; height?: number }) {
  const hasTarget = data.some((row) => row.target !== null && row.target !== undefined);
  return (
    <div className="w-full">
      {hasTarget && (
        <div className="mb-2 flex flex-wrap items-center gap-4 text-xs text-gray-600 dark:text-zinc-300">
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2.5 rounded-sm" style={{ backgroundColor: "var(--viz-4)" }} />
            Revenue closed
          </span>
          <span className="flex items-center gap-1.5">
            <span aria-hidden="true" className="w-4 border-t-2 border-dashed" style={{ borderColor: TARGET_STROKE }} />
            Target
          </span>
        </div>
      )}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barCategoryGap="28%" accessibilityLayer>
            <CartesianGrid vertical={false} stroke="var(--line-soft)" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--sb-text)", fontSize: 11 }} tickFormatter={monthName} />
            <YAxis width={56} axisLine={false} tickLine={false} tick={{ fill: "var(--sb-text)", fontSize: 11 }} tickFormatter={(value: number) => money(value)} />
            <Tooltip
              cursor={{ fill: "var(--viz-other)", fillOpacity: 0.12 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload as MonthBar;
                const rows = [
                  { label: "revenue closed", value: money(row.revenue), color: "var(--viz-4)" },
                  { label: "closings", value: count(row.closings) },
                ];
                if (hasTarget) rows.splice(1, 0, { label: "target", value: row.target === null || row.target === undefined ? "not set" : money(row.target), color: TARGET_STROKE });
                return <ChartTooltipCard title={`${monthName(row.month)} ${row.month.slice(0, 4)}${row.partial ? " (partial range)" : ""}`} rows={rows} />;
              }}
            />
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false}>
              {data.map((row) => (
                <Cell key={row.month} fill="var(--viz-4)" fillOpacity={row.partial ? 0.45 : 1} />
              ))}
            </Bar>
            {hasTarget && (
              <Line
                dataKey="target"
                type="linear"
                stroke={TARGET_STROKE}
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={{ r: 4, fill: TARGET_STROKE, stroke: "var(--card-bg)", strokeWidth: 2 }}
                activeDot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
