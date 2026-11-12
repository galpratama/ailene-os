"use client";

import type { RevenueBDR, RevenueOpenPipeline, RevenueOpenPipelineRow } from "@/apis/revenue";
import RevenueStepBarsOS from "@/components/charts/RevenueStepBarsOS";
import WarehouseStackedTrendOS from "@/components/charts/WarehouseStackedTrendOS";
import AnalyticsDataTableOS, { type AnalyticsColumn } from "@/components/elements/AnalyticsDataTableOS";
import RevenueCardOS from "@/components/elements/RevenueCardOS";
import RevenueErrorOS from "@/components/elements/RevenueErrorOS";
import RevenueKpiOS from "@/components/elements/RevenueKpiOS";
import RevenueOutcomeReasonsCardOS from "@/components/static-sections/RevenueOutcomeReasonsCardOS";
import type { RevenueTabProps } from "@/components/pages/RevenueEngineOS";
import { useRevenue } from "@/hooks/useRevenue";
import { getRevenueBDR, getRevenueOpenPipeline } from "@/lib/actions";
import { count, money, percent, periodCaption, shortDate } from "@/lib/revenue";

function NextStepCell({ row }: { row: RevenueOpenPipelineRow }) {
  if (!row.next_step) return <span className="text-gray-400 dark:text-zinc-500">—</span>;
  const overdue = !!row.next_step_due && row.next_step_due < new Date().toISOString().slice(0, 10);
  return (
    <span className="flex min-w-40 flex-col">
      <span className="line-clamp-2 text-gray-800 dark:text-zinc-200">{row.next_step}</span>
      {row.next_step_due && (
        <span className={`text-xs ${overdue ? "font-semibold text-merah" : "text-gray-500 dark:text-zinc-400"}`}>
          {overdue ? "Lewat · " : ""}
          {shortDate(row.next_step_due)}
        </span>
      )}
    </span>
  );
}

const pipelineColumns: AnalyticsColumn<RevenueOpenPipelineRow>[] = [
  { key: "deal", label: "Deal", value: (row) => row.company.name },
  { key: "stage", label: "Stage", value: (row) => row.stage.name },
  { key: "value", label: "Value", value: (row) => row.value, render: (row) => `${money(row.value)}${row.value_source === "estimate" ? " (est.)" : ""}`, align: "right" },
  { key: "probability", label: "Probability", value: (row) => row.probability, render: (row) => percent(row.probability), align: "right" },
  { key: "weighted", label: "Weighted", value: (row) => row.weighted_value, render: (row) => money(row.weighted_value), align: "right" },
  { key: "next", label: "Next step", value: (row) => row.next_step, render: (row) => <NextStepCell row={row} /> },
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
            During {periodLabel}: <strong className="font-semibold">{count(data.meetings.current)}</strong> meetings booked,{" "}
            <strong className="font-semibold">{count(data.meetings_held.current)}</strong> held.
          </>
        )}
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <RevenueKpiOS
          label="Meetings booked"
          value={count(data?.meetings.current)}
          change={data?.meetings.change}
          changeLabel={previous}
          info="Jumlah pipeline yang masuk stage Meeting booked di periode ini. Tujuannya memastikan BDR punya cukup meeting terjadwal untuk dikonversi menjadi deal."
          isLoading={bdr.isLoading}
        />
        <RevenueKpiOS
          label="Meetings held"
          value={count(data?.meetings_held.current)}
          change={data?.meetings_held.change}
          changeLabel={previous}
          info="Jumlah pipeline yang pertama kali masuk stage Discovery done (stage yang ditandai 'Meeting held' di katalog) di periode ini, artinya meeting-nya benar-benar terjadi. Tujuannya melihat berapa meeting yang betul-betul jalan, bukan sekadar dijadwalkan."
          isLoading={bdr.isLoading}
        />
        <RevenueKpiOS
          label="Meeting → quotation"
          value={percent(data?.meeting_to_quotation_rate)}
          lines={[`of ${periodLabel}'s meetings, so far`]}
          info="Dari pipeline yang meeting-nya dijadwalkan di periode ini, persentase yang sudah dikirimi quotation sampai sekarang. Tujuannya mengukur seberapa sering meeting berlanjut ke penawaran."
          isLoading={bdr.isLoading}
        />
        <RevenueKpiOS
          label="Meeting → won"
          value={percent(data?.meeting_to_won_rate)}
          lines={[`of ${periodLabel}'s meetings, so far`]}
          info="Dari pipeline yang meeting-nya dijadwalkan di periode ini, persentase yang sudah closed won sampai sekarang. Tujuannya mengukur seberapa efektif meeting berujung menjadi deal."
          isLoading={bdr.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RevenueCardOS
          title="Meeting-to-close funnel"
          description={`Menampilkan jumlah deal di tiap stage BDR, dari meeting sampai closed won, selama ${periodLabel} dibandingkan dengan ${previous}. Tujuannya menemukan stage tempat deal paling banyak berhenti.`}
          source="os"
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
          description="Menampilkan per minggu jumlah meeting yang dibooking (masuk stage Meeting booked) dan yang benar-benar terjadi (masuk stage Discovery done). Tujuannya memantau apakah jumlah meeting cukup, stabil, dan benar-benar berjalan untuk mengejar target closing."
          source="os"
          isLoading={bdr.isLoading}
          partialNote={data?.data_gaps.some((gap) => gap.code === "meeting_held_step") ? "No pipeline stage is marked as Meeting held yet, so held meetings show 0." : undefined}
        >
          <WarehouseStackedTrendOS
            unit="meetings"
            stacked={false}
            data={(data?.meetings_per_week ?? []).map((week) => ({ date: week.week_start, Booked: week.booked, Held: week.held }))}
            series={[
              { key: "Booked", color: "var(--viz-1)" },
              { key: "Held", color: "var(--viz-4)" },
            ]}
          />
        </RevenueCardOS>
      </div>

      <RevenueCardOS
        title="Open BDR pipeline"
        description={`Menampilkan semua deal yang masih terbuka di stage BDR beserta nilai, probabilitas menang dari stage-nya, nilai tertimbang (nilai × probabilitas), next step, dan lama di stage${pipeline.data ? ` (saat ini ${count(pipeline.data.totals.count)} deal senilai ${money(pipeline.data.totals.value)}, tertimbang ${money(pipeline.data.totals.weighted_value)})` : ""}. Tujuannya memprioritaskan follow-up dan memperkirakan revenue yang realistis.`}
        source="os"
        isLoading={pipeline.isLoading}
        error={pipeline.error}
        onRetry={() => pipeline.refetch()}
        isEmpty={!pipeline.data?.list.length}
        emptyMessage="No open deals in BDR stages."
      >
        <AnalyticsDataTableOS columns={pipelineColumns} rows={pipeline.data?.list ?? []} rowKey={(row) => String(row.pipeline_id)} />
      </RevenueCardOS>

      <RevenueOutcomeReasonsCardOS
        kind="lost"
        title="Why deals were lost after a meeting"
        description="Menampilkan jumlah deal BDR yang masuk stage kalah di periode ini per alasan yang dipilih saat menutupnya. Tujuannya mengetahui alasan utama deal kalah, supaya pitch, harga, atau penawaran bisa diperbaiki."
        period={period}
        enabled={enabled}
      />
    </>
  );
}
