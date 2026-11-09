"use client";

import type { RevenueAds, RevenueLeadFlow, RevenueSourceChannel, RevenueSources, RevenueWeeklySources } from "@/apis/revenue";
import RevenueLeadFlowChartOS from "@/components/charts/RevenueLeadFlowChartOS";
import WarehouseFunnelChartOS from "@/components/charts/WarehouseFunnelChartOS";
import WarehouseRankedBarsOS from "@/components/charts/WarehouseRankedBarsOS";
import WarehouseStackedTrendOS from "@/components/charts/WarehouseStackedTrendOS";
import AnalyticsDataTableOS, { type AnalyticsColumn } from "@/components/elements/AnalyticsDataTableOS";
import RevenueCardOS from "@/components/elements/RevenueCardOS";
import RevenueErrorOS from "@/components/elements/RevenueErrorOS";
import AdVerdictLabelOS from "@/components/labels/AdVerdictLabelOS";
import PendingLabelOS from "@/components/labels/PendingLabelOS";
import type { RevenueTabProps } from "@/components/pages/RevenueEngineOS";
import { useWarehouseAnalytics } from "@/hooks/useAnalyticsDashboard";
import { useRevenue } from "@/hooks/useRevenue";
import { getRevenueAds, getRevenueLeadFlow, getRevenueSources, getRevenueWeeklySources } from "@/lib/actions";
import { channelLabel, count, leadGroupColors, leadGroupLabels, leadGroups, leadGroupShortLabels, money, percent } from "@/lib/revenue";

const kindLabels = { instant_form: "Instant Form", landing_page: "Landing page", unknown: "Unknown destination" };

const scorecardColumns: AnalyticsColumn<RevenueSourceChannel>[] = [
  { key: "channel", label: "Channel", value: (row) => channelLabel(row.lead_channel) },
  { key: "group", label: "Source", value: (row) => leadGroupShortLabels[row.group] },
  { key: "leads", label: "Leads", value: (row) => row.leads, align: "right" },
  { key: "sqls", label: "SQL", value: (row) => row.sqls, align: "right" },
  { key: "rate", label: "SQL rate", value: (row) => row.sql_rate, render: (row) => percent(row.sql_rate), align: "right" },
  { key: "meetings", label: "Meetings", value: (row) => row.meetings, align: "right" },
  { key: "won", label: "Won", value: (row) => row.won, align: "right" },
  { key: "revenue", label: "Revenue", value: (row) => row.revenue, render: (row) => money(row.revenue), align: "right" },
  { key: "spend", label: "Ad spend", value: (row) => row.ad_spend_idr, render: (row) => money(row.ad_spend_idr), align: "right" },
  { key: "cps", label: "Cost per SQL", value: (row) => row.cost_per_sql_idr, render: (row) => money(row.cost_per_sql_idr), align: "right" },
];

