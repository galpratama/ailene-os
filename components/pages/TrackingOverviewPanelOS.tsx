"use client";

import AppButton from "@/components/buttons/AppButton";
import AnalyticsTrendChartOS from "@/components/charts/AnalyticsTrendChartOS";
import AnalyticsStatCardOS from "@/components/items/AnalyticsStatCardOS";
import GA4StatusLabel from "@/components/labels/GA4StatusLabel";
import type { TrackingPeriodPayload } from "@/apis/analytics";
import { useTrackingDashboard } from "@/hooks/useAnalyticsDashboard";
import { compactNumber, percentLabel } from "@/lib/analytics-format";
import { getRupiahCurrency } from "@/lib/currency";
import {
  Activity,
  Eye,
  MousePointerClick,
  RefreshCw,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";

export default function TrackingOverviewPanelOS({
  payload,
  enabled,
}: {
  payload: TrackingPeriodPayload;
  enabled: boolean;
}) {
  const query = useTrackingDashboard(payload, enabled);

  const data = query.data;
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
          label: "Purchases",
          value: compactNumber(data.summary.current.purchases),
          change: data.summary.changes.purchases,
          icon: ShoppingBag,
        },
        {
          label: "Revenue",
          value: getRupiahCurrency(data.summary.current.revenue),
          change: data.summary.changes.revenue,
          icon: Wallet,
        },
      ]
    : [];
  const maxFunnelCount = Math.max(
    ...(data?.funnel.map((entry) => entry.count) ?? [1]),
    1
  );
  const hasTrackedFunnel = data?.funnel.some((entry) => entry.count > 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 dark:text-zinc-100">
              Product websites
            </h3>
            <GA4StatusLabel
              status={
                query.isError ? "unavailable" : data ? "connected" : "connecting"
              }
            />
          </div>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
            Understand acquisition and purchase intent across Ailene product
            websites.
          </p>
        </div>
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => (
              <AnalyticsStatCardOS key={card.label} {...card} />
            ))}
          </div>

          {!hasTrackedFunnel && (
            <div className="rounded-xl border border-kuning/50 bg-kuning-t p-4 text-sm text-gray-700">
              <span className="font-bold">GA4 is connected,</span> but the five
              tracked funnel events have not appeared in this period yet.
              Confirm the GTM mapping and production triggers using the event
              taxonomy.
            </div>
          )}

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.7fr)]">
            <AnalyticsTrendChartOS data={data.daily} />

            <section className="rounded-xl border border-line bg-card-bg p-5">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-zinc-100">
                  Conversion funnel
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                  Event volume and drop-off between key steps.
                </p>
              </div>
              <div className="mt-5 flex flex-col gap-4">
                {data.funnel.map((entry, index) => (
                  <div key={entry.event}>
                    <div className="mb-1.5 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                          {index + 1}. {entry.label}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {entry.event}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">
                          {compactNumber(entry.count)}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {entry.from_previous_rate === null
                            ? "—"
                            : `${entry.from_previous_rate.toFixed(1)}% from previous`}
                        </p>
                      </div>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-claude"
                        style={{
                          width: `${Math.max(
                            entry.count > 0 ? 3 : 0,
                            (entry.count / maxFunnelCount) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="overflow-hidden rounded-xl border border-line bg-card-bg">
            <div className="border-b border-line-soft px-5 py-4">
              <h3 className="font-bold text-gray-900 dark:text-zinc-100">
                Website performance
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                Compare traffic quality and commercial outcomes by product.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-190 text-sm">
                <thead>
                  <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <th className="px-5 py-3">Website</th>
                    <th className="px-5 py-3">Users</th>
                    <th className="px-5 py-3">Sessions</th>
                    <th className="px-5 py-3">Page Views</th>
                    <th className="px-5 py-3">Purchases</th>
                    <th className="px-5 py-3">Session → Purchase</th>
                    <th className="px-5 py-3">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.websites.map((site) => (
                    <tr
                      key={site.id}
                      className="border-b border-line-soft last:border-0"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-900 dark:text-zinc-100">
                          {site.label}
                        </p>
                        <p className="text-xs text-gray-400">{site.id}</p>
                      </td>
                      <td className="px-5 py-3.5">{site.users}</td>
                      <td className="px-5 py-3.5">{site.sessions}</td>
                      <td className="px-5 py-3.5">{site.page_views}</td>
                      <td className="px-5 py-3.5 font-semibold">
                        {site.purchases}
                      </td>
                      <td className="px-5 py-3.5">
                        {percentLabel(site.session_to_purchase_rate)}
                      </td>
                      <td className="px-5 py-3.5 font-semibold">
                        {getRupiahCurrency(site.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-line bg-card-bg">
            <div className="flex items-center gap-2 border-b border-line-soft px-5 py-4">
              <MousePointerClick size={16} className="text-claude" />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-zinc-100">
                  Acquisition channels
                </h3>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
                  Where sessions originate and what they contribute.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-175 text-sm">
                <thead>
                  <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <th className="px-5 py-3">Channel</th>
                    <th className="px-5 py-3">Source / Medium</th>
                    <th className="px-5 py-3">Sessions</th>
                    <th className="px-5 py-3">Users</th>
                    <th className="px-5 py-3">Purchases</th>
                    <th className="px-5 py-3">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.channels.map((channel, index) => (
                    <tr
                      key={`${channel.channel}-${channel.source_medium}-${index}`}
                      className="border-b border-line-soft last:border-0"
                    >
                      <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-zinc-100">
                        {channel.channel}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 dark:text-zinc-400">
                        {channel.source_medium}
                      </td>
                      <td className="px-5 py-3.5">{channel.sessions}</td>
                      <td className="px-5 py-3.5">{channel.users}</td>
                      <td className="px-5 py-3.5">{channel.purchases}</td>
                      <td className="px-5 py-3.5 font-semibold">
                        {getRupiahCurrency(channel.revenue)}
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
              Property {data.property_id} · {data.metadata.timezone} ·{" "}
              {data.metadata.currency}
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
