"use client";

import AnalyticsTrendChartOS from "@/components/charts/AnalyticsTrendChartOS";
import CTAMixChartOS from "@/components/charts/CTAMixChartOS";
import DonutChartOS from "@/components/charts/DonutChartOS";
import FunnelChartOS from "@/components/charts/FunnelChartOS";
import MetricChangeChartOS from "@/components/charts/MetricChangeChartOS";
import ScrollDepthChartOS from "@/components/charts/ScrollDepthChartOS";
import ChangeIndicator from "@/components/labels/ChangeIndicator";
import AnalyticsTablePaginationOS, {
  ANALYTICS_TABLE_PAGE_SIZE,
} from "@/components/navigations/AnalyticsTablePaginationOS";
import {
  compactNumber,
  percentLabel,
  shortDateLabel,
} from "@/lib/analytics-format";
import { useMarketingDashboard } from "@/hooks/useAnalyticsDashboard";
import {
  Activity,
  Eye,
  Handshake,
  LayoutList,
  MousePointerClick,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

const HIDDEN_FUNNEL_STAGES = new Set(["trainers", "evaluated"]);

export default function AnalyticsGA4PanelOS({
  sessionToken,
  startDate,
  endDate,
}: {
  sessionToken: string;
  startDate: string;
  endDate: string;
}) {
  const query = useMarketingDashboard(
    { start_date: startDate, end_date: endDate },
    !!sessionToken && !!startDate && !!endDate
  );
  const [blocksPage, setBlocksPage] = useState(1);
  const [channelsPage, setChannelsPage] = useState(1);

  const data = query.data;
  const featureSchemaReady = data?.feature_schema.available ?? false;

  const cards = data
    ? [
        {
          label: "Active Users",
          value: compactNumber(data.summary.current.users),
          change: data.summary.changes.users,
          icon: Users,
        },
        {
          label: "Sessions",
          value: compactNumber(data.summary.current.sessions),
          change: data.summary.changes.sessions,
          icon: Activity,
        },
        {
          label: "Page Views",
          value: compactNumber(data.summary.current.page_views),
          change: data.summary.changes.page_views,
          icon: Eye,
        },
        {
          label: "CTA Clicks",
          value: compactNumber(data.summary.current.cta_clicks),
          change: data.summary.changes.cta_clicks,
          icon: MousePointerClick,
        },
        {
          label: "Leads",
          value: compactNumber(data.summary.current.leads),
          change: data.summary.changes.leads,
          icon: Handshake,
        },
      ]
    : [];

  const trendMetrics = featureSchemaReady
    ? [
        { key: "sessions", label: "Sessions" },
        { key: "users", label: "Active Users" },
        { key: "leads", label: "Leads" },
      ]
    : [
        { key: "sessions", label: "Sessions" },
        { key: "users", label: "Active Users" },
      ];

  const metricChanges = data
    ? [
        {
          key: "users",
          label: "Active Users",
          current: data.summary.current.users,
          previous: data.summary.previous.users,
          change: data.summary.changes.users,
        },
        {
          key: "sessions",
          label: "Sessions",
          current: data.summary.current.sessions,
          previous: data.summary.previous.sessions,
          change: data.summary.changes.sessions,
        },
        {
          key: "page_views",
          label: "Page Views",
          current: data.summary.current.page_views,
          previous: data.summary.previous.page_views,
          change: data.summary.changes.page_views,
        },
        {
          key: "cta_clicks",
          label: "CTA Clicks",
          current: data.summary.current.cta_clicks,
          previous: data.summary.previous.cta_clicks,
          change: data.summary.changes.cta_clicks,
        },
        {
          key: "leads",
          label: "Leads",
          current: data.summary.current.leads,
          previous: data.summary.previous.leads,
          change: data.summary.changes.leads,
        },
      ]
    : [];

  // Several source/medium rows can share one channel group, so fold them first.
  const channelSlices = useMemo(() => {
    if (!data) return [];
    const totals = new Map<string, number>();
    for (const channel of data.channels) {
      totals.set(
        channel.channel,
        (totals.get(channel.channel) ?? 0) + channel.sessions
      );
    }
    return [...totals.entries()]
      .map(([label, value]) => ({ key: label, label, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const maxBlockViews = Math.max(
    ...(data?.blocks.map((block) => block.views) ?? [1]),
    1
  );
  const funnelStages = data?.funnel.filter((stage) => !HIDDEN_FUNNEL_STAGES.has(stage.key)) ?? [];
  const hasTrackedFunnel = funnelStages.some((entry) => entry.users > 0);
  const previousPeriodLabel = data
    ? `${shortDateLabel(data.period.previous_start_date)} – ${shortDateLabel(
        data.period.previous_end_date
      )}`
    : "";
  const currentBlocksPage = Math.min(
    blocksPage,
    Math.max(1, Math.ceil((data?.blocks.length ?? 0) / ANALYTICS_TABLE_PAGE_SIZE))
  );
  const currentChannelsPage = Math.min(
    channelsPage,
    Math.max(1, Math.ceil((data?.channels.length ?? 0) / ANALYTICS_TABLE_PAGE_SIZE))
  );

  return (
    <div className="flex flex-col gap-5">
      {query.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl border border-line bg-card-bg"
            />
          ))}
        </div>
      )}

      {query.isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30">
          <h3 className="text-sm font-bold text-red-700 dark:text-red-300">
            GA4 data could not be loaded
          </h3>
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {query.error?.message}
          </p>
        </div>
      )}

      {data && (
        <>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">Traffic overview</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Key metrics for the selected period, compared with {previousPeriodLabel || "the previous period"}.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-line bg-card-bg p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-claude/10 text-claude">
                    <card.icon size={16} />
                  </div>
                  <ChangeIndicator value={card.change} />
                </div>
                <p className="mt-4 truncate text-2xl font-bold text-gray-900 dark:text-zinc-100">
                  {card.value}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">
                  {card.label}
                </p>
              </div>
            ))}
          </div>

          {!featureSchemaReady && (
            <div className="rounded-xl border border-kuning/50 bg-kuning-t p-4 text-sm text-gray-700">
              <span className="font-bold">
                The feature schema is not readable yet.
              </span>{" "}
              Register <code>feature_id</code> and <code>feature_name</code> as
              event-scoped custom dimensions in the GA4 property, then reload —
              the funnel, scroll depth, CTA mix and block table stay empty until
              then. GA4 only collects them from the moment they are registered,
              so this period stays thin for a while.
            </div>
          )}

          {featureSchemaReady && !hasTrackedFunnel && (
            <div className="rounded-xl border border-kuning/50 bg-kuning-t p-4 text-sm text-gray-700">
              <span className="font-bold">No tracked events yet.</span> No
              view or click events landed in this period. Confirm the
              GTM triggers are published on the production container.
            </div>
          )}

          <AnalyticsTrendChartOS
            data={data.daily}
            metrics={trendMetrics}
            description="Daily sessions, users and leads across the reporting period."
          />

          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">Visitor journey</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Follow visitors from arrival to conversion, left to right.</p>
          </div>
          <FunnelChartOS
            stages={funnelStages}
            description="Distinct users at each stage; the arrows show drop-off to the next stage."
          />

          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">Engagement and acquisition</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">How visitors engage with the page and where sessions originate.</p>
          </div>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <ScrollDepthChartOS data={data.scroll_depth} />
            <CTAMixChartOS data={data.cta_breakdown} />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <DonutChartOS
              data={channelSlices}
              title="Traffic by channel"
              description="Where marketing site sessions originate."
              centerLabel="sessions"
            />
            <MetricChangeChartOS
              data={metricChanges}
              periodLabel={previousPeriodLabel}
            />
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">Detailed reports</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Explore landing page sections and acquisition sources.</p>
          </div>

          <section className="overflow-hidden rounded-xl border border-line bg-card-bg">
            <div className="flex items-center gap-2 border-b border-line-soft px-5 py-4">
              <LayoutList size={16} className="text-claude" />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-zinc-100">
                  Landing page blocks
                </h3>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
                  Every tracked section, in the order a visitor scrolls past it.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-190 text-sm tabular-nums">
                <thead>
                  <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <th className="px-5 py-3">Block</th>
                    <th className="px-5 py-3">Reach</th>
                    <th className="px-5 py-3">Views</th>
                    <th className="px-5 py-3">Viewers</th>
                    <th className="px-5 py-3">Clicks</th>
                    <th className="px-5 py-3">Click Rate</th>
                    <th className="px-5 py-3">Leads</th>
                  </tr>
                </thead>
                <tbody>
                  {data.blocks.slice(
                    (currentBlocksPage - 1) * ANALYTICS_TABLE_PAGE_SIZE,
                    currentBlocksPage * ANALYTICS_TABLE_PAGE_SIZE
                  ).map((block) => (
                    <tr
                      key={block.id}
                      className="border-b border-line-soft last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-900 dark:text-zinc-100">
                          {block.position}. {block.label}
                        </p>
                        <p className="text-xs text-gray-400">{block.id}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
                          <div
                            className="h-full rounded-full bg-claude"
                            style={{
                              width: `${Math.max(
                                block.views > 0 ? 3 : 0,
                                (block.views / maxBlockViews) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3.5">{block.views}</td>
                      <td className="px-5 py-3.5">{block.view_users}</td>
                      <td className="px-5 py-3.5">{block.clicks}</td>
                      <td className="px-5 py-3.5">
                        {percentLabel(block.click_through_rate)}
                      </td>
                      <td className="px-5 py-3.5 font-semibold">
                        {block.leads}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.blocks.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-400">
                  No tracked block activity for this period.
                </p>
              )}
            </div>
            <AnalyticsTablePaginationOS page={currentBlocksPage} total={data.blocks.length} onPageChange={setBlocksPage} />
          </section>

          <section className="overflow-hidden rounded-xl border border-line bg-card-bg">
            <div className="flex items-center gap-2 border-b border-line-soft px-5 py-4">
              <MousePointerClick size={16} className="text-claude" />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-zinc-100">
                  Acquisition channels
                </h3>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
                  Source and medium behind each channel group.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-175 text-sm tabular-nums">
                <thead>
                  <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <th className="px-5 py-3">Channel</th>
                    <th className="px-5 py-3">Source / Medium</th>
                    <th className="px-5 py-3">Sessions</th>
                    <th className="px-5 py-3">Users</th>
                    <th className="px-5 py-3">Engaged Sessions</th>
                    <th className="px-5 py-3">Engagement Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.channels.slice(
                    (currentChannelsPage - 1) * ANALYTICS_TABLE_PAGE_SIZE,
                    currentChannelsPage * ANALYTICS_TABLE_PAGE_SIZE
                  ).map((channel, index) => (
                    <tr
                      key={`${channel.channel}-${channel.source_medium}-${(currentChannelsPage - 1) * ANALYTICS_TABLE_PAGE_SIZE + index}`}
                      className="border-b border-line-soft last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                    >
                      <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-zinc-100">
                        {channel.channel}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-zinc-400">
                        {channel.source_medium}
                      </td>
                      <td className="px-5 py-3.5">{channel.sessions}</td>
                      <td className="px-5 py-3.5">{channel.users}</td>
                      <td className="px-5 py-3.5">{channel.engaged_sessions}</td>
                      <td className="px-5 py-3.5 font-semibold">
                        {percentLabel(channel.engagement_rate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.channels.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-400">
                  No acquisition data for this period.
                </p>
              )}
            </div>
            <AnalyticsTablePaginationOS page={currentChannelsPage} total={data.channels.length} onPageChange={setChannelsPage} />
          </section>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400 dark:text-zinc-500">
            <span>
              Property {data.property_id} · {data.metadata.timezone}
            </span>
            <span>
              Updated{" "}
              {new Date(data.metadata.generated_at).toLocaleString("en-GB")}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
