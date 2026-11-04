"use client";

import WarehouseSparklineOS from "@/components/charts/WarehouseSparklineOS";
import InfoTooltipOS from "@/components/elements/InfoTooltipOS";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

export type KpiDirection = "up" | "down" | "neutral";

function Delta({ change, goodWhen, comparable, previous }: { change: number | null; goodWhen: KpiDirection; comparable: boolean; previous: string }) {
  if (!comparable) return <p className="text-xs text-gray-500 dark:text-zinc-400">No full prior period</p>;
  if (change === null) return <p className="text-xs text-gray-500 dark:text-zinc-400">Prior {previous}</p>;
  const flat = Math.abs(change) < 0.05;
  const isUp = change > 0;
  const tone = flat || goodWhen === "neutral" ? "var(--label-gray)" : isUp === (goodWhen === "up") ? "var(--label-hijau)" : "var(--label-merah)";
  const Icon = flat ? Minus : isUp ? ArrowUp : ArrowDown;
  return (
    <p className="flex items-center gap-1 text-xs">
      <span className="flex items-center gap-0.5 font-semibold" style={{ color: tone }}>
        <Icon size={12} aria-hidden="true" />
        {Math.abs(change).toFixed(1)}%
      </span>
      <span className="truncate text-gray-500 dark:text-zinc-400">vs {previous}</span>
    </p>
  );
}

// A headline number with its direction and shape; color reads good or bad for this metric, so a falling CPL is green.
export default function AnalyticsKpiTileOS({
  label,
  info,
  value,
  change,
  previous,
  goodWhen = "up",
  comparable = true,
  series,
}: {
  label: string;
  info: string;
  value: string;
  change: number | null;
  previous: string;
  goodWhen?: KpiDirection;
  comparable?: boolean;
  series?: (number | null)[];
}) {
  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-line bg-card-bg p-4">
      <div className="flex items-center gap-1">
        <p className="truncate text-xs font-medium text-gray-600 dark:text-zinc-300">{label}</p>
        <InfoTooltipOS label={label} explanation={info} />
      </div>
      <p className="mt-1 truncate font-heading text-2xl font-semibold text-gray-900 dark:text-zinc-100">{value}</p>
      <Delta change={change} goodWhen={goodWhen} comparable={comparable} previous={previous} />
      {series && <div className="mt-2"><WarehouseSparklineOS values={series} /></div>}
    </div>
  );
}
