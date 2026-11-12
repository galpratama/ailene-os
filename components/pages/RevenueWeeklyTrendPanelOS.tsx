"use client";

import type { RevenueWeeklyTrend } from "@/apis/revenue";
import WarehouseStackedTrendOS from "@/components/charts/WarehouseStackedTrendOS";
import RevenueCardOS from "@/components/elements/RevenueCardOS";
import RevenueErrorOS from "@/components/elements/RevenueErrorOS";
import type { RevenueTabProps } from "@/components/pages/RevenueEngineOS";
import { useRevenue } from "@/hooks/useRevenue";
import { getRevenueWeeklyTrend } from "@/lib/actions";
import { count, leadGroupColors, leadGroups, leadGroupShortLabels, money } from "@/lib/revenue";

const dealSeries = [
  { key: "Meetings held", color: "var(--viz-1)" },
  { key: "Quotations sent", color: "var(--viz-2)" },
  { key: "Won", color: "var(--viz-4)" },
];

export default function RevenueWeeklyTrendPanelOS({ period, periodLabel, enabled }: RevenueTabProps) {
  const trend = useRevenue<RevenueWeeklyTrend>("weekly-trend", period, () => getRevenueWeeklyTrend(period), enabled);
  const weeks = trend.data?.weeks ?? [];
  const sqls = weeks.reduce((sum, week) => sum + week.sqls.total, 0);
  const won = weeks.reduce((sum, week) => sum + week.won_value, 0);
  const partial = weeks.some((week) => week.partial);

  if (trend.isError && !trend.data) return <RevenueErrorOS error={trend.error} onRetry={() => trend.refetch()} />;

  return (
    <>
      <p className="text-base text-gray-800 dark:text-zinc-200">
        Week by week (Monday to Sunday, WIB) across {periodLabel}
        {trend.data && (
          <>
            : <strong className="font-semibold">{count(sqls)}</strong> SQL and <strong className="font-semibold">{money(won)}</strong> won.
          </>
        )}
        {partial && <span className="text-gray-500 dark:text-zinc-400"> The first or last week may be partial.</span>}
      </p>

      <RevenueCardOS
        title="SQL per week by source group"
        description="Menampilkan jumlah SQL per minggu, dihitung dari tanggal lead menjadi qualified, dipecah per sumber lead. Tujuannya melihat sumber mana yang menjaga pasokan SQL tetap stabil setiap minggu."
        source="os"
        isLoading={trend.isLoading}
        error={trend.error}
        onRetry={() => trend.refetch()}
        isEmpty={sqls === 0}
        emptyMessage="No SQLs in this period."
      >
        <WarehouseStackedTrendOS
          unit="SQL"
          height={280}
          data={weeks.map((week) => ({
            date: week.week_start,
            ...Object.fromEntries(leadGroups.map((group) => [leadGroupShortLabels[group], week.sqls.groups[group] ?? 0])),
          }))}
          series={leadGroups.map((group) => ({ key: leadGroupShortLabels[group], color: leadGroupColors[group] }))}
        />
      </RevenueCardOS>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RevenueCardOS
          title="Meetings held, quotations and wins per week"
          partialNote={trend.data?.data_gaps.some((gap) => gap.code === "meeting_held_step") ? "No pipeline stage is marked as Meeting held yet, so held meetings show 0." : undefined}
          description="Menampilkan per minggu jumlah meeting yang sudah terjadi (pipeline masuk stage Discovery done), quotation yang disetujui dan dikirim ke klien, serta deal yang closed won. Tujuannya melihat apakah meeting cukup berlanjut ke penawaran dan deal."
          source="os"
          isLoading={trend.isLoading}
          error={trend.error}
          onRetry={() => trend.refetch()}
        >
          <WarehouseStackedTrendOS
            unit="events"
            stacked={false}
            data={weeks.map((week) => ({ date: week.week_start, "Meetings held": week.meetings_held, "Quotations sent": week.quotations, Won: week.won }))}
            series={dealSeries}
          />
        </RevenueCardOS>
        <RevenueCardOS
          title="Won value per week"
          description="Menampilkan nilai deal yang closed won per minggu, dari quotation yang disetujui (atau estimasi nilai pipeline bila belum ada quotation). Tujuannya melihat ritme pemasukan dari deal yang menang."
          source="os"
          isLoading={trend.isLoading}
          error={trend.error}
          onRetry={() => trend.refetch()}
        >
          <WarehouseStackedTrendOS
            unit="won"
            format={money}
            axisFormat={money}
            data={weeks.map((week) => ({ date: week.week_start, "Won value": week.won_value }))}
            series={[{ key: "Won value", color: "var(--viz-4)" }]}
          />
        </RevenueCardOS>
      </div>
    </>
  );
}