export default function RevenueLeadGenPanelOS({ period, periodLabel, enabled }: RevenueTabProps) {
  const sources = useRevenue<RevenueSources>("sources", period, () => getRevenueSources(period), enabled);
  const flow = useRevenue<RevenueLeadFlow>("lead-flow", period, () => getRevenueLeadFlow(period), enabled);
  const ads = useRevenue<RevenueAds>("ads", period, () => getRevenueAds(period), enabled);
  const weekly = useRevenue<RevenueWeeklySources>("sources/weekly", period, () => getRevenueWeeklySources(period), enabled);
  const warehouse = useWarehouseAnalytics(period, enabled, false);

  const groups = sources.data?.groups ?? [];
  const totalLeads = groups.reduce((sum, group) => sum + group.leads, 0);
  const channels = sources.data?.channels ?? [];
  const rated = channels.filter((row) => row.leads > 0).sort((a, b) => (b.sql_rate ?? 0) - (a.sql_rate ?? 0));

  if (sources.isError && !sources.data) return <RevenueErrorOS error={sources.error} onRetry={() => sources.refetch()} />;

  return (
    <>
      <p className="flex flex-wrap items-center gap-2 text-base text-gray-800 dark:text-zinc-200">
        <span>
          Where the <strong className="font-semibold">{count(totalLeads)}</strong> {totalLeads === 1 ? "lead" : "leads"} from {periodLabel} came from, and how far each source got.
        </span>
        <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400">Lead target: <PendingLabelOS /></span>
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {leadGroups.map((key) => {
          const group = groups.find((entry) => entry.group === key);
          return (
            <div key={key} className="rounded-xl border border-line bg-card-bg px-4 py-3.5">
              <p className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-zinc-300">
                <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: leadGroupColors[key] }} />
                {leadGroupLabels[key]}
              </p>
              {sources.isLoading ? (
                <span aria-busy="true" className="mt-2 block h-7 w-16 animate-pulse rounded-md bg-line-soft" />
              ) : (
                <>
                  <p className="mt-1 font-heading text-2xl font-semibold tabular-nums text-gray-900 dark:text-zinc-100">{count(group?.leads ?? 0)}</p>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    <strong className="font-semibold text-gray-700 dark:text-zinc-200">{count(group?.sqls ?? 0)}</strong> SQL ·{" "}
                    <strong className="font-semibold text-gray-700 dark:text-zinc-200">{count(group?.won ?? 0)}</strong> won
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>

      <RevenueCardOS
        title="Lead flow: source → qualification → meeting → outcome"
        description="Leads created this period, followed to where they are today. Band width is the number of leads; color follows the source all the way through."
        source="Ailene OS pipelines"
        isLoading={flow.isLoading}
        error={flow.error}
        onRetry={() => flow.refetch()}
        isEmpty={!flow.data?.links.length}
        emptyMessage="No leads were created in this period."
      >
        {flow.data && <RevenueLeadFlowChartOS data={flow.data} />}
      </RevenueCardOS>

      <RevenueCardOS
        title="From ad impression to lead"
        description="Where people drop off before they reach Ailene OS. Each lane counts a different population."
        source="Meta Ads, GA4 · marketing warehouse"
        partialNote="WhatsApp chats are not tracked yet."
        isLoading={warehouse.isLoading}
        isEmpty={!warehouse.data?.funnel.length}
        emptyMessage={warehouse.isError ? "The marketing warehouse could not be reached." : "No ad or website activity in this period."}
      >
        {warehouse.data && <WarehouseFunnelChartOS steps={warehouse.data.funnel} />}
      </RevenueCardOS>

      <RevenueCardOS
        title="Every ad, judged by SQLs, not form fills"
        description={`Hook: share of impressions that watched 3 seconds. Hold: share of those that kept watching. Verdict compares cost per SQL with the average${ads.data?.benchmark_cost_per_sql_idr ? ` (${money(ads.data.benchmark_cost_per_sql_idr)})` : ""} once an ad has 5+ leads.`}
        source="Meta Ads spend · Ailene OS leads by ad ID"
        isLoading={ads.isLoading}
        error={ads.error}
        onRetry={() => ads.refetch()}
        isEmpty={!ads.data?.ads.length}
        emptyMessage="No ads ran in this period."
        partialNote={ads.data?.data_gaps.some((gap) => gap.code === "landing_page_ad_attribution") ? "Landing-page ads count SQLs only once the website stores the ad ID." : undefined}
      >
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-4">
          {(ads.data?.ads ?? []).map((ad) => (
            <li key={ad.ad_id} className="flex flex-col gap-2 rounded-lg border border-line-soft p-3">
              <div>
                <p className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-zinc-100">{ad.ad_name ?? ad.ad_id}</p>
                <p className="truncate text-xs text-gray-500 dark:text-zinc-400">
                  {kindLabels[ad.destination_kind]}
                  {ad.campaign ? ` · ${ad.campaign}` : ""}
                </p>
              </div>
              <AdVerdictLabelOS verdict={ad.verdict} />
              <dl className="grid grid-cols-3 gap-2 text-xs">
                {[
                  ["Hook", percent(ad.hook_rate, 1)],
                  ["Hold", percent(ad.hold_rate, 1)],
                  ["Link CTR", percent(ad.link_ctr, 1)],
                  ["Spend", money(ad.spend_idr)],
                  ["Leads · SQL", `${count(ad.leads)} · ${count(ad.sqls)}`],
                  ["Per SQL", money(ad.cost_per_sql_idr)],
                ].map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="truncate text-gray-500 dark:text-zinc-400">{label}</dt>
                    <dd className="truncate font-semibold tabular-nums text-gray-900 dark:text-zinc-100">{value}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      </RevenueCardOS>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RevenueCardOS
          title="Leads per week by source"
          description="New leads by Jakarta week in the selected range; partial boundary weeks include only selected dates."
          source="Ailene OS pipelines"
          isLoading={weekly.isLoading}
          error={weekly.error}
          onRetry={() => weekly.refetch()}
        >
          <WarehouseStackedTrendOS
            unit="leads"
            data={(weekly.data?.weeks ?? []).map((week) => ({
              date: week.week_start,
              ...Object.fromEntries(leadGroups.map((group) => [leadGroupShortLabels[group], week.groups[group] ?? 0])),
            }))}
            series={leadGroups.map((group) => ({ key: leadGroupShortLabels[group], color: leadGroupColors[group] }))}
          />
        </RevenueCardOS>
        <RevenueCardOS
          title="SQL rate by channel"
          description={`Share of ${periodLabel}'s leads per channel that became SQLs.`}
          source="Ailene OS pipelines"
          isLoading={sources.isLoading}
          isEmpty={rated.length === 0}
        >
          <WarehouseRankedBarsOS
            maxValue={1}
            items={rated.map((row) => ({
              key: `${row.group}-${row.lead_channel}`,
              label: channelLabel(row.lead_channel),
              sublabel: leadGroupShortLabels[row.group],
              value: row.sql_rate ?? 0,
              display: percent(row.sql_rate),
              color: leadGroupColors[row.group],
              rows: [
                { label: "leads", value: count(row.leads) },
                { label: "SQLs", value: count(row.sqls) },
              ],
            }))}
          />
        </RevenueCardOS>
      </div>

      <RevenueCardOS
        title={`Channel scorecard, ${periodLabel}`}
        description="Every count is an event in this period. Cost per SQL counts Meta ad spend only."
        source="Ailene OS pipelines · Meta Ads spend"
        partialNote="Google Ads spend and outbound team time are not priced yet."
        isLoading={sources.isLoading}
        isEmpty={channels.length === 0}
      >
        <AnalyticsDataTableOS columns={scorecardColumns} rows={channels} rowKey={(row) => `${row.group}-${row.lead_channel}`} />
      </RevenueCardOS>
    </>
  );
}
