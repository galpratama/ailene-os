"use client";

import type { B2BStageEnum } from "@prisma/client";
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

type ConversionDatum = {
  stage: B2BStageEnum;
  label: string;
  this_week: number;
  trailing_avg: number;
  delta_pct: number | null;
};

function formatShortDate(value: string | Date) {
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

function formatDateRange(start: string | Date, end: string | Date) {
  return `${formatShortDate(start)} – ${formatShortDate(end)}`;
}

export default function WeeklyConversionChartOS({
  data,
  weekStart,
  weekEnd,
  trailingStart,
  trailingEnd,
  isLoading,
}: {
  data: ConversionDatum[];
  weekStart: string | Date;
  weekEnd: string | Date;
  trailingStart: string | Date;
  trailingEnd: string | Date;
  isLoading: boolean;
}) {
  const hasData = data.some(
    (entry) => entry.this_week > 0 || entry.trailing_avg > 0
  );
  const weekRange = formatDateRange(weekStart, weekEnd);
  const trailingRange = formatDateRange(trailingStart, trailingEnd);

  return (
    <div className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
        Weekly Conversion
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
        This week ({weekRange}) vs. the trailing 4-week average ({trailingRange}).
      </p>

      {!hasData ? (
        <div className="mt-5 rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center dark:border-zinc-700">
          <p className="text-sm font-semibold text-gray-600 dark:text-zinc-300">
            {isLoading ? "Loading conversion trend…" : "No stage movement yet"}
          </p>
        </div>
      ) : (
        <div className="mt-5 h-70 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
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
                dataKey="label"
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={50}
                tick={{ fill: "var(--sb-text)", fontSize: 11 }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                width={32}
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
                itemStyle={{ fontSize: 12 }}
                labelStyle={{
                  color: "var(--foreground)",
                  fontWeight: 700,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="this_week"
                name={`This week (${weekRange})`}
                fill="var(--claude)"
                radius={[4, 4, 0, 0]}
                maxBarSize={22}
              />
              <Bar
                dataKey="trailing_avg"
                name={`Trailing avg (${trailingRange})`}
                fill="var(--dashboard-border)"
                radius={[4, 4, 0, 0]}
                maxBarSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
