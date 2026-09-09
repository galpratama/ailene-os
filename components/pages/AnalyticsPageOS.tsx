"use client";

import AppButton from "@/components/buttons/AppButton";
import AnalyticsTrendChartOS from "@/components/charts/AnalyticsTrendChartOS";
import CTAMixChartOS from "@/components/charts/CTAMixChartOS";
import DonutChartOS from "@/components/charts/DonutChartOS";
import FunnelChartOS from "@/components/charts/FunnelChartOS";
import MetricChangeChartOS from "@/components/charts/MetricChangeChartOS";
import ScrollDepthChartOS from "@/components/charts/ScrollDepthChartOS";
import AppInput from "@/components/fields/AppInput";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import { SITE_URL } from "@/lib/site";
import { setSessionToken, trpc } from "@/trpc/client";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Eye,
  Handshake,
  LayoutList,
  MousePointerClick,
  RefreshCw,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const periodOptions: AppSelectOption[] = [
  { value: "7", label: "Last 7 days" },
  { value: "28", label: "Last 28 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 12 months" },
  { value: "custom", label: "Custom range" },
];

function jakartaToday() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function dateDaysBefore(date: string, days: number) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() - days);
  return value.toISOString().slice(0, 10);
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function percent(value: number | null) {
  return value === null ? "—" : `${value.toFixed(1)}%`;
}

function shortDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function ChangeIndicator({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <span className="text-xs font-semibold text-claude">New vs previous</span>
    );
  }
  const isPositive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${
        isPositive ? "text-hijau" : "text-merah"
      }`}
    >
      {isPositive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export default function AnalyticsPageOS({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const today = useMemo(() => jakartaToday(), []);
  const [period, setPeriod] = useState("28");
  const [startDate, setStartDate] = useState(() => dateDaysBefore(today, 27));
  const [endDate, setEndDate] = useState(today);

  const query = trpc.list.analytics.bizDashboard.useQuery(
    { start_date: startDate, end_date: endDate },
    {
      enabled: !!sessionToken && !!startDate && !!endDate,
      staleTime: 5 * 60 * 1000,
    }
  );

  function selectPeriod(value: string) {
    setPeriod(value);
    if (value === "custom") return;
    const days = Number(value);
    setEndDate(today);
    setStartDate(dateDaysBefore(today, days - 1));
  }

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
  const hasTrackedFunnel = data?.funnel.some((entry) => entry.users > 0);
  const previousPeriodLabel = data
    ? `${shortDate(data.period.previous_start_date)} – ${shortDate(
        data.period.previous_end_date
      )}`
    : "";

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
              Analytics B2B
            </h2>
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                query.isError
                  ? "border-merah/40 bg-merah-t text-merah"
                  : data
                    ? "border-hijau/40 bg-hijau-t text-hijau"
                    : "border-gray-300 bg-gray-100 text-gray-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {query.isError
                ? "GA4 unavailable"
                : data
                  ? "GA4 connected"
                  : "Connecting GA4"}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
            How the marketing site turns visitors into sales conversations,
            measured through the GTM feature schema.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={SITE_URL}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-gray-500 hover:text-claude"
          >
            Open landing page ↗
          </Link>
          <AppButton
            type="button"
            variant="outline"
            size="icon"
            title="Refresh GA4 data"
            onClick={() => query.refetch()}
            disabled={query.isFetching}
          >
            <RefreshCw
              size={14}
              className={query.isFetching ? "animate-spin" : ""}
            />
          </AppButton>
        </div>
      </div>

      <section className="grid gap-3 rounded-xl border border-gray-300 bg-card-bg p-4 md:grid-cols-2 xl:grid-cols-[200px_170px_170px]">
        <AppSelect
          selectId="analytics-period"
          label="Reporting period"
          icon={<CalendarDays size={14} />}
          placeholder="Select period"
          value={period}
          options={periodOptions}
          onChange={(value) => selectPeriod(String(value))}
        />
        {period === "custom" && (
          <>
            <AppInput
              inputId="analytics-start-date"
              label="Start date"
              type="date"
              max={endDate}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
            <AppInput
              inputId="analytics-end-date"
              label="End date"
              type="date"
              min={startDate}
              max={today}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </>
        )}
      </section>

      {query.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-xl border border-gray-300 bg-card-bg"
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
            {query.error.message}
          </p>
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-gray-300 bg-card-bg p-5"
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
              Register <code>feature_id</code>, <code>feature_name</code> and{" "}
              <code>feature_position</code> as event-scoped custom dimensions in
              the GA4 property, then reload — the funnel, scroll depth, CTA mix
              and block table stay empty until then.
            </div>
          )}

          {featureSchemaReady && !hasTrackedFunnel && (
            <div className="rounded-xl border border-kuning/50 bg-kuning-t p-4 text-sm text-gray-700">
              <span className="font-bold">GA4 is connected,</span> but no
              tracked view or click events landed in this period yet. Confirm the
              GTM triggers are published on the production container.
            </div>
          )}

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <AnalyticsTrendChartOS
              data={data.daily}
              metrics={trendMetrics}
              description="Daily movement on the marketing site."
            />
            <FunnelChartOS
              stages={data.funnel}
              description="Distinct users per stage on the landing page, anchored to one section or event each."
            />
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

          <section className="overflow-hidden rounded-xl border border-gray-300 bg-card-bg">
            <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4 dark:border-zinc-800">
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
              <table className="w-full min-w-190 text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-800">
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
                  {data.blocks.map((block) => (
                    <tr
                      key={block.id}
                      className="border-b border-gray-200 last:border-0 dark:border-zinc-800"
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
                        {percent(block.click_through_rate)}
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
          </section>

          <section className="overflow-hidden rounded-xl border border-gray-300 bg-card-bg">
            <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4 dark:border-zinc-800">
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
              <table className="w-full min-w-175 text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-800">
                    <th className="px-5 py-3">Channel</th>
                    <th className="px-5 py-3">Source / Medium</th>
                    <th className="px-5 py-3">Sessions</th>
                    <th className="px-5 py-3">Users</th>
                    <th className="px-5 py-3">Engaged Sessions</th>
                    <th className="px-5 py-3">Engagement Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.channels.map((channel, index) => (
                    <tr
                      key={`${channel.channel}-${channel.source_medium}-${index}`}
                      className="border-b border-gray-200 last:border-0 dark:border-zinc-800"
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
                        {percent(channel.engagement_rate)}
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
