"use client";

import { getShortAccountCurrency } from "@/lib/currency";
import { useState } from "react";

export type CreativeRankEntry = {
  id: string;
  name: string;
  spend: number;
  results: number;
  cost_per_result: number | null;
  link_ctr: number | null;
};

type RankKey = "results" | "cost_per_result" | "link_ctr" | "spend";

const rankMetrics: {
  key: RankKey;
  label: string;
  // Cost metrics rank cheapest first; everything else ranks biggest first.
  ascending: boolean;
}[] = [
  { key: "results", label: "Results", ascending: false },
  { key: "cost_per_result", label: "Cost / result", ascending: true },
  { key: "link_ctr", label: "Link CTR", ascending: false },
  { key: "spend", label: "Spend", ascending: false },
];

const TOP_COUNT = 8;

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

// A ranked bar list, not a recharts chart: an axis tick cannot truncate a creative name.
export default function CreativeRankChartOS({
  data,
  currency,
}: {
  data: CreativeRankEntry[];
  currency: string;
}) {
  const [metricKey, setMetricKey] = useState<RankKey>("results");
  const activeMetric =
    rankMetrics.find((entry) => entry.key === metricKey) ?? rankMetrics[0];

  function formatValue(value: number) {
    if (activeMetric.key === "link_ctr") return `${value.toFixed(2)}%`;
    if (activeMetric.key === "results") return compactNumber(value);
    return getShortAccountCurrency(value, currency);
  }

  const ranked = data
    .map((entry) => ({ entry, value: entry[activeMetric.key] }))
    // A creative with no conversions has no cost per result to compare.
    .filter((row): row is { entry: CreativeRankEntry; value: number } =>
      row.value !== null && row.value > 0
    )
    .sort((a, b) =>
      activeMetric.ascending ? a.value - b.value : b.value - a.value
    )
    .slice(0, TOP_COUNT);

  const maxValue = Math.max(...ranked.map((row) => row.value), 1);

  return (
    <div className="rounded-xl border border-gray-300 bg-card-bg p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-zinc-100">
            Creative leaderboard
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Top {TOP_COUNT} ads for the metric you pick, best first.
          </p>
        </div>
        <div className="flex flex-wrap rounded-lg border border-gray-300 bg-gray-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
          {rankMetrics.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => setMetricKey(entry.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeMetric.key === entry.key
                  ? "bg-lime-bright text-forest-deep"
                  : "text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      {ranked.length > 0 ? (
        <ol className="mt-5 flex flex-col gap-3.5">
          {ranked.map((row, index) => (
            <li key={row.entry.id} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="min-w-0 truncate text-sm text-gray-700 dark:text-zinc-300">
                  <span className="mr-1.5 font-bold text-gray-400">
                    {index + 1}.
                  </span>
                  {row.entry.name}
                </p>
                <p className="shrink-0 text-sm font-bold text-gray-900 dark:text-zinc-100">
                  {formatValue(row.value)}
                </p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    // The best entry always fills the row, so the rest are read against the winner.
                    width: `${Math.max(
                      3,
                      activeMetric.ascending
                        ? (ranked[0].value / row.value) * 100
                        : (row.value / maxValue) * 100
                    )}%`,
                    backgroundColor:
                      index === 0 ? "var(--claude)" : "var(--chart-4)",
                  }}
                />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="py-14 text-center text-sm text-gray-400">
          No creative reached this metric in the selected period.
        </p>
      )}
    </div>
  );
}
