"use client";

import { STAGE_CHART_COLORS } from "@/lib/stage-chart-colors";
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

// recharts v3 has no minSize/minWidth on <Funnel>; it scales each trapezoid
// purely by value/maxValue. So a tiny stage (count 1 vs max 58) collapses to
// nearly 0 width. This custom shape clamps a minimum width so every stage
// stays visible and the funnel reads proportionally even with small data.
const MIN_WIDTH = 28;

function FunnelTrapezoidShape(props: any) {
  const {
    x,
    y,
    upperWidth,
    lowerWidth,
    height,
    stroke,
    strokeWidth,
    payload,
  } = props;

  const clampedUpper = Math.max(upperWidth ?? 0, MIN_WIDTH);
  const clampedLower = Math.max(lowerWidth ?? 0, MIN_WIDTH);
  const widthGap = clampedUpper - clampedLower;
  // re-center the (now wider) trapezoid around its original center.
  const centerX = (x ?? 0) + (upperWidth ?? 0) / 2;
  const left = centerX - clampedUpper / 2;

  const path = [
    `M ${left},${y}`,
    `L ${left + clampedUpper},${y}`,
    `L ${left + clampedUpper - widthGap / 2},${y + height}`,
    `L ${left + clampedUpper - widthGap / 2 - clampedLower},${y + height}`,
    "Z",
  ].join(" ");

  const fill = payload?.stage
    ? STAGE_CHART_COLORS[payload.stage as B2BStageEnum]
    : "var(--biru)";

  return (
    <path
      d={path}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    >
      {payload?.count != null && (
        <title>{`${payload.label}: ${payload.count} (${Number(
          payload.percentage
        ).toFixed(1)}%)`}</title>
      )}
    </path>
  );
}

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
      <p className="text-base font-semibold capitalize text-gray-900 dark:text-zinc-100">
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
            <FunnelChart margin={{ top: 8, right: 110, bottom: 8, left: 24 }}>
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
                  `${value} lead${Number(value) === 1 ? "" : "s"} (${Number(
                    item.payload.percentage
                  ).toFixed(1)}%)`,
                  item.payload.label,
                ]}
              />
              <Funnel
                dataKey="count"
                data={data}
                isAnimationActive
                shape={<FunnelTrapezoidShape />}
                stroke="var(--card-bg)"
                strokeWidth={2}
              >
                <LabelList
                  position="right"
                  dataKey="label"
                  fill="var(--foreground)"
                  stroke="none"
                  fontSize={12}
                />
                <LabelList
                  position="center"
                  dataKey="count"
                  fill="var(--foreground)"
                  stroke="none"
                  fontSize={12}
                  fontWeight={700}
                />
                {data.map((entry) => (
                  <Cell
                    key={entry.stage}
                    fill={STAGE_CHART_COLORS[entry.stage]}
                  />
                ))}
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
