"use client";

import { ChartTooltipCard } from "@/components/elements/ChartHoverOS";
import { count, money, monthName } from "@/lib/revenue";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type MonthBar = { month: string; partial: boolean; revenue: number; closings: number };

// Closed revenue per month; a month still in progress is drawn lighter so it is not read as a fall.
export default function RevenueMonthBarsOS({ data, height = 240 }: { data: MonthBar[]; height?: number }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barCategoryGap="28%" accessibilityLayer>
          <CartesianGrid vertical={false} stroke="var(--line-soft)" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--sb-text)", fontSize: 11 }} tickFormatter={monthName} />
          <YAxis width={56} axisLine={false} tickLine={false} tick={{ fill: "var(--sb-text)", fontSize: 11 }} tickFormatter={(value: number) => money(value)} />
          <Tooltip
            cursor={{ fill: "var(--viz-other)", fillOpacity: 0.12 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const row = payload[0].payload as MonthBar;
              return (
                <ChartTooltipCard
                  title={`${monthName(row.month)} ${row.month.slice(0, 4)}${row.partial ? " (to date)" : ""}`}
                  rows={[
                    { label: "revenue closed", value: money(row.revenue), color: "var(--viz-4)" },
                    { label: "closings", value: count(row.closings) },
                  ]}
                />
              );
            }}
          />
          <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false}>
            {data.map((row) => (
              <Cell key={row.month} fill="var(--viz-4)" fillOpacity={row.partial ? 0.45 : 1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
