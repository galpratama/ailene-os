"use client";

import type { RevenueFunnel, RevenueOverview } from "@/apis/revenue";
import RevenueBowtieOS, { type BowtieStep } from "@/components/charts/RevenueBowtieOS";
import RevenueMonthBarsOS from "@/components/charts/RevenueMonthBarsOS";
import RevenueCardOS from "@/components/elements/RevenueCardOS";
import RevenueKpiOS from "@/components/elements/RevenueKpiOS";
import RevenueErrorOS from "@/components/elements/RevenueErrorOS";
import PendingLabelOS from "@/components/labels/PendingLabelOS";
import type { RevenueTabProps } from "@/components/pages/RevenueEngineOS";
import { useRevenue } from "@/hooks/useRevenue";
import { getRevenueFunnel, getRevenueOverview } from "@/lib/actions";
import { count, money, percent, periodCaption } from "@/lib/revenue";
import { TriangleAlert } from "lucide-react";

const stepLabels: Record<string, string> = { lead: "Lead", sql: "SQL", meeting: "Meeting", quotation: "Quotation", won: "Won" };

const stepDefinitions: Record<string, string> = {
  lead: "A pipeline created in the period.",
  sql: "A pipeline qualified in the period.",
  meeting: "A pipeline whose meeting was booked in the period.",
  quotation: "A pipeline whose quotation reached the client in the period.",
  won: "A pipeline closed won in the period.",
};

const afterSale: BowtieStep[] = [
  { key: "onboarded", label: "Onboarded", value: null, pending: true, definition: "Clients onboarded after signing. Needs delivery records." },
  { key: "delivered", label: "Delivered", value: null, pending: true, definition: "Clients whose training ran. Needs delivery records." },
  { key: "impact", label: "Impact", value: null, pending: true, definition: "Clients with Kirkpatrick results measured." },
  { key: "expanded", label: "Expanded", value: null, pending: true, definition: "Clients who bought again. Needs more than one deal per company." },
  { key: "referred", label: "Referred", value: null, pending: true, definition: "Clients who referred another company." },
];

function insightText(code: string, value: number) {
  switch (code) {
    case "untraceable_leads":
      return { title: "Too many leads have no source", body: `${percent(value)} of this period's leads have no channel and no attribution, so no campaign gets credit.` };
    case "revenue_down":
      return { title: "Closed revenue fell", body: `Revenue closed is ${percent(Math.abs(value))} below the previous period.` };
    case "sqls_down":
      return { title: "Fewer qualified leads", body: `SQLs are ${percent(Math.abs(value))} below the previous period.` };
    default:
      return { title: code.replaceAll("_", " "), body: percent(value) };
  }
}

