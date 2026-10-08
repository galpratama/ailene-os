"use client";

import { ArrowRight } from "lucide-react";

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

const stageColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

function stageColor(index: number, total: number) {
  const step = total > 1 ? index / (total - 1) : 0;
  return stageColors[Math.round(step * (stageColors.length - 1))];
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

  return (
    <section className="rounded-xl border border-line bg-card-bg p-5">
      <h3 className="font-bold text-gray-900 dark:text-zinc-100">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          {description}
        </p>
      )}

      <div className="mt-5 overflow-x-auto pb-1" role="region" aria-label="Conversion funnel stages" tabIndex={0}>
        <div className="flex min-w-max items-stretch">
          {stages.map((stage, index) => {
            const ratio = entryUsers > 0 ? Math.min(stage.users / entryUsers, 1) : 0;
            const nextStage = stages[index + 1];
            const dropOffRate = nextStage && stage.users > 0
              ? (Math.max(stage.users - nextStage.users, 0) / stage.users) * 100
              : null;
            return (
              <div key={stage.key} className="flex items-center">
                <div className="flex h-full w-40 flex-col rounded-xl border border-line-soft bg-gray-50/70 p-4 dark:bg-zinc-800/40">
                  <div
                    className="h-1.5 min-w-1 rounded-full"
                    style={{
                      width: `${Math.max(ratio * 100, stage.users > 0 ? 4 : 0)}%`,
                      backgroundColor: stageColor(index, stages.length),
                    }}
                  />
                  <p className="mt-4 min-h-10 text-sm font-semibold leading-5 text-gray-900 dark:text-zinc-100">
                    {stage.label}
                  </p>
                  <p className="mt-1 min-h-8 text-xs leading-4 text-gray-500 dark:text-zinc-400">
                    {stage.hint}
                  </p>
                  <p className="mt-auto pt-5 text-2xl font-bold tabular-nums text-gray-900 dark:text-zinc-100">
                    {stage.users.toLocaleString("en-US")}
                    <span className="ml-1 text-xs font-medium text-gray-500 dark:text-zinc-400">users</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                    {stage.from_entry_rate === null
                      ? "—"
                      : `${stage.from_entry_rate.toFixed(1)}% of arrivals`}
                  </p>
                </div>
                {nextStage && (
                  <div className="flex w-14 shrink-0 flex-col items-center justify-center gap-1 text-center">
                    <ArrowRight size={17} className="text-claude dark:text-lime-bright" />
                    <span className="text-[11px] font-medium text-gray-500 dark:text-zinc-400">
                      {dropOffRate === null
                        ? "—"
                        : `${dropOffRate.toFixed(1)}% drop-off`}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
