"use client";

import { getShortAccountCurrency } from "@/lib/currency";
import { useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type MetaTrendPoint = {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  link_clicks: number;
  results: number;
  cpm: number;
  cpc: number;
  ctr: number;
  cost_per_result: number;
};

type EfficiencyKey = "cpm" | "cpc" | "cost_per_result" | "ctr";

const efficiencyMetrics: {
  key: EfficiencyKey;
  label: string;
  kind: "currency" | "percent";
}[] = [
  { key: "cpm", label: "CPM", kind: "currency" },
  { key: "cpc", label: "CPC", kind: "currency" },
  { key: "cost_per_result", label: "Cost / result", kind: "currency" },
  { key: "ctr", label: "CTR", kind: "percent" },
];

function shortDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function longDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Spend and an efficiency rate share an x-axis but never a scale, so each gets its own.
export default function MetaSpendTrendChartOS({
  data,
  currency,
}: {
  data: MetaTrendPoint[];
  currency: string;
}) {
  const [metricKey, setMetricKey] = useState<EfficiencyKey>("cpm");
  const activeMetric =
    efficiencyMetrics.find((entry) => entry.key === metricKey) ??
    efficiencyMetrics[0];

  function formatEfficiency(value: number) {
    return activeMetric.kind === "percent"
      ? `${value.toFixed(2)}%`
      : getShortAccountCurrency(value, currency);
  }

  return (
    <div className="rounded-xl border border-gray-300 bg-card-bg p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-zinc-100">
            Spend and efficiency
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Daily spend as bars, with the cost metric you pick tracked on top.
          </p>
        </div>
        <div className="flex flex-wrap rounded-lg border border-gray-300 bg-gray-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
          {efficiencyMetrics.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => setMetricKey(entry.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeMetric.key === entry.key
                  ? "bg-lime-bright text-forest-deep"
                  : "text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 h-65 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            accessibilityLayer
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--dashboard-border)"
              strokeDasharray="4 6"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              minTickGap={36}
              tick={{ fill: "var(--sb-text)", fontSize: 11 }}
              tickFormatter={shortDate}
            />
            <YAxis
              yAxisId="spend"
              axisLine={false}
              tickLine={false}
              width={58}
              tick={{ fill: "var(--sb-text)", fontSize: 11 }}
              tickFormatter={(value: number) =>
                getShortAccountCurrency(value, currency)
              }
            />
            <YAxis
              yAxisId="efficiency"
              orientation="right"
              axisLine={false}
              tickLine={false}
              width={58}
              tick={{ fill: "var(--sb-text)", fontSize: 11 }}
              tickFormatter={formatEfficiency}
            />
            <Tooltip
              cursor={{ fill: "color-mix(in srgb, var(--claude) 8%, transparent)" }}
              contentStyle={{
                backgroundColor: "var(--card-bg)",
                borderColor: "var(--dashboard-border)",
                borderRadius: 12,
                color: "var(--foreground)",
                boxShadow:
                  "0 8px 24px color-mix(in srgb, var(--foreground) 12%, transparent)",
              }}
              labelStyle={{ color: "var(--foreground)", fontWeight: 700 }}
              labelFormatter={(label) => longDate(String(label))}
              formatter={(value, name) => [
                name === "Spend"
                  ? getShortAccountCurrency(Number(value), currency)
                  : formatEfficiency(Number(value)),
                String(name),
              ]}
            />
            <Bar
              yAxisId="spend"
              dataKey="spend"
              name="Spend"
              fill="var(--chart-4)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
              animationDuration={500}
            />
            <Line
              yAxisId="efficiency"
              type="monotone"
              dataKey={activeMetric.key}
              name={activeMetric.label}
              stroke="var(--claude)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                fill: "var(--card-bg)",
                stroke: "var(--claude)",
                strokeWidth: 3,
              }}
              animationDuration={500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
