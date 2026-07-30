"use client";

import type { B2BLostReasonEnum } from "@prisma/client";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type ReasonDatum = {
  reason: B2BLostReasonEnum | null;
  label: string;
  count: number;
};

const REASON_COLORS = [
  "var(--merah)",
  "var(--kuning)",
  "var(--pink)",
  "var(--biru)",
  "var(--oranye)",
  "var(--hijau)",
  "var(--claude)",
  "#9ca3af",
];

export default function LostReasonChartOS({
  data,
  isLoading,
}: {
  data: ReasonDatum[];
  isLoading: boolean;
}) {
  const hasData = data.length > 0 && data.some((entry) => entry.count > 0);

  return (
    <div className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
        This Week&apos;s Lost Reasons
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
        Why leads stalled or died this week.
      </p>

      {!hasData ? (
        <div className="mt-5 rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center dark:border-zinc-700">
          <p className="text-sm font-semibold text-gray-600 dark:text-zinc-300">
            {isLoading ? "Loading reasons…" : "No stalled or lost leads this week"}
          </p>
        </div>
      ) : (
        <div className="mt-5 h-70 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
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
                  `${value} lead${Number(value) === 1 ? "" : "s"}`,
                  item.payload.label,
                ]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Pie
                data={data}
                dataKey="count"
                nameKey="label"
                innerRadius="45%"
                outerRadius="80%"
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.reason ?? "unspecified"}
                    fill={REASON_COLORS[index % REASON_COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
