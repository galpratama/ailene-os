"use client";

import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type LmsPrePostDatum = {
  label: string;
  pre: number | null;
  post: number | null;
};

export default function LmsPrePostChartOS({
  data,
  height = 260,
}: {
  data: LmsPrePostDatum[];
  height?: number;
}) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -24 }} barGap={4} accessibilityLayer>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            interval={0}
            tick={{ fill: "var(--sb-text)", fontSize: 11 }}
            tickFormatter={(value: string) =>
              value.length > 14 ? `${value.slice(0, 13)}…` : value
            }
          />
          <YAxis
            domain={[0, 100]}
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
            formatter={(value, name) => [
              value === null || value === undefined ? "—" : Number(value).toFixed(1),
              String(name),
            ]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: "var(--sb-text)" }}
          />
          <Bar name="Pre-test" dataKey="pre" fill="var(--biru)" radius={[6, 6, 0, 0]} maxBarSize={28} animationDuration={600} />
          <Bar name="Post-test" dataKey="post" fill="var(--claude)" radius={[6, 6, 0, 0]} maxBarSize={28} animationDuration={600} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
