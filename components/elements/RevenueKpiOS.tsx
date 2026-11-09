import WarehouseSparklineOS from "@/components/charts/WarehouseSparklineOS";
import InfoTooltipOS from "@/components/elements/InfoTooltipOS";
import PendingLabelOS from "@/components/labels/PendingLabelOS";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { ReactNode } from "react";

// A headline number with its context lines; a pending tile keeps its slot and says why it is empty.
export default function RevenueKpiOS({
  label,
  value,
  lines = [],
  change,
  changeLabel,
  invertChange = false,
  trend,
  info,
  pending,
  isLoading,
}: {
  label: string;
  value?: string;
  lines?: ReactNode[];
  change?: number | null;
  changeLabel?: string;
  invertChange?: boolean;
  trend?: number[];
  info?: string;
  pending?: string;
  isLoading?: boolean;
}) {
  const up = (change ?? 0) >= 0;
  const good = invertChange ? !up : up;
  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-line bg-card-bg px-4 py-3.5">
      <div className="flex items-start gap-1">
        <p className="min-w-0 flex-1 text-xs font-medium text-gray-600 dark:text-zinc-300">{label}</p>
        {info && <InfoTooltipOS label={label} explanation={info} />}
      </div>
      {pending ? (
        <>
          <p className="mt-1 font-heading text-2xl font-semibold text-gray-300 dark:text-zinc-600" aria-hidden="true">—</p>
          <PendingLabelOS className="mt-1" />
          <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-zinc-400">{pending}</p>
        </>
      ) : isLoading ? (
        <div aria-busy="true" aria-label={`Loading ${label}`} className="mt-2 flex animate-pulse flex-col gap-2 motion-reduce:animate-none">
          <span className="h-7 w-24 rounded-md bg-line-soft" />
          <span className="h-3 w-32 rounded-md bg-line-soft" />
        </div>
      ) : (
        <>
          <p className="mt-1 font-heading text-2xl font-semibold tabular-nums text-gray-900 dark:text-zinc-100">{value}</p>
          {lines.map((line, index) => (
            <div key={index} className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">{line}</div>
          ))}
          {change !== undefined && (
            <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
              {change === null ? (
                <span>No comparison{changeLabel ? ` with ${changeLabel}` : ""}</span>
              ) : (
                <>
                  <span className={`inline-flex items-center gap-0.5 font-semibold ${good ? "text-hijau" : "text-merah"}`}>
                    {up ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" />}
                    <span className="sr-only">{up ? "up" : "down"}</span>
                    {Math.abs(change * 100).toFixed(0)}%
                  </span>{" "}
                  {changeLabel ? `vs ${changeLabel}` : ""}
                </>
              )}
            </p>
          )}
          {trend && trend.length > 1 && (
            <div className="mt-auto pt-2" title="Last six months">
              <WarehouseSparklineOS values={trend} color="var(--viz-4)" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
