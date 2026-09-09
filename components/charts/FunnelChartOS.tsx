"use client";

import { ArrowDown } from "lucide-react";

export type FunnelStage = {
  key: string;
  label: string;
  hint: string;
  users: number;
  count: number;
  drop_off: number;
  drop_off_rate: number | null;
  from_previous_rate: number | null;
  from_entry_rate: number | null;
};

// Forest -> lime, so the eye follows the funnel down to the conversion.
const stageColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-6)",
];

// Floor width so a near-zero stage stays visible; the number beside it carries the real value.
const MIN_WIDTH_RATIO = 0.12;

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

// Half the width the band loses on each side, as a percentage of the row.
function inset(ratio: number) {
  return ((1 - Math.min(Math.max(ratio, MIN_WIDTH_RATIO), 1)) / 2) * 100;
}

export default function FunnelChartOS({
  stages,
  title = "Conversion funnel",
  description,
}: {
  stages: FunnelStage[];
  title?: string;
  description?: string;
}) {
  const entryUsers = stages[0]?.users ?? 0;
  const ratioOf = (stage: FunnelStage | undefined) =>
    entryUsers > 0 && stage ? stage.users / entryUsers : 0;

  return (
    <section className="rounded-xl border border-gray-300 bg-card-bg p-5">
      <div>
        <h3 className="font-bold text-gray-900 dark:text-zinc-100">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            {description}
          </p>
        )}
      </div>

      <div className="mt-5">
        {stages.map((stage, index) => {
          const topRatio = ratioOf(stage);
          // The last band closes off instead of tapering into nothing.
          const bottomRatio =
            index === stages.length - 1
              ? topRatio
              : ratioOf(stages[index + 1]);

          return (
            <div key={stage.key}>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(96px,1.4fr)_minmax(0,1fr)] items-center gap-x-4">
                <div className="min-w-0 text-right">
                  <p className="truncate text-sm font-semibold text-gray-800 dark:text-zinc-200">
                    {stage.label}
                  </p>
                  <p className="truncate text-[11px] text-gray-400">
                    {stage.hint}
                  </p>
                </div>

                <div
                  className="h-14 w-full"
                  style={{
                    backgroundColor: stageColors[index % stageColors.length],
                    clipPath: `polygon(${inset(topRatio)}% 0, ${
                      100 - inset(topRatio)
                    }% 0, ${100 - inset(bottomRatio)}% 100%, ${inset(
                      bottomRatio
                    )}% 100%)`,
                  }}
                />

                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">
                    {compactNumber(stage.users)}
                    <span className="ml-1 text-xs font-medium text-gray-400">
                      users
                    </span>
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {stage.from_entry_rate === null
                      ? "—"
                      : `${stage.from_entry_rate.toFixed(1)}% of arrivals`}
                  </p>
                </div>
              </div>

              {index < stages.length - 1 && (
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(96px,1.4fr)_minmax(0,1fr)] items-center gap-x-4 py-1">
                  <div />
                  <div />
                  <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-merah">
                    <ArrowDown size={11} />
                    {stages[index + 1].drop_off_rate === null
                      ? "—"
                      : `${stages[index + 1].drop_off_rate!.toFixed(
                          1
                        )}% drop-off`}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
