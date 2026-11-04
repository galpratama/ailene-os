"use client";

import WarehouseFunnelChartOS from "@/components/charts/WarehouseFunnelChartOS";
import WarehouseShareBarsOS, { type ShareRow } from "@/components/charts/WarehouseShareBarsOS";
import WarehouseTrendChartOS from "@/components/charts/WarehouseTrendChartOS";
import AnalyticsInsightsOS from "@/components/elements/AnalyticsInsightsOS";
import AnalyticsSectionOS from "@/components/elements/AnalyticsSectionOS";
import AnalyticsKpiTileOS from "@/components/items/AnalyticsKpiTileOS";
import AnalyticsAdCostRankingOS from "@/components/static-sections/AnalyticsAdCostRankingOS";
import { useAnalyticsView } from "@/contexts/AnalyticsViewContext";
import { channelColor, channelInk, channelOrder, compact, coverageOf, foldChannel, integer, isComparable, money, moneyOrDash, overviewInsights, rate, sumOf } from "@/lib/analytics-warehouse";
import { useMemo } from "react";

export default function AnalyticsOverviewPanelOS() {
  const { data } = useAnalyticsView();
  const { current, previous, changes } = data.summary;
  const comparable = isComparable(data, ["meta_ads", "ga4_traffic"]);
  const days = data.daily;

  const mix = useMemo(() => {
    const grouped = new Map<string, { sessions: number; leads: number; spend: number }>();
    for (const row of data.channels) {
      const key = foldChannel(row.channel);
      const entry = grouped.get(key) ?? { sessions: 0, leads: 0, spend: 0 };
      entry.sessions += row.sessions;
      entry.leads += row.total_leads;
      entry.spend += row.spend_idr;
      grouped.set(key, entry);
    }
    return channelOrder.filter((key) => grouped.has(key)).map((key) => ({ key, ...grouped.get(key)! }));
  }, [data.channels]);

  const shareRows: ShareRow[] = (["sessions", "leads", "spend"] as const).map((metric) => ({
    key: metric,
    label: { sessions: "Share of sessions", leads: "Share of leads", spend: "Share of spend" }[metric],
    total: metric === "spend" ? money(sumOf(mix, (row) => row.spend)) : integer(sumOf(mix, (row) => row[metric])),
    format: metric === "spend" ? money : integer,
    segments: mix.map((row) => ({ key: row.key, value: row[metric], color: channelColor(row.key), ink: channelInk(row.key) })),
  }));

  const paidLeader = mix.reduce<(typeof mix)[number] | null>((best, row) => (!best || row.leads > best.leads ? row : best), null);
  const totalSessions = sumOf(mix, (row) => row.sessions);
  const totalLeads = sumOf(mix, (row) => row.leads);

  return (
    <div className="flex flex-col gap-4">
      <AnalyticsInsightsOS insights={overviewInsights(data)} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <AnalyticsKpiTileOS label="Spend" info="Total ad spend in IDR for this slice. Neither good nor bad on its own, so its delta stays gray." value={money(current.spend_idr)} change={changes.spend_idr} previous={money(previous.spend_idr)} goodWhen="neutral" comparable={comparable} series={days.map((day) => day.spend_idr)} />
        <AnalyticsKpiTileOS label="Total leads" info="Meta form leads plus website form submissions, counted once. Higher is better." value={integer(current.total_leads)} change={changes.total_leads} previous={integer(previous.total_leads)} comparable={comparable} series={days.map((day) => day.total_leads)} />
        <AnalyticsKpiTileOS label="Cost per lead" info="Spend divided by leads. Lower is better, so a fall shows green. Hidden below 5 leads because a tiny sample swings wildly." value={moneyOrDash(current.cpl_idr)} change={changes.cpl_idr} previous={moneyOrDash(previous.cpl_idr)} goodWhen="down" comparable={comparable} />
        <AnalyticsKpiTileOS label="Sessions" info="GA4 visits to the marketing site from every channel, not only ads." value={integer(current.sessions)} change={changes.sessions} previous={integer(previous.sessions)} comparable={comparable} series={days.map((day) => day.sessions)} />
        <AnalyticsKpiTileOS label="Engaged rate" info="Share of sessions that stayed over 10 seconds, viewed two pages, or converted. Higher means visitors actually read." value={rate(current.engaged_rate)} change={changes.engaged_rate} previous={rate(previous.engaged_rate)} comparable={comparable} series={days.map((day) => (day.sessions > 0 ? day.engaged_sessions / day.sessions : null))} />
        <AnalyticsKpiTileOS label="Lead conversion" info="Leads divided by sessions. Meta form leads never visit the site, so read this as a blended indicator." value={rate(current.conversion_rate, 2)} change={changes.conversion_rate} previous={rate(previous.conversion_rate, 2)} comparable={comparable} />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <AnalyticsSectionOS
          className="xl:col-span-2"
          title="Daily pulse"
          question="Did spend turn into leads, day by day"
          info="Each plot has its own scale and all three share the same dates, so hovering one lines up the others. Look for days where spend stays high but leads go flat. Shading marks days a source has not loaded yet."
          datasets={["meta_ads", "ga4_traffic"]}
          table={{
            filename: "daily-pulse",
            rowKey: (row) => row.date,
            rows: days,
            columns: [
              { key: "date", label: "Date", value: (row) => row.date },
              { key: "spend", label: "Spend", align: "right", value: (row) => row.spend_idr, render: (row) => money(row.spend_idr) },
              { key: "leads", label: "Leads", align: "right", value: (row) => row.total_leads },
              { key: "sessions", label: "Sessions", align: "right", value: (row) => row.sessions },
            ],
          }}
        >
          <div className="flex flex-col gap-3">
            <WarehouseTrendChartOS syncId="pulse" label="Spend" headline={money(current.spend_idr)} format={money} formatTick={compact} points={days.map((day) => ({ date: day.date, value: day.spend_idr }))} showDates={false} notLoadedAfter={coverageOf(data, "meta_ads")?.last_date} height={88} />
            <WarehouseTrendChartOS syncId="pulse" label="Leads" headline={integer(current.total_leads)} format={integer} color="var(--viz-2)" points={days.map((day) => ({ date: day.date, value: day.total_leads }))} showDates={false} notLoadedAfter={coverageOf(data, "meta_ads")?.last_date} height={88} />
            <WarehouseTrendChartOS syncId="pulse" label="Sessions" headline={integer(current.sessions)} format={integer} formatTick={compact} kind="area" color="var(--viz-4)" points={days.map((day) => ({ date: day.date, value: day.sessions }))} notLoadedAfter={coverageOf(data, "ga4_traffic")?.last_date} height={88} />
          </div>
        </AnalyticsSectionOS>

        <AnalyticsSectionOS
          className="xl:col-span-3"
          title="From impression to lead"
          question="Where people drop out"
          info="Read each column top to bottom. '% continue' is the share that reached the next step, and the lowest one in a column is your biggest leak. The columns count different groups, so never compare a number across columns."
          datasets={["meta_ads", "ga4_traffic"]}
          table={{
            filename: "funnel",
            rowKey: (row) => row.key,
            rows: data.funnel,
            columns: [
              { key: "lane", label: "Group", value: (row) => row.lane },
              { key: "step", label: "Step", value: (row) => row.label },
              { key: "value", label: "Total", align: "right", value: (row) => row.value },
              { key: "rate", label: "Continue from previous", align: "right", value: (row) => row.from_previous_rate, render: (row) => rate(row.from_previous_rate) },
            ],
          }}
        >
          <WarehouseFunnelChartOS steps={data.funnel} />
        </AnalyticsSectionOS>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnalyticsSectionOS
          title="Channel mix"
          question="Which channels bring traffic, and which bring leads"
          info="Each bar splits a total by channel, using the same color for a channel in all three. Compare a color across the bars: a channel with a large share of sessions but a small share of leads brings visitors who do not convert."
          datasets={["meta_ads", "ga4_traffic"]}
          takeaway={paidLeader && totalLeads > 0 ? <><strong className="font-semibold">{paidLeader.key}</strong> brings {rate(paidLeader.sessions / Math.max(totalSessions, 1), 0)} of sessions and {rate(paidLeader.leads / totalLeads, 0)} of leads.</> : undefined}
          emptyMessage={data.channels.length === 0 ? "No channel data for this slice. Try removing a filter." : null}
          table={{
            filename: "channel-mix",
            rowKey: (row) => row.channel,
            rows: data.channels,
            columns: [
              { key: "channel", label: "Channel", value: (row) => row.channel },
              { key: "sessions", label: "Sessions", align: "right", value: (row) => row.sessions },
              { key: "engaged", label: "Engaged", align: "right", value: (row) => row.engaged_rate, render: (row) => rate(row.engaged_rate) },
              { key: "leads", label: "Leads", align: "right", value: (row) => row.total_leads },
              { key: "spend", label: "Spend", align: "right", value: (row) => row.spend_idr, render: (row) => money(row.spend_idr) },
              { key: "cpl", label: "Cost per lead", align: "right", value: (row) => row.cpl_idr, render: (row) => moneyOrDash(row.cpl_idr) },
            ],
          }}
        >
          <WarehouseShareBarsOS rows={shareRows} legend={mix.map((row) => ({ key: row.key, color: channelColor(row.key) }))} />
        </AnalyticsSectionOS>

        <AnalyticsAdCostRankingOS />
      </div>
    </div>
  );
}
