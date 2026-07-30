"use client";

import { STAGE_CHART_COLORS } from "@/components/charts/stageChartColors";
import type { B2BStageEnum } from "@prisma/client";
import {
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type FunnelDatum = {
  stage: B2BStageEnum;
  label: string;
  count: number;
  percentage: number;
};

export default function PipelineFunnelChartOS({
  data,
  isLoading,
}: {
  data: FunnelDatum[];
  isLoading: boolean;
}) {
  const hasData = data.some((entry) => entry.count > 0);

  return (
    <div className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
        Conversion Funnel
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
        Lead Identified through Closed Won, live counts.
      </p>

      {!hasData ? (
        <div className="mt-5 rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center dark:border-zinc-700">
          <p className="text-sm font-semibold text-gray-600 dark:text-zinc-300">
            {isLoading ? "Loading funnel…" : "No leads in the funnel yet"}
          </p>
        </div>
      ) : (
        <div className="mt-5 h-70 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--dashboard-border)",
                  borderRadius: 12,
                  color: "var(--foreground)",
                  fontSize: 12,
                }}
                itemStyle={{ fontSize: 12 }}
                formatter={(value, _name, item) => [
                  `${value} lead${Number(value) === 1 ? "" : "s"} (${item.payload.percentage.toFixed(1)}%)`,
                  item.payload.label,
                ]}
              />
              <Funnel dataKey="count" data={data} isAnimationActive>
                <LabelList
                  position="right"
                  dataKey="label"
                  fill="var(--foreground)"
                  stroke="none"
                  fontSize={12}
                />
                {data.map((entry) => (
                  <Cell key={entry.stage} fill={STAGE_CHART_COLORS[entry.stage]} />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
