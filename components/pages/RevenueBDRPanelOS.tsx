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
        <RevenueKpiOS
          label="Show rate"
          info="Persentase meeting yang benar-benar terjadi (bukan no-show). Tujuannya memastikan meeting yang dijadwalkan tidak terbuang."
          pending="Needs meeting outcomes (held, no-show)." />
        <RevenueKpiOS
          label="Meetings booked"
          value={count(data?.meetings.current)}
          change={data?.meetings.change}
          changeLabel={previous}
          info="Jumlah pipeline yang meeting-nya dijadwalkan di periode ini. Tujuannya memastikan BDR punya cukup meeting untuk dikonversi menjadi deal."
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
          description="Menampilkan jumlah meeting yang dijadwalkan per minggu. Tujuannya memantau apakah jumlah meeting cukup dan stabil untuk mengejar target closing."
          source="os"
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
        description={`Menampilkan semua deal yang masih terbuka di stage BDR beserta nilai, owner, perkiraan closing, dan lama di stage${pipeline.data ? ` (saat ini ${count(pipeline.data.totals.count)} deal senilai ${money(pipeline.data.totals.value)})` : ""}. Tujuannya memprioritaskan follow-up dan memperkirakan revenue yang akan datang.`}
        source="os"
        partialNote="Probability, weighted value, and next step need new pipeline fields."
        isLoading={pipeline.isLoading}
        error={pipeline.error}
        onRetry={() => pipeline.refetch()}
        isEmpty={!pipeline.data?.list.length}
        emptyMessage="No open deals in BDR stages."
      >
        <AnalyticsDataTableOS columns={pipelineColumns} rows={pipeline.data?.list ?? []} rowKey={(row) => String(row.pipeline_id)} />
      </RevenueCardOS>

      <RevenueCardOS title="Why deals were lost after a meeting" description="Menampilkan jumlah deal yang kalah setelah meeting per alasan. Tujuannya mengetahui alasan utama deal kalah, supaya pitch, harga, atau penawaran bisa diperbaiki." pending="Needs a reason code when a deal is lost." />
    </>
  );
}
