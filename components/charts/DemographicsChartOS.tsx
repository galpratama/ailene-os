"use client";

import { getShortAccountCurrency } from "@/lib/currency";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type DemographicEntry = {
  key: string;
  age: string;
  gender: string;
  spend: number;
  impressions: number;
  results: number;
  link_clicks: number;
};

type DemographicMetricKey = "spend" | "results" | "impressions" | "link_clicks";

const demographicMetrics: { key: DemographicMetricKey; label: string }[] = [
  { key: "spend", label: "Spend" },
  { key: "results", label: "Results" },
  { key: "impressions", label: "Impressions" },
  { key: "link_clicks", label: "Link clicks" },
];

// Meta's own bracket order; anything it does not recognize sorts to the end.
const AGE_ORDER = [
  "13-17",
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55-64",
  "65+",
];

const genderSeries = [
  { key: "Female", color: "var(--rose)" },
  { key: "Male", color: "var(--azure)" },
  { key: "Unknown", color: "var(--chart-4)" },
];

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function DemographicsChartOS({
  data,
  currency,
}: {
  data: DemographicEntry[];
  currency: string;
}) {
  const [metricKey, setMetricKey] = useState<DemographicMetricKey>("spend");
  const activeMetric =
    demographicMetrics.find((entry) => entry.key === metricKey) ??
    demographicMetrics[0];

  function formatValue(value: number) {
    return activeMetric.key === "spend"
      ? getShortAccountCurrency(value, currency)
      : compactNumber(value);
  }

  // The API returns one row per age/gender pair; the chart wants one row per age.
  const points = useMemo(() => {
    const byAge = new Map<string, Record<string, number | string>>();
    for (const entry of data) {
      const row = byAge.get(entry.age) ?? { age: entry.age };
      const series = genderSeries.some((gender) => gender.key === entry.gender)
        ? entry.gender
        : "Unknown";
      row[series] = Number(row[series] ?? 0) + entry[metricKey];
      byAge.set(entry.age, row);
    }

    return [...byAge.values()].sort((a, b) => {
      const first = AGE_ORDER.indexOf(String(a.age));
      const second = AGE_ORDER.indexOf(String(b.age));
      return (
        (first < 0 ? AGE_ORDER.length : first) -
        (second < 0 ? AGE_ORDER.length : second)
      );
    });
  }, [data, metricKey]);

  return (
    <div className="rounded-xl border border-gray-300 bg-card-bg p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-zinc-100">
            Age and gender
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Who the budget actually reached, by reported age bracket.
          </p>
        </div>
        <div className="flex flex-wrap rounded-lg border border-gray-300 bg-gray-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
          {demographicMetrics.map((entry) => (
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

      {points.length > 0 ? (
        <div className="mt-5 h-65 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={points}
              margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
              accessibilityLayer
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--dashboard-border)"
                strokeDasharray="4 6"
              />
              <XAxis
                dataKey="age"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--sb-text)", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={58}
                tick={{ fill: "var(--sb-text)", fontSize: 11 }}
                tickFormatter={formatValue}
              />
              <Tooltip
                cursor={{
                  fill: "color-mix(in srgb, var(--claude) 8%, transparent)",
                }}
                contentStyle={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--dashboard-border)",
                  borderRadius: 12,
                  color: "var(--foreground)",
                  boxShadow:
                    "0 8px 24px color-mix(in srgb, var(--foreground) 12%, transparent)",
                }}
                labelStyle={{ color: "var(--foreground)", fontWeight: 700 }}
                formatter={(value, name) => [formatValue(Number(value)), String(name)]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              {genderSeries.map((gender) => (
                <Bar
                  key={gender.key}
                  dataKey={gender.key}
                  name={gender.key}
                  fill={gender.color}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={26}
                  animationDuration={500}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="py-14 text-center text-sm text-gray-400">
          No demographic data for this period.
        </p>
      )}
    </div>
  );
}
