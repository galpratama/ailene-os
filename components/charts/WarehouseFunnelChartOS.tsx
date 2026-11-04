"use client";

import type { WarehouseFunnelStep } from "@/apis/analytics";
import ChartHoverOS from "@/components/elements/ChartHoverOS";
import InfoTooltipOS from "@/components/elements/InfoTooltipOS";
import { compact, integer, rate } from "@/lib/analytics-warehouse";
import { ChevronDown } from "lucide-react";

const ramp = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

const laneCopy: Record<WarehouseFunnelStep["lane"], { title: string; info: string }> = {
  paid: { title: "Ad delivery", info: "Meta only. How many people saw an ad, clicked it, and then actually loaded the page." },
  web: { title: "On the website", info: "Every channel, not only ads, which is why sessions can exceed landing page views. Shows what visitors do once they arrive." },
  outcome: { title: "Leads", info: "Where leads were recorded. Meta form leads never visit the site, so they do not pass through the website steps." },
};

function Lane({ lane, steps }: { lane: "paid" | "web"; steps: WarehouseFunnelStep[] }) {
  const top = steps[0]?.value ?? 0;
  const rates = steps.map((step) => step.from_previous_rate).filter((value): value is number => value !== null);
  const worst = rates.length ? Math.min(...rates) : null;
  return (
    <div className="flex min-w-0 flex-col">
      <div className="mb-2 flex items-center gap-1">
        <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300">{laneCopy[lane].title}</p>
        <InfoTooltipOS label={laneCopy[lane].title} explanation={laneCopy[lane].info} />
      </div>
      {steps.map((step, index) => {
        const share = top > 0 ? step.value / top : 0;
        const isWorst = step.from_previous_rate !== null && step.from_previous_rate === worst;
        return (
          <div key={step.key}>
            {index > 0 && (
              <p className={`flex items-center gap-1 py-1 text-xs ${isWorst ? "font-semibold text-gray-900 dark:text-zinc-100" : "text-gray-500 dark:text-zinc-400"}`}>
                <ChevronDown size={12} aria-hidden="true" />
                {rate(step.from_previous_rate)} continue{isWorst && <span style={{ color: "var(--label-merah)" }}>· biggest drop</span>}
              </p>
            )}
            <ChartHoverOS
              label={`${step.label}: ${integer(step.value)}`}
              title={step.label}
              rows={[
                { label: "total", value: integer(step.value), color: ramp[index] },
                { label: `of ${steps[0].label.toLowerCase()}`, value: rate(share, share < 0.01 ? 2 : 1) },
              ]}
              className="rounded-sm"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-xs text-gray-600 dark:text-zinc-300">{step.label}</span>
                <span className="font-heading text-sm font-semibold text-gray-900 dark:text-zinc-100">{compact(step.value)}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-gray-100 dark:bg-zinc-800">
                <div className="h-full min-w-1 rounded-full" style={{ width: `${Math.max(share * 100, 0.5)}%`, backgroundColor: ramp[index] }} />
              </div>
            </ChartHoverOS>
          </div>
        );
      })}
    </div>
  );
}

export default function WarehouseFunnelChartOS({ steps }: { steps: WarehouseFunnelStep[] }) {
  const paid = steps.filter((step) => step.lane === "paid");
  const web = steps.filter((step) => step.lane === "web");
  const outcome = steps.filter((step) => step.lane === "outcome");
  const leadTotal = outcome.reduce((total, step) => total + step.value, 0);
  const hasPaid = (paid[0]?.value ?? 0) > 0;

  return (
    <div className={`grid gap-6 ${hasPaid ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
      {hasPaid && <Lane lane="paid" steps={paid} />}
      <Lane lane="web" steps={web} />
      <div className="flex min-w-0 flex-col">
        <div className="mb-2 flex items-center gap-1">
          <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300">{laneCopy.outcome.title}</p>
          <InfoTooltipOS label={laneCopy.outcome.title} explanation={laneCopy.outcome.info} />
        </div>
        <p className="font-heading text-3xl font-semibold text-gray-900 dark:text-zinc-100">{integer(leadTotal)}</p>
        <p className="text-xs text-gray-500 dark:text-zinc-400">total leads in this slice</p>
        <div className="mt-3 flex h-2 gap-0.5 overflow-hidden rounded-full">
          {outcome.filter((step) => step.value > 0).map((step, index) => (
            <div key={step.key} className="h-full" style={{ width: `${(step.value / Math.max(leadTotal, 1)) * 100}%`, backgroundColor: index === 0 ? "var(--viz-1)" : "var(--viz-2)" }} />
          ))}
        </div>
        <ul className="mt-3 flex flex-col gap-1.5">
          {outcome.map((step, index) => (
            <li key={step.key} className="flex items-center justify-between gap-2 text-xs text-gray-600 dark:text-zinc-300">
              <span className="flex min-w-0 items-center gap-1.5">
                <span aria-hidden="true" className="size-2 shrink-0 rounded-xs" style={{ backgroundColor: index === 0 ? "var(--viz-1)" : "var(--viz-2)" }} />
                <span className="truncate">{step.label}</span>
              </span>
              <span className="font-semibold tabular-nums text-gray-900 dark:text-zinc-100">{integer(step.value)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
