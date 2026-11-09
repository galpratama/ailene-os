"use client";

import type { RevenueDataHealth, RevenueSourceHealth } from "@/apis/revenue";
import WarehouseRankedBarsOS from "@/components/charts/WarehouseRankedBarsOS";
import AnalyticsDataTableOS, { type AnalyticsColumn } from "@/components/elements/AnalyticsDataTableOS";
import RevenueCardOS from "@/components/elements/RevenueCardOS";
import RevenueErrorOS from "@/components/elements/RevenueErrorOS";
import RevenueKpiOS from "@/components/elements/RevenueKpiOS";
import SourceHealthLabelOS from "@/components/labels/SourceHealthLabelOS";
import type { RevenueTabProps } from "@/components/pages/RevenueEngineOS";
import { useRevenue } from "@/hooks/useRevenue";
import { getRevenueDataHealth } from "@/lib/actions";
import { count, percent, shortDate } from "@/lib/revenue";

const sourceNames: Record<string, string> = {
  ailene_os: "Ailene OS",
  meta_ads: "Meta Ads",
  ga4: "Google Analytics 4",
  search_console: "Search Console",
  google_ads: "Google Ads",
};

const sourceColumns: AnalyticsColumn<RevenueSourceHealth>[] = [
  { key: "source", label: "Source", value: (row) => sourceNames[row.source] ?? row.source },
  { key: "via", label: "Through", value: (row) => (row.via === "warehouse" ? "Marketing warehouse" : "OS database") },
  { key: "through", label: "Data through", value: (row) => row.data_through, render: (row) => shortDate(row.data_through) },
  {
    key: "loaded",
    label: "Last sync",
    value: (row) => row.loaded_at,
    render: (row) => (row.loaded_at ? new Date(row.loaded_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }) : "—"),
  },
  { key: "status", label: "Status", value: (row) => row.status, render: (row) => <SourceHealthLabelOS status={row.status} /> },
];

export default function RevenueDataHealthPanelOS({ period, periodLabel, enabled }: RevenueTabProps) {
  const health = useRevenue<RevenueDataHealth>("data-health", period, () => getRevenueDataHealth(period), enabled);
  const data = health.data;
  const connected = data?.sources.filter((source) => source.status !== "not_connected").length ?? 0;
  const warehouseDown = data?.data_gaps.some((gap) => gap.code === "warehouse_unavailable");

  if (health.isError && !data) return <RevenueErrorOS error={health.error} onRetry={() => health.refetch()} />;

  return (
    <>
      <p className="text-base text-gray-800 dark:text-zinc-200">
        The plumbing behind every number. If a source is late or a lead has no source, the dashboard is guessing.
      </p>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <RevenueKpiOS
          label="Sources connected"
          value={warehouseDown ? count(connected) : `${count(connected)} of ${count(data?.sources.length)}`}
          lines={[warehouseDown ? "the marketing warehouse could not be reached" : "with data in the warehouse or OS"]}
          isLoading={health.isLoading}
        />
        <RevenueKpiOS
          label="Leads traceable to a source"
          value={percent(data?.traceable_lead_rate)}
          lines={[`${count(data?.untraceable_leads)} of ${count(data?.leads)} ${periodLabel} leads have no channel and no attribution`]}
          info="A lead is traceable when it has a channel other than Direct, or a first-touch attribution record."
          isLoading={health.isLoading}
        />
        <RevenueKpiOS label="GTM plumbing built" pending="Needs a tracked checklist of the GTM builds." />
      </div>

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-5">
        <RevenueCardOS title="Source freshness" description="Lagging means the newest data is more than 2 days old." className="2xl:col-span-3" isLoading={health.isLoading}>
          <AnalyticsDataTableOS columns={sourceColumns} rows={data?.sources ?? []} rowKey={(row) => row.source} />
        </RevenueCardOS>
        <RevenueCardOS title={`Where ${periodLabel}'s leads lose their source`} description="Share of the period's leads missing each piece." source="Ailene OS pipelines and attribution" className="2xl:col-span-2" isLoading={health.isLoading} isEmpty={!data?.leads}>
          {data && (
            <WarehouseRankedBarsOS
              maxValue={1}
              color="var(--viz-3)"
              items={[
                { key: "channel", label: "No channel", value: data.leads_without_channel / data.leads, count: data.leads_without_channel },
                { key: "attribution", label: "No attribution record", value: data.leads_without_attribution / data.leads, count: data.leads_without_attribution },
                { key: "both", label: "Neither (untraceable)", value: data.untraceable_leads / data.leads, count: data.untraceable_leads },
              ].map((item) => ({ ...item, display: percent(item.value), rows: [{ label: "leads", value: count(item.count) }] }))}
            />
          )}
        </RevenueCardOS>
      </div>

      <RevenueCardOS
        title="GTM plumbing, in build order"
        description="From ad click to cash, with one ID following the lead all the way."
        pending="Needs the build checklist stored with an owner and status."
        pendingShape="table"
        pendingColumns={["Step", "Build", "Owner", "Status", "What it unlocks"]}
      />
    </>
  );
}
