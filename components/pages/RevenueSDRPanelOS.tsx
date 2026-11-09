"use client";

import type { RevenueCampaignRow, RevenueCampaigns, RevenueSDR } from "@/apis/revenue";
import AnalyticsDataTableOS, { type AnalyticsColumn } from "@/components/elements/AnalyticsDataTableOS";
import RevenueCardOS from "@/components/elements/RevenueCardOS";
import RevenueErrorOS from "@/components/elements/RevenueErrorOS";
import RevenueKpiOS from "@/components/elements/RevenueKpiOS";
import type { RevenueTabProps } from "@/components/pages/RevenueEngineOS";
import { useRevenue } from "@/hooks/useRevenue";
import { getRevenueCampaigns, getRevenueSDR } from "@/lib/actions";
import { channelLabel, count, money, percent, periodCaption } from "@/lib/revenue";

const sourceLabels: Record<RevenueCampaignRow["source"], string> = { meta_ad: "Meta", utm: "UTM", none: "No campaign" };

const campaignColumns: AnalyticsColumn<RevenueCampaignRow>[] = [
  { key: "campaign", label: "Campaign", value: (row) => (row.campaign ? `${sourceLabels[row.source]}: ${row.campaign}` : `No campaign: ${channelLabel(row.lead_channel)}`) },
  { key: "channel", label: "Channel", value: (row) => channelLabel(row.lead_channel) },
  { key: "leads", label: "Leads", value: (row) => row.leads, align: "right" },
  { key: "sqls", label: "SQL", value: (row) => row.sqls, align: "right" },
  { key: "rate", label: "SQL rate", value: (row) => row.sql_rate, render: (row) => percent(row.sql_rate), align: "right" },
  { key: "meetings", label: "Meetings", value: (row) => row.meetings, align: "right" },
  { key: "spend", label: "Spend", value: (row) => row.ad_spend_idr, render: (row) => money(row.ad_spend_idr), align: "right" },
  { key: "cps", label: "Cost per SQL", value: (row) => row.cost_per_sql_idr, render: (row) => money(row.cost_per_sql_idr), align: "right" },
];

export default function RevenueSDRPanelOS({ period, periodLabel, enabled }: RevenueTabProps) {
  const sdr = useRevenue<RevenueSDR>("sdr", period, () => getRevenueSDR(period), enabled);
  const campaigns = useRevenue<RevenueCampaigns>("campaigns", period, () => getRevenueCampaigns({ ...period, page_size: 100 }), enabled);
  const data = sdr.data;
  const previous = data ? periodCaption(data.period.previous_start_date, data.period.previous_end_date) : "";

  if (sdr.isError && !data) return <RevenueErrorOS error={sdr.error} onRetry={() => sdr.refetch()} />;

  return (
    <>
      <p className="text-base text-gray-800 dark:text-zinc-200">
        The SDR&apos;s job: turn leads into qualified meetings, fast.{" "}
        {data && (
          <>
            {periodLabel}: <strong className="font-semibold">{count(data.sqls.current)}</strong> SQLs from{" "}
            <strong className="font-semibold">{count(data.leads.current)}</strong> leads.
          </>
        )}
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <RevenueKpiOS
          label="Lead to SQL"
          value={percent(data?.lead_to_sql_rate)}
          lines={[`${count(data?.sqls.current)} of ${count(data?.leads.current)} leads`, `${percent(data?.previous_lead_to_sql_rate)} in ${previous}`]}
          info="SQLs in the period divided by leads created in the period."
          isLoading={sdr.isLoading}
        />
        <RevenueKpiOS label="Inbound answered in under 5 min" pending="Needs the first response time on each lead." />
        <RevenueKpiOS
          label="Disqualified"
          value={count(data?.disqualified.current)}
          lines={["entered a closing SDR stage"]}
          change={data?.disqualified.change}
          changeLabel={previous}
          invertChange
          info="Pipelines that moved into a terminal SDR stage in the period, from stage history."
          isLoading={sdr.isLoading}
        />
        <RevenueKpiOS
          label="Leads with no source"
          value={percent(data?.untraceable.rate)}
          lines={[`${count(data?.untraceable.count)} leads can't be credited to a campaign`]}
          info="Leads with no channel (or Direct) and no attribution record."
          isLoading={sdr.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RevenueCardOS
          title="Speed to lead: SQL rate by first-reply time"
          description="Membuktikan seberapa besar kecepatan balasan pertama memengaruhi peluang lead menjadi SQL, sebagai dasar target waktu respons SDR."
          pending="Needs the first response time on each lead (under 5 min, 5–60 min, 1–24 h, over 24 h)."
        />
        <RevenueCardOS
          title="Why leads were disqualified"
          description="Mengetahui jenis lead yang paling sering tidak lolos kualifikasi, supaya targeting dan penyaringan awal bisa diperbaiki."
          pending="Needs a reason code when a lead is disqualified."
        />
      </div>

      <RevenueCardOS
        title={`SQLs by campaign, ${periodLabel}`}
        description="Melihat campaign mana yang menghasilkan SQL dan meeting paling banyak dengan biaya paling efisien, serta lead mana yang belum terlacak campaign-nya."
        source="both"
        partialNote="UTM and referral campaigns have no spend matched yet."
        isLoading={campaigns.isLoading}
        error={campaigns.error}
        onRetry={() => campaigns.refetch()}
        isEmpty={!campaigns.data?.list.length}
      >
        <AnalyticsDataTableOS columns={campaignColumns} rows={campaigns.data?.list ?? []} rowKey={(row) => row.key} />
      </RevenueCardOS>
    </>
  );
}
