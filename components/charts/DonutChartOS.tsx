"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export type DonutSlice = {
  key: string;
  label: string;
  value: number;
};

// Categorical, so the pastel tokens rather than the ordered chart ramp.
const sliceColors = [
  "var(--claude)",
  "var(--toska)",
  "var(--biru)",
  "var(--ungu)",
  "var(--amber)",
  "var(--coral)",
  "var(--pink)",
];

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function DonutChartOS({
  data,
  title,
  description,
  centerLabel,
}: {
  data: DonutSlice[];
  title: string;
  description: string;
  centerLabel: string;
}) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);
  const hasData = total > 0;

  return (
    <div className="rounded-xl border border-gray-300 bg-card-bg p-5">
      <div>
        <h3 className="font-bold text-gray-900 dark:text-zinc-100">{title}</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          {description}
        </p>
      </div>

      {hasData ? (
        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative h-45 w-45 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius="62%"
                  outerRadius="100%"
                  paddingAngle={2}
                  stroke="var(--card-bg)"
                  strokeWidth={2}
                  animationDuration={500}
                >
                  {data.map((slice, index) => (
                    <Cell
                      key={slice.key}
                      fill={sliceColors[index % sliceColors.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--dashboard-border)",
                    borderRadius: 12,
                    color: "var(--foreground)",
                    boxShadow:
                      "0 8px 24px color-mix(in srgb, var(--foreground) 12%, transparent)",
                  }}
                  formatter={(value, name) => [
                    `${compactNumber(Number(value))} (${(
                      (Number(value) / total) *
                      100
                    ).toFixed(1)}%)`,
                    String(name),
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Pointer events off so the hole never swallows a slice hover. */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xl font-bold text-gray-900 dark:text-zinc-100">
                {compactNumber(total)}
              </p>
              <p className="text-[11px] text-gray-400">{centerLabel}</p>
            </div>
          </div>

          <ul className="flex w-full min-w-0 flex-col gap-2">
            {data.map((slice, index) => (
              <li key={slice.key} className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: sliceColors[index % sliceColors.length],
                  }}
                />
                <span className="min-w-0 flex-1 truncate text-sm text-gray-600 dark:text-zinc-300">
                  {slice.label}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                  {((slice.value / total) * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="py-14 text-center text-sm text-gray-400">
          No data for this period.
        </p>
      )}
    </div>
  );
}
