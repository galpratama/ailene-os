"use client";

import WarehouseRankedBarsOS from "@/components/charts/WarehouseRankedBarsOS";
import WarehouseShareBarsOS from "@/components/charts/WarehouseShareBarsOS";
import WarehouseStackedTrendOS from "@/components/charts/WarehouseStackedTrendOS";
import AnalyticsSectionOS from "@/components/elements/AnalyticsSectionOS";
import AnalyticsToggleOS from "@/components/elements/AnalyticsToggleOS";
import { useAnalyticsView } from "@/contexts/AnalyticsViewContext";
import { channelColor, channelOrder, foldChannel, integer, rate, sumOf } from "@/lib/analytics-warehouse";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";

const segmentColor: Record<string, string> = {
  mobile: "var(--viz-1)",
  desktop: "var(--viz-2)",
  tablet: "var(--viz-3)",
  new: "var(--viz-1)",
  returning: "var(--viz-2)",
};

export default function AnalyticsTrafficPanelOS() {
  const { data, activeFilters } = useAnalyticsView();
  const [regionMetric, setRegionMetric] = useState<"sessions" | "engaged">("sessions");

  const { stacked, series } = useMemo(() => {
    const byDate = new Map<string, Record<string, number>>();
    const seen = new Set<string>();
    for (const day of data.daily) byDate.set(day.date, {});
    for (const row of data.channel_daily) {
      const key = foldChannel(row.channel);
      const day = byDate.get(row.date);
      if (!day || row.sessions === 0) continue;
      day[key] = (day[key] ?? 0) + row.sessions;
      seen.add(key);
    }
    return {
      stacked: [...byDate.entries()].map(([date, values]) => ({ date, ...Object.fromEntries(channelOrder.map((key) => [key, values[key] ?? 0])) })),
      series: channelOrder.filter((key) => seen.has(key)).map((key) => ({ key, color: channelColor(key) })),
    };
  }, [data.channel_daily, data.daily]);

  const sources = useMemo(() => {
    const grouped = new Map<string, { channel: string; label: string; sessions: number; users: number; leads: number; engaged: number }>();
    for (const row of data.traffic_sources) {
      const key = `${row.source} / ${row.medium}`;
      const entry = grouped.get(key) ?? { channel: row.channel, label: key, sessions: 0, users: 0, leads: 0, engaged: 0 };
      entry.sessions += row.sessions;
      entry.users += row.users;
      entry.leads += row.leads;
      entry.engaged += (row.engaged_rate ?? 0) * row.sessions;
      grouped.set(key, entry);
    }
    return [...grouped.values()].sort((a, b) => b.sessions - a.sessions);
  }, [data.traffic_sources]);

  const pick = (dimension: "device" | "region" | "visitor") => data.web_audience.filter((row) => row.dimension === dimension);
  const devices = pick("device");
  const visitors = pick("visitor").filter((row) => row.segment !== "(not set)");
  const regions = pick("region").filter((row) => row.segment !== "(not set)" && row.sessions >= 5);
  const shownRegions = [...regions].sort((a, b) => (regionMetric === "sessions" ? b.sessions - a.sessions : (b.engaged_rate ?? 0) - (a.engaged_rate ?? 0))).slice(0, 10);

  const paidSessions = data.channels.find((row) => row.channel === "Paid Social")?.sessions ?? 0;
  const untagged = sumOf(data.utm_issues, (row) => row.sessions);
  const taggedShare = paidSessions > 0 ? Math.max(0, 1 - untagged / paidSessions) : null;
  const audienceEmpty = activeFilters.campaign ? "GA4 audience data has no campaign dimension, so this view needs the campaign filter removed." : "No GA4 audience data for this slice.";

  return (
    <div className="flex flex-col gap-4">
      <AnalyticsSectionOS
        title="Sessions by channel"
        question="Where visits come from, day by day"
        info="Each column is one day. Its height is total visits and each band is a channel. A wide Paid Social band that collapses on days with no spend means traffic depends on ads. Bands that keep growing without spend, such as Organic Search or Direct, are the healthy kind."
        datasets={["ga4_traffic"]}
        emptyMessage={series.length === 0 ? "No sessions in this slice." : null}
        table={{
          filename: "sessions-by-channel",
          rowKey: (row) => row.channel,
          rows: data.channels,
          columns: [
            { key: "channel", label: "Channel", value: (row) => row.channel },
            { key: "sessions", label: "Sessions", align: "right", value: (row) => row.sessions },
            { key: "engaged", label: "Engaged", align: "right", value: (row) => row.engaged_rate, render: (row) => rate(row.engaged_rate) },
            { key: "leads", label: "Leads", align: "right", value: (row) => row.total_leads },
          ],
        }}
      >
        <WarehouseStackedTrendOS data={stacked} series={series} />
      </AnalyticsSectionOS>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnalyticsSectionOS
          title="Top sources"
          question="Which exact sources send visitors"
          info="Sessions by source and medium, colored by channel. Hover a bar for its engaged rate: a big bar with a low rate brings visits that leave quickly. The table adds the campaign."
          datasets={["ga4_traffic"]}
          emptyMessage={sources.length === 0 ? "No sources in this slice." : null}
          table={{
            filename: "traffic-sources",
            rowKey: (row, index) => `${row.channel}-${row.source}-${row.medium}-${row.campaign}-${index}`,
            rows: data.traffic_sources,
            columns: [
              { key: "channel", label: "Channel", value: (row) => row.channel },
              { key: "source", label: "Source / medium", value: (row) => `${row.source} / ${row.medium}` },
              { key: "campaign", label: "Campaign", value: (row) => row.campaign },
              { key: "sessions", label: "Sessions", align: "right", value: (row) => row.sessions },
              { key: "users", label: "Users", align: "right", value: (row) => row.users },
              { key: "engaged", label: "Engaged", align: "right", value: (row) => row.engaged_rate, render: (row) => rate(row.engaged_rate) },
              { key: "leads", label: "Leads", align: "right", value: (row) => row.leads },
            ],
          }}
        >
          <WarehouseRankedBarsOS
            items={sources.slice(0, 8).map((row) => ({
              key: row.label,
              label: row.label,
              sublabel: row.channel,
              value: row.sessions,
              display: integer(row.sessions),
              color: channelColor(foldChannel(row.channel)),
              rows: [
                { label: "sessions", value: integer(row.sessions) },
                { label: "users", value: integer(row.users) },
                { label: "engaged", value: rate(row.sessions > 0 ? row.engaged / row.sessions : null) },
                { label: "website leads", value: integer(row.leads) },
              ],
            }))}
          />
        </AnalyticsSectionOS>

        <AnalyticsSectionOS
          title="Who visits"
          question="Which devices, and new or returning"
          info="Each bar splits all sessions. Hover a segment for its total. Compare these with the engaged rates on the Landing Page tab: if most visits are mobile but mobile engages poorly, that is where the site loses people."
          datasets={["ga4_audience"]}
          ignores={["campaign"]}
          emptyMessage={devices.length === 0 ? audienceEmpty : null}
          table={{
            filename: "audience-devices-visitors",
            rowKey: (row) => `${row.dimension}-${row.segment}`,
            rows: [...devices, ...visitors],
            columns: [
              { key: "dimension", label: "Dimension", value: (row) => row.dimension },
              { key: "segment", label: "Segment", value: (row) => row.segment },
              { key: "sessions", label: "Sessions", align: "right", value: (row) => row.sessions },
              { key: "engaged", label: "Engaged", align: "right", value: (row) => row.engaged_rate, render: (row) => rate(row.engaged_rate) },
            ],
          }}
        >
          <div className="flex flex-col gap-5">
            <WarehouseShareBarsOS
              rows={[{ key: "device", label: "Device", total: integer(sumOf(devices, (row) => row.sessions)), format: integer, segments: devices.map((row) => ({ key: row.segment, value: row.sessions, color: segmentColor[row.segment] ?? "var(--viz-other)" })) }]}
              legend={devices.map((row) => ({ key: `${row.segment} · ${rate(row.engaged_rate, 0)} engaged`, color: segmentColor[row.segment] ?? "var(--viz-other)" }))}
            />
            <WarehouseShareBarsOS
              rows={[{ key: "visitor", label: "New or returning", total: integer(sumOf(visitors, (row) => row.sessions)), format: integer, segments: visitors.map((row) => ({ key: row.segment, value: row.sessions, color: segmentColor[row.segment] ?? "var(--viz-other)" })) }]}
              legend={visitors.map((row) => ({ key: `${row.segment} · ${rate(row.engaged_rate, 0)} engaged`, color: segmentColor[row.segment] ?? "var(--viz-other)" }))}
            />
          </div>
        </AnalyticsSectionOS>

        <AnalyticsSectionOS
          title="Top regions"
          question="Where visitors are, and how engaged they are"
          info="Regions with at least 5 sessions. Switch to Engaged to see where visits are highest quality. A small region with a high engaged rate can be worth targeting directly."
          datasets={["ga4_audience"]}
          ignores={["campaign"]}
          controls={<AnalyticsToggleOS label="Measure" value={regionMetric} onChange={setRegionMetric} options={[{ value: "sessions", label: "Sessions" }, { value: "engaged", label: "Engaged" }]} />}
          emptyMessage={regions.length === 0 ? audienceEmpty : null}
          table={{
            filename: "audience-regions",
            rowKey: (row) => row.segment,
            rows: pick("region"),
            columns: [
              { key: "region", label: "Region", value: (row) => row.segment },
              { key: "sessions", label: "Sessions", align: "right", value: (row) => row.sessions },
              { key: "engaged", label: "Engaged", align: "right", value: (row) => row.engaged_rate, render: (row) => rate(row.engaged_rate) },
            ],
          }}
        >
          <WarehouseRankedBarsOS
            maxValue={regionMetric === "engaged" ? 1 : undefined}
            items={shownRegions.map((row) => ({
              key: row.segment,
              label: row.segment,
              value: regionMetric === "sessions" ? row.sessions : row.engaged_rate ?? 0,
              display: regionMetric === "sessions" ? integer(row.sessions) : rate(row.engaged_rate, 0),
              rows: [
                { label: "sessions", value: integer(row.sessions) },
                { label: "engaged", value: rate(row.engaged_rate) },
              ],
            }))}
          />
        </AnalyticsSectionOS>

        <AnalyticsSectionOS
          title="UTM hygiene"
          question="Can paid traffic be traced back to an ad"
          info="A paid session without an ad ID or campaign cannot be credited to any ad, which makes creative decisions unreliable. Aim for 100% tagged. If this drops, check the URL parameters on recently launched ads."
          datasets={["ga4_traffic"]}
          emptyMessage={paidSessions === 0 ? "No Paid Social sessions in this slice." : null}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-baseline gap-2">
              <p className="font-heading text-3xl font-semibold text-gray-900 dark:text-zinc-100">{rate(taggedShare, 1)}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">of {integer(paidSessions)} Paid Social sessions are fully tagged</p>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-zinc-800">
              <div className="h-full rounded-full bg-viz-1" style={{ width: `${(taggedShare ?? 0) * 100}%` }} />
            </div>
            {data.utm_issues.length === 0 ? (
              <p className="flex items-center gap-1.5 text-xs" style={{ color: "var(--label-hijau)" }}><CircleCheck size={14} aria-hidden="true" /> Every paid session can be traced to an ad.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {data.utm_issues.map((issue) => (
                  <li key={issue.issue} className="flex items-start gap-1.5 text-xs text-gray-700 dark:text-zinc-300">
                    <TriangleAlert size={14} className="mt-px shrink-0" style={{ color: "var(--label-kuning)" }} aria-hidden="true" />
                    <span><strong className="font-semibold">{integer(issue.sessions)}</strong> session{issue.sessions === 1 ? "" : "s"} {issue.issue.replace("Paid Social sessions ", "")}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </AnalyticsSectionOS>
      </div>
    </div>
  );
}
