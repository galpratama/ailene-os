"use client";

import type { WarehouseFunnelStep } from "@/apis/analytics";
import type { IntakeMethod, RevenueIntake } from "@/apis/revenue";
import ChartHoverOS from "@/components/elements/ChartHoverOS";
import InfoTooltipOS from "@/components/elements/InfoTooltipOS";
import { compact, integer, rate } from "@/lib/analytics-warehouse";
import { intakeMethodLabels } from "@/lib/revenue";
import { ChevronDown } from "lucide-react";

// Form intakes shown in the outcome lane; staff-created pipelines are not funnel outcomes.
const formIntakes: IntakeMethod[] = ["meta_form", "website_form"];

const ramp = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

const laneCopy: Record<WarehouseFunnelStep["lane"], { title: string; info: string }> = {
  paid: { title: "Ad delivery", info: "Meta only. How many people saw an ad, clicked it, and then actually loaded the page." },
  web: { title: "On the website", info: "Every channel, not only ads, which is why sessions can exceed landing page views. Shows what visitors do once they arrive." },
  outcome: { title: "Tracked responses", info: "Meta platform leads and GA4 form_submit events. These counts are not matched to Ailene OS pipelines." },
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

export default function WarehouseFunnelChartOS({ steps, confirmed }: { steps: WarehouseFunnelStep[]; confirmed?: RevenueIntake }) {
  const paid = steps.filter((step) => step.lane === "paid");
  const web = steps.filter((step) => step.lane === "web");
  const outcome: WarehouseFunnelStep[] = confirmed
    ? formIntakes.map((method) => ({ lane: "outcome", key: method, label: intakeMethodLabels[method], value: confirmed[method], from_previous_rate: null }))
    : steps.filter((step) => step.lane === "outcome");
  const leadTotal = outcome.reduce((total, step) => total + step.value, 0);
  const hasPaid = (paid[0]?.value ?? 0) > 0;
  const hasWeb = web.length > 0;

  return (
    <div className={`grid gap-6 ${hasPaid && hasWeb ? "md:grid-cols-3" : hasPaid || hasWeb ? "md:grid-cols-2" : ""}`}>
      {hasPaid && <Lane lane="paid" steps={paid} />}
      {hasWeb && <Lane lane="web" steps={web} />}
      <div className="flex min-w-0 flex-col">
        <div className="mb-2 flex items-center gap-1">
          <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300">{confirmed ? "Leads in Ailene OS" : laneCopy.outcome.title}</p>
          <InfoTooltipOS label={confirmed ? "Leads in Ailene OS" : laneCopy.outcome.title} explanation={confirmed ? "Pipelines accepted by the OS from the website form or Meta webhook in the selected dates. Older pipelines with no recorded intake method are excluded. This is a different population from GA4 events and Meta platform counts." : laneCopy.outcome.info} />
        </div>
        <p className="font-heading text-3xl font-semibold text-gray-900 dark:text-zinc-100">{integer(leadTotal)}</p>
        <p className="text-xs text-gray-500 dark:text-zinc-400">{confirmed ? "confirmed website and Meta form leads" : "platform leads and GA4 form submits"}</p>
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
                <span className="truncate">{step.key === "web_leads" ? "GA4 form submits" : step.label}</span>
              </span>
              <span className="font-semibold tabular-nums text-gray-900 dark:text-zinc-100">{integer(step.value)}</span>
            </li>
          ))}
        </ul>
        {confirmed && confirmed.unclassified > 0 && <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400">{integer(confirmed.unclassified)} leads have no recorded intake method.</p>}
      </div>
    </div>
  );
}
