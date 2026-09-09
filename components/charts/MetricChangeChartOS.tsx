"use client";

import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type MetricChange = {
  key: string;
  label: string;
  current: number;
  previous: number;
  change: number | null;
};

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

// Percent change puts wildly different magnitudes on one axis; raw counts would flatten leads.
export default function MetricChangeChartOS({
  data,
  periodLabel,
}: {
  data: MetricChange[];
  periodLabel: string;
}) {
  const points = data.map((metric) => ({
    ...metric,
    // No baseline means no percentage: plot at zero and let the tooltip say why.
    plotted: metric.change ?? 0,
  }));
  const bound = Math.max(
    ...points.map((point) => Math.abs(point.plotted)),
    10
  );

  return (
    <div className="rounded-xl border border-gray-300 bg-card-bg p-5">
      <div>
        <h3 className="font-bold text-gray-900 dark:text-zinc-100">
          Period over period
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          Change against {periodLabel}.
        </p>
      </div>

      <div className="mt-5 h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={points}
            layout="vertical"
            margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
            accessibilityLayer
          >
            <XAxis
              type="number"
              domain={[-bound, bound]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--sb-text)", fontSize: 11 }}
              tickFormatter={(value: number) => `${value.toFixed(0)}%`}
            />
            <YAxis
              type="category"
              dataKey="label"
              axisLine={false}
              tickLine={false}
              width={92}
              interval={0}
              tick={{ fill: "var(--sb-text)", fontSize: 11 }}
            />
            <ReferenceLine x={0} stroke="var(--dashboard-border)" />
            <Tooltip
              cursor={{ fill: "var(--dashboard-border)", fillOpacity: 0.35 }}
              contentStyle={{
                backgroundColor: "var(--card-bg)",
                borderColor: "var(--dashboard-border)",
                borderRadius: 12,
                color: "var(--foreground)",
                boxShadow:
                  "0 8px 24px color-mix(in srgb, var(--foreground) 12%, transparent)",
              }}
              labelStyle={{ color: "var(--foreground)", fontWeight: 700 }}
              formatter={(_value, _name, item) => {
                const point = item.payload as (typeof points)[number];
                return [
                  `${compactNumber(point.current)} vs ${compactNumber(
                    point.previous
                  )}${
                    point.change === null
                      ? " (no baseline)"
                      : ` · ${point.change >= 0 ? "+" : ""}${point.change.toFixed(1)}%`
                  }`,
                  "Now vs before",
                ];
              }}
            />
            <Bar dataKey="plotted" radius={4} animationDuration={500}>
              {points.map((point) => (
                <Cell
                  key={point.key}
                  fill={point.plotted >= 0 ? "var(--hijau)" : "var(--merah)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
