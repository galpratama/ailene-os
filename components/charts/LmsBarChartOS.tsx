"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type LmsBarDatum = {
  key: string;
  label: string;
  value: number;
  color: string;
  highlight?: boolean;
};

export default function LmsBarChartOS({
  data,
  unit,
  height = 220,
}: {
  data: LmsBarDatum[];
  unit: (value: number) => string;
  height?: number;
}) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -24 }} accessibilityLayer>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval={0}
            tick={{ fill: "var(--sb-text)", fontSize: 11 }}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--sb-text)", fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: "var(--dashboard-border)", opacity: 0.3 }}
            contentStyle={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--dashboard-border)",
              borderRadius: 12,
              color: "var(--foreground)",
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--foreground)", fontWeight: 700 }}
            formatter={(value) => [unit(Number(value)), ""]}
            separator=""
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={44} animationDuration={600}>
            {data.map((entry) => (
              <Cell
                key={entry.key}
                fill={entry.color}
                fillOpacity={entry.highlight === false ? 0.45 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