export default function RevenueOverviewPanelOS({ period, monthLabel, enabled }: RevenueTabProps) {
  const overview = useRevenue<RevenueOverview>("overview", period, () => getRevenueOverview({ ...period, trend_months: 6 }), enabled);
  const funnel = useRevenue<RevenueFunnel>("funnel", period, () => getRevenueFunnel(period), enabled);
  const data = overview.data;
  const loading = overview.isLoading;
  const previous = data ? periodCaption(data.period.previous_start_date, data.period.previous_end_date) : "";
  const trend = data?.monthly ?? [];
  const steps = funnel.data?.steps ?? [];

  const left: BowtieStep[] = [
    ...steps.slice(0, 1).map((step) => ({ key: step.step, label: stepLabels[step.step], value: step.count, definition: stepDefinitions[step.step] })),
    { key: "mql", label: "MQL", value: null, pending: true, definition: "Marketing-qualified lead. No pipeline stage is marked as the MQL step yet." },
    ...steps.slice(1).map((step) => ({ key: step.step, label: stepLabels[step.step], value: step.count, rate: step.from_previous_rate, definition: stepDefinitions[step.step] })),
  ];

  const insights = [
    ...(data?.insights ?? []).map((insight) => ({ key: insight.code, severity: insight.severity, ...insightText(insight.code, insight.value) })),
    ...(funnel.data?.weakest_step
      ? [{
          key: "weakest",
          severity: "info",
          title: `The weakest step is ${stepLabels[funnel.data.weakest_step] ?? funnel.data.weakest_step}`,
          body: `Only ${percent(steps.find((step) => step.step === funnel.data?.weakest_step)?.from_previous_rate)} of the step before got there this period.`,
        }]
      : []),
  ];

  if (overview.isError && !data) return <RevenueErrorOS error={overview.error} onRetry={() => overview.refetch()} />;

  return (
    <>
      {data && (
        <p className="text-base text-gray-800 dark:text-zinc-200">
          {monthLabel} closed <strong className="font-semibold">{money(data.revenue_closed.current)}</strong> from{" "}
          <strong className="font-semibold">{count(data.closings.current)}</strong> closing{data.closings.current === 1 ? "" : "s"}, with{" "}
          <strong className="font-semibold">{count(data.sqls.current)}</strong> {data.sqls.current === 1 ? "SQL" : "SQLs"} from <strong className="font-semibold">{count(data.leads.current)}</strong> new {data.leads.current === 1 ? "lead" : "leads"}.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <RevenueKpiOS
          label="Revenue closed"
          value={money(data?.revenue_closed.current)}
          lines={[<>Target <PendingLabelOS /></>]}
          change={data?.revenue_closed.change}
          changeLabel={previous}
          trend={trend.map((month) => month.revenue_closed)}
          info="Net value of the accepted quotation of each deal closed won in the period, else the deal's estimated value."
          isLoading={loading}
        />
        <RevenueKpiOS
          label="Closings"
          value={count(data?.closings.current)}
          change={data?.closings.change}
          changeLabel={previous}
          trend={trend.map((month) => month.closings)}
          info="Pipelines closed won in the period."
          isLoading={loading}
        />
        <RevenueKpiOS
          label="SQLs"
          value={count(data?.sqls.current)}
          lines={[`${count(data?.leads.current)} new leads`]}
          change={data?.sqls.change}
          changeLabel={previous}
          trend={trend.map((month) => month.sqls)}
          info="Pipelines qualified in the period."
          isLoading={loading}
        />
        <RevenueKpiOS label="Pipeline coverage" pending="Needs stage win probabilities and a revenue target." />
        <RevenueKpiOS
          label="Paid cost per SQL"
          value={money(data?.paid_cost_per_sql.value_idr)}
          lines={[
            `${count(data?.paid_cost_per_sql.sqls)} SQLs from Meta Ads`,
            data?.paid_cost_per_sql.spend_idr === null ? "Spend: warehouse unavailable" : `from ${money(data?.paid_cost_per_sql.spend_idr)} Meta spend`,
            <>Google Ads spend <PendingLabelOS /></>,
          ]}
          info="Meta Ads spend from the warehouse divided by SQLs whose channel is Meta Ads."
          isLoading={loading}
        />
        <RevenueKpiOS label="Cash collected" pending="Needs invoices and payments in Ailene OS." />
      </div>

      <RevenueCardOS
        title="The whole customer lifecycle, as a bowtie"
        description="Left: this period from lead to won, with the conversion from the step before underneath. Right: every client after the sale. Hover a block for its definition."
        source="Ailene OS pipelines and quotations"
        isLoading={funnel.isLoading}
        error={funnel.error}
        onRetry={() => funnel.refetch()}
      >
        <RevenueBowtieOS left={left} right={afterSale} weakest={funnel.data?.weakest_step ?? null} />
      </RevenueCardOS>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RevenueCardOS title="What the data says" description="Worked out from this period's numbers." isLoading={loading} isEmpty={insights.length === 0} emptyMessage="Nothing stands out this period.">
          <ul className="flex flex-col gap-3">
            {insights.map((insight) => (
              <li key={insight.key} className="flex gap-2.5">
                <TriangleAlert size={15} aria-hidden="true" className={`mt-0.5 shrink-0 ${insight.severity === "warning" ? "text-merah" : "text-kuning"}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-zinc-100">{insight.title}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">{insight.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </RevenueCardOS>
        <RevenueCardOS
          title="Revenue by month"
          description="Closed revenue in the last six months; the current month is lighter until it ends."
          partialNote="The monthly target line needs revenue targets."
          source="Ailene OS pipelines and quotations"
          isLoading={loading}
        >
          <RevenueMonthBarsOS data={trend.map((month) => ({ month: month.month, partial: month.partial, revenue: month.revenue_closed, closings: month.closings }))} />
        </RevenueCardOS>
      </div>
    </>
  );
}
