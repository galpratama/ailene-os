"use client";

import type { RevenueBDR, RevenueOpenPipeline, RevenueOpenPipelineRow } from "@/apis/revenue";
import RevenueStepBarsOS from "@/components/charts/RevenueStepBarsOS";
import WarehouseStackedTrendOS from "@/components/charts/WarehouseStackedTrendOS";
import AnalyticsDataTableOS, { type AnalyticsColumn } from "@/components/elements/AnalyticsDataTableOS";
import RevenueCardOS from "@/components/elements/RevenueCardOS";
import RevenueErrorOS from "@/components/elements/RevenueErrorOS";
import RevenueKpiOS from "@/components/elements/RevenueKpiOS";
import type { RevenueTabProps } from "@/components/pages/RevenueEngineOS";
import { useRevenue } from "@/hooks/useRevenue";
import { getRevenueBDR, getRevenueOpenPipeline } from "@/lib/actions";
import { count, money, percent, periodCaption, shortDate } from "@/lib/revenue";

const PENDING = "(Backend belum siap)";

const pipelineColumns: AnalyticsColumn<RevenueOpenPipelineRow>[] = [
  { key: "deal", label: "Deal", value: (row) => row.company.name },
  { key: "stage", label: "Stage", value: (row) => row.stage.name },
  { key: "value", label: "Value", value: (row) => row.value, render: (row) => `${money(row.value)}${row.value_source === "estimate" ? " (est.)" : ""}`, align: "right" },
  { key: "probability", label: "Probability", value: () => PENDING, render: () => <span className="text-gray-400 dark:text-zinc-500">{PENDING}</span>, align: "right" },
  { key: "next", label: "Next step", value: () => PENDING, render: () => <span className="text-gray-400 dark:text-zinc-500">{PENDING}</span> },
  { key: "close", label: "Expected close", value: (row) => row.expected_close_date, render: (row) => shortDate(row.expected_close_date) },
  { key: "owner", label: "Owner", value: (row) => row.sales_owner.name },
  { key: "days", label: "Days in stage", value: (row) => row.days_in_stage, align: "right" },
];

export default function RevenueBDRPanelOS({ period, periodLabel, enabled }: RevenueTabProps) {
  const bdr = useRevenue<RevenueBDR>("bdr", period, () => getRevenueBDR(period), enabled);
  const pipeline = useRevenue<RevenueOpenPipeline>("open-pipeline", "bdr", () => getRevenueOpenPipeline({ phase: "bdr", page_size: 100 }), enabled);
  const data = bdr.data;
  const previous = data ? periodCaption(data.period.previous_start_date, data.period.previous_end_date) : "previous period";

  if (bdr.isError && !data) return <RevenueErrorOS error={bdr.error} onRetry={() => bdr.refetch()} />;

  return (
    <>
      <p className="text-base text-gray-800 dark:text-zinc-200">
        The BDR&apos;s job: turn meetings into signed quotations.{" "}
        {data && (
          <>
            During {periodLabel}: <strong className="font-semibold">{count(data.meetings.current)}</strong> meetings booked.
          </>
        )}
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <RevenueKpiOS label="Show rate" pending="Needs meeting outcomes (held, no-show)." />
        <RevenueKpiOS
          label="Meetings booked"
          value={count(data?.meetings.current)}
          change={data?.meetings.change}
          changeLabel={previous}
          info="Pipelines whose meeting was booked in the period."
          isLoading={bdr.isLoading}
        />
        <RevenueKpiOS
          label="Meeting → quotation"
          value={percent(data?.meeting_to_quotation_rate)}
          lines={[`of ${periodLabel}'s meetings, so far`]}
          info="Of the pipelines whose meeting was booked in the period, the share that has sent a quotation since."
          isLoading={bdr.isLoading}
        />
        <RevenueKpiOS
          label="Meeting → won"
          value={percent(data?.meeting_to_won_rate)}
          lines={[`of ${periodLabel}'s meetings, so far`]}
          info="Of the pipelines whose meeting was booked in the period, the share closed won since."
          isLoading={bdr.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RevenueCardOS
          title="Meeting-to-close funnel"
          description={`Thick bar ${periodLabel}, thin bar ${previous}. Percent is conversion from the step above; the biggest drop is red.`}
          source="Ailene OS stage history · stages from the pipeline catalog"
          isLoading={bdr.isLoading}
          isEmpty={!data?.funnel.length}
        >
          <RevenueStepBarsOS
            previousLabel={previous}
            steps={(data?.funnel ?? []).map((step) => ({ key: step.stage_code, label: step.name, current: step.count, previous: step.previous, rate: step.from_previous_rate }))}
          />
        </RevenueCardOS>
        <RevenueCardOS
          title="Meetings per week"
          description="Meetings booked by Jakarta week in the selected range; partial boundary weeks include only selected dates."
          source="Ailene OS pipelines"
          partialNote="Splitting each week into held, no-show, and upcoming needs meeting outcomes."
          isLoading={bdr.isLoading}
        >
          <WarehouseStackedTrendOS
            unit="meetings"
            data={(data?.meetings_per_week ?? []).map((week) => ({ date: week.week_start, Booked: week.booked }))}
            series={[{ key: "Booked", color: "var(--viz-4)" }]}
          />
        </RevenueCardOS>
      </div>

      <RevenueCardOS
        title="Open BDR pipeline"
        description={pipeline.data ? `Current snapshot, independent of the selected dates: ${count(pipeline.data.totals.count)} open deals worth ${money(pipeline.data.totals.value)}. Value is the current quotation, else the estimate.` : "Current open deals in BDR stages, independent of the selected dates."}
        source="Ailene OS pipelines and quotations"
        partialNote="Probability, weighted value, and next step need new pipeline fields."
        isLoading={pipeline.isLoading}
        error={pipeline.error}
        onRetry={() => pipeline.refetch()}
        isEmpty={!pipeline.data?.list.length}
        emptyMessage="No open deals in BDR stages."
      >
        <AnalyticsDataTableOS columns={pipelineColumns} rows={pipeline.data?.list ?? []} rowKey={(row) => String(row.pipeline_id)} />
      </RevenueCardOS>

      <RevenueCardOS title="Why deals were lost after a meeting" description="Number of deals per loss reason." pending="Needs a reason code when a deal is lost." />
    </>
  );
}
