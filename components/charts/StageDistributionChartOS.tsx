"use client";

import { STAGE_CHART_COLORS } from "@/lib/stage-chart-colors";
import type { B2BStageEnum } from "@prisma/client";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type StageDatum = {
  stage: B2BStageEnum;
  label: string;
  count: number;
  percentage: number;
};

export default function StageDistributionChartOS({
  data,
  isLoading,
}: {
  data: StageDatum[];
  isLoading: boolean;
}) {
  const hasData = data.some((entry) => entry.count > 0);

  return (
    <div className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
        Leads by Stage
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
        Current snapshot of every open and closed lead.
      </p>

      {!hasData ? (
        <div className="mt-5 rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center dark:border-zinc-700">
          <p className="text-sm font-semibold text-gray-600 dark:text-zinc-300">
            {isLoading ? "Loading stage distribution…" : "No leads yet"}
          </p>
        </div>
      ) : (
        <div className="mt-5 h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 16, bottom: 0, left: 0 }}
              accessibilityLayer
            >
              <XAxis
                type="number"
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--sb-text)", fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="label"
                axisLine={false}
                tickLine={false}
                width={100}
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
                formatter={(value, _name, item) => [
                  `${value} lead${Number(value) === 1 ? "" : "s"} (${item.payload.percentage.toFixed(1)}%)`,
                  "Count",
                ]}
              />
              <Bar dataKey="count" maxBarSize={28}>
                {data.map((entry) => (
                  <Cell key={entry.stage} fill={STAGE_CHART_COLORS[entry.stage]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
