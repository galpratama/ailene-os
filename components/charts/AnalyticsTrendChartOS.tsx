"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TrendPoint = {
  date: string;
  sessions: number;
  users: number;
  revenue: number;
};

type TrendMetric = "sessions" | "users";

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

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

export default function AnalyticsTrendChartOS({
  data,
}: {
  data: TrendPoint[];
}) {
  const [metric, setMetric] = useState<TrendMetric>("sessions");
  const metricLabel = metric === "sessions" ? "Sessions" : "Active Users";

  return (
    <div className="rounded-xl border border-gray-300 bg-card-bg p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-zinc-100">
            Traffic trend
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Daily movement across the selected websites.
          </p>
        </div>
        <div className="flex rounded-lg border border-gray-300 bg-gray-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
          {(["sessions", "users"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMetric(value)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                metric === value
                  ? "bg-claude text-white"
                  : "text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 h-65 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
            accessibilityLayer
          >
            <defs>
              <linearGradient id="trackingTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--claude)"
                  stopOpacity={0.24}
                />
                <stop
                  offset="95%"
                  stopColor="var(--claude)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
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
              axisLine={false}
              tickLine={false}
              width={42}
              allowDecimals={false}
              tick={{ fill: "var(--sb-text)", fontSize: 11 }}
              tickFormatter={(value: number) => compactNumber(value)}
            />
            <Tooltip
              cursor={{ stroke: "var(--claude)", strokeDasharray: "3 3" }}
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
              formatter={(value) => [
                compactNumber(Number(value)),
                metricLabel,
              ]}
            />
            <Area
              key={metric}
              type="monotone"
              dataKey={metric}
              name={metricLabel}
              stroke="var(--claude)"
              strokeWidth={3}
              fill="url(#trackingTrendFill)"
              activeDot={{
                r: 5,
                fill: "var(--card-bg)",
                stroke: "var(--claude)",
                strokeWidth: 3,
              }}
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
