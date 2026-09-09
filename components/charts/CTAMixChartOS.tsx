"use client";

import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";

export type CTASlice = {
  feature: string;
  label: string;
  clicks: number;
  users: number;
  is_lead: boolean;
};

// Lead-bearing CTAs get the bright end of the ramp; navigation clicks stay muted.
const leadColor = "var(--chart-6)";
const navigationColor = "var(--chart-2)";

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function CTAMixChartOS({ data }: { data: CTASlice[] }) {
  const total = data.reduce((sum, slice) => sum + slice.clicks, 0);
  const leads = data
    .filter((slice) => slice.is_lead)
    .reduce((sum, slice) => sum + slice.clicks, 0);

  // Each ring is drawn against the same 0..max scale so the arcs are comparable.
  const max = Math.max(...data.map((slice) => slice.clicks), 1);
  const rings = [...data]
    .sort((a, b) => b.clicks - a.clicks)
    .map((slice) => ({
      ...slice,
      fill: slice.is_lead ? leadColor : navigationColor,
    }));

  return (
    <div className="rounded-xl border border-gray-300 bg-card-bg p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-zinc-100">
            CTA mix
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Which calls to action visitors actually press.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">
            {total > 0 ? `${((leads / total) * 100).toFixed(1)}%` : "—"}
          </p>
          <p className="text-[11px] text-gray-400">clicks that reach sales</p>
        </div>
      </div>

      {total > 0 ? (
        <>
          <div className="mt-3 h-45 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                data={rings}
                innerRadius="32%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                barSize={14}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, max]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar
                  dataKey="clicks"
                  background={{ fill: "var(--dashboard-border)" }}
                  cornerRadius={7}
                  animationDuration={500}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          <ul className="mt-2 flex flex-col gap-2">
            {rings.map((slice) => (
              <li key={slice.feature} className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.fill }}
                />
                <span className="min-w-0 flex-1 truncate text-sm text-gray-600 dark:text-zinc-300">
                  {slice.label}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                  {compactNumber(slice.clicks)}
                </span>
                <span className="w-12 text-right text-xs text-gray-400">
                  {((slice.clicks / total) * 100).toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="py-14 text-center text-sm text-gray-400">
          No CTA clicks for this period.
        </p>
      )}
    </div>
  );
}
