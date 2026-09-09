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

export type ScrollDepthPoint = {
  id: string;
  label: string;
  position: number;
  views: number;
  viewers: number;
  clicks: number;
  reach_rate: number | null;
};

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

// Bars run downward in scroll order, so the chart reads like the page itself.
export default function ScrollDepthChartOS({
  data,
}: {
  data: ScrollDepthPoint[];
}) {
  const deepest = data.filter((point) => point.viewers > 0).at(-1);

  return (
    <div className="rounded-xl border border-gray-300 bg-card-bg p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-zinc-100">
            Scroll depth
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            How far down the landing page visitors actually get.
          </p>
        </div>
        {deepest && (
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">
              {deepest.label}
            </p>
            <p className="text-[11px] text-gray-400">deepest section reached</p>
          </div>
        )}
      </div>

      <div className="mt-5 h-95 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
            accessibilityLayer
          >
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              tick={{ fill: "var(--sb-text)", fontSize: 11 }}
              tickFormatter={(value: number) => compactNumber(value)}
            />
            <YAxis
              type="category"
              dataKey="label"
              axisLine={false}
              tickLine={false}
              width={110}
              interval={0}
              tick={{ fill: "var(--sb-text)", fontSize: 11 }}
            />
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
              formatter={(value, _name, item) => {
                const point = item.payload as ScrollDepthPoint;
                return [
                  `${compactNumber(Number(value))}${
                    point.reach_rate === null
                      ? ""
                      : ` · ${point.reach_rate.toFixed(1)}% of the first section`
                  }`,
                  "Viewers",
                ];
              }}
            />
            <Bar dataKey="viewers" radius={[0, 4, 4, 0]} animationDuration={500}>
              {data.map((point, index) => (
                <Cell
                  key={point.id}
                  // Later sections shade lighter, reinforcing the descent.
                  fill={`var(--chart-${Math.min(
                    6,
                    1 + Math.floor((index / Math.max(data.length - 1, 1)) * 5)
                  )})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
