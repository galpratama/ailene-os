"use client";

import AppButton from "@/components/buttons/AppButton";
import AnalyticsTrendChartOS from "@/components/charts/AnalyticsTrendChartOS";
import AnalyticsStatCardOS from "@/components/items/AnalyticsStatCardOS";
import GA4StatusLabel from "@/components/labels/GA4StatusLabel";
import ProgressBar from "@/components/labels/ProgressBar";
import type { TrackingPeriodPayload } from "@/apis/analytics";
import { useAileneReferrals } from "@/hooks/useAnalyticsDashboard";
import { compactNumber, fullNumber, percentLabel } from "@/lib/analytics-format";
import { getRupiahCurrency } from "@/lib/currency";
import {
  Activity,
  Eye,
  Info,
  Link2,
  ShoppingBag,
  SignpostBig,
  Users,
  Wallet,
} from "lucide-react";
import { useState, type ReactNode } from "react";

const PREVIEW_ROWS = 10;

const NOT_SET = "(not set)";

function conversionRate(purchases: number, sessions: number) {
  return sessions > 0 ? (purchases / sessions) * 100 : null;
}

// GA4's "(not set)" is a real bucket, so it stays visible but reads as absent rather than as a value.
function Dimension({ value }: { value: string }) {
  return value === NOT_SET ? (
    <span className="text-gray-400 italic dark:text-zinc-500">not set</span>
  ) : (
    <>{value}</>
  );
}

function TableSection({
  icon,
  title,
  description,
  total,
  expanded,
  onToggle,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  total: number;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-card-bg">
      <div className="flex items-center gap-2 border-b border-line-soft px-5 py-4">
        {icon}
        <div>
          <h3 className="font-bold text-gray-900 dark:text-zinc-100">{title}</h3>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
            {description}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">{children}</div>
      {total > PREVIEW_ROWS && (
        <div className="border-t border-line-soft px-5 py-2.5">
          <AppButton type="button" variant="ghost" size="sm" onClick={onToggle}>
            {expanded ? `Show top ${PREVIEW_ROWS}` : `Show all ${total}`}
          </AppButton>
        </div>
      )}
    </section>
  );
}

export default function TrackingAileneReferralsPanelOS({
  payload,
  enabled,
}: {
  payload: TrackingPeriodPayload;
  enabled: boolean;
}) {
  const { referrals: query, totalSessions } = useAileneReferrals(payload, enabled);
  const [allLandingPages, setAllLandingPages] = useState(false);
  const [allSources, setAllSources] = useState(false);

  const data = query.data;
  const current = data?.summary.current;
  const siteLabels = new Map(data?.websites.map((site) => [site.id, site.label]));
  const landingPages = allLandingPages
    ? data?.landing_pages
    : data?.landing_pages.slice(0, PREVIEW_ROWS);
  const sources = allSources ? data?.sources : data?.sources.slice(0, PREVIEW_ROWS);

  const cards =
    data && current
      ? [
          {
            label: "Sessions",
            value: compactNumber(current.sessions),
            change: data.summary.changes.sessions,
            icon: Activity,
            hint:
              totalSessions && totalSessions > 0
                ? `${percentLabel((current.sessions / totalSessions) * 100)} of all product-site sessions`
                : undefined,
          },
          {
            label: "Active Users",
            value: compactNumber(current.users),
            change: data.summary.changes.users,
            icon: Users,
          },
          {
            label: "Page Views",
            value: compactNumber(current.page_views),
            change: data.summary.changes.page_views,
            icon: Eye,
            hint:
              current.sessions > 0
                ? `${(current.page_views / current.sessions).toFixed(1)} pages per session`
                : undefined,
          },
          {
            label: "Purchases",
            value: compactNumber(current.purchases),
            change: data.summary.changes.purchases,
            icon: ShoppingBag,
            hint: `${percentLabel(conversionRate(current.purchases, current.sessions))} session → purchase`,
          },
          {
            label: "Revenue",
            value: getRupiahCurrency(current.revenue),
            change: data.summary.changes.revenue,
            icon: Wallet,
            hint:
              current.sessions > 0
                ? `${getRupiahCurrency(current.revenue / current.sessions)} per session`
                : undefined,
          },
        ]
      : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 dark:text-zinc-100">
              Referred by ailene.id
            </h3>
            <GA4StatusLabel
              status={
                query.isError ? "unavailable" : data ? "connected" : "connecting"
              }
            />
          </div>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
            Product-site traffic and sales from sessions that started on
            ailene.id.
          </p>
        </div>
      </div>

      <div className="flex gap-2.5 rounded-xl border border-line bg-card-bg p-4 text-sm text-gray-600 dark:text-zinc-400">
        <Info size={16} className="mt-0.5 shrink-0 text-claude" />
        <p>
          A session counts when its GA4 source is <code>ailene.id</code>, from
          the referrer or a <code>utm_source</code>. Visits that lose the
          referrer (in-app browsers, privacy extensions) and carry no UTM land
          in <code>(direct)</code> and are not counted here, so keep UTM tags on
          every ailene.id link.
        </p>
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
            ailene.id referral data could not be loaded
          </h3>
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {query.error?.message}
          </p>
        </div>
      )}

      {data && current && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => (
              <AnalyticsStatCardOS key={card.label} {...card} />
            ))}
          </div>

          {current.sessions === 0 && (
            <div className="rounded-xl border border-kuning/50 bg-kuning-t p-4 text-sm text-gray-700">
              <span className="font-bold">No sessions from ailene.id in this period.</span>{" "}
              Check that the links on ailene.id point to the product sites, and
              tag them with <code>utm_source=ailene.id</code> so in-app clicks
              are not lost to (direct).
            </div>
          )}

          <div
            className={`grid gap-5 ${
              data.websites.length > 1
                ? "xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.7fr)]"
                : ""
            }`}
          >
            <AnalyticsTrendChartOS
              data={data.daily}
              metrics={[
                { key: "sessions", label: "Sessions" },
                { key: "users", label: "Active Users" },
                { key: "revenue", label: "Revenue", format: getRupiahCurrency },
              ]}
              title="Referral trend"
              description="Daily sessions, users, and revenue from ailene.id."
            />

            {data.websites.length > 1 && (
              <section className="rounded-xl border border-line bg-card-bg p-5">
                <h3 className="font-bold text-gray-900 dark:text-zinc-100">
                  Where ailene.id sends traffic
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
                  Share of referred sessions and what each site converts.
                </p>
                <div className="mt-5 flex flex-col gap-4">
                  {[...data.websites]
                    .sort((a, b) => b.sessions - a.sessions)
                    .map((site) => (
                      <div key={site.id}>
                        <div className="mb-1.5 flex items-end justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-800 dark:text-zinc-200">
                              {site.label}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {fullNumber(site.purchases)} purchases ·{" "}
                              {percentLabel(site.session_to_purchase_rate)} conv. ·{" "}
                              {getRupiahCurrency(site.revenue)}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-bold text-gray-900 dark:text-zinc-100">
                              {fullNumber(site.sessions)}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {current.sessions > 0
                                ? percentLabel((site.sessions / current.sessions) * 100)
                                : "—"}
                            </p>
                          </div>
                        </div>
                        <ProgressBar value={site.sessions} total={current.sessions} />
                      </div>
                    ))}
                </div>
              </section>
            )}
          </div>

          <TableSection
            icon={<SignpostBig size={16} className="text-claude" />}
            title="Landing pages"
            description="The first page of each ailene.id session, most sessions first."
            total={data.landing_pages.length}
            expanded={allLandingPages}
            onToggle={() => setAllLandingPages((value) => !value)}
          >
            <table className="w-full min-w-190 text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <th className="px-5 py-3">Landing page</th>
                  <th className="px-5 py-3 text-right">Sessions</th>
                  <th className="px-5 py-3 text-right">Users</th>
                  <th className="px-5 py-3 text-right">Purchases</th>
                  <th className="px-5 py-3 text-right">Session → Purchase</th>
                  <th className="px-5 py-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {landingPages?.map((page) => (
                  <tr
                    key={`${page.website}${page.landing_page}`}
                    className="border-b border-line-soft last:border-0"
                  >
                    <td className="max-w-90 px-5 py-3.5">
                      <p className="truncate font-semibold text-gray-900 dark:text-zinc-100">
                        <Dimension value={page.landing_page} />
                      </p>
                      <p className="text-xs text-gray-400">
                        {siteLabels.get(page.website) ?? page.website}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      {fullNumber(page.sessions)}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      {fullNumber(page.users)}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      {fullNumber(page.purchases)}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      {percentLabel(conversionRate(page.purchases, page.sessions))}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold tabular-nums">
                      {getRupiahCurrency(page.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.landing_pages.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">
                No ailene.id landing pages for this period.
              </p>
            )}
          </TableSection>

          <TableSection
            icon={<Link2 size={16} className="text-claude" />}
            title="Links and campaigns"
            description="Source, medium, and the UTM campaign and content behind each referred session."
            total={data.sources.length}
            expanded={allSources}
            onToggle={() => setAllSources((value) => !value)}
          >
            <table className="w-full min-w-220 text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <th className="px-5 py-3">Source / Medium</th>
                  <th className="px-5 py-3">Campaign</th>
                  <th className="px-5 py-3">Content</th>
                  <th className="px-5 py-3 text-right">Sessions</th>
                  <th className="px-5 py-3 text-right">Users</th>
                  <th className="px-5 py-3 text-right">Purchases</th>
                  <th className="px-5 py-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {sources?.map((source) => (
                  <tr
                    key={`${source.source}|${source.medium}|${source.campaign}|${source.content}`}
                    className="border-b border-line-soft last:border-0"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-900 dark:text-zinc-100">
                        <Dimension value={source.source} />
                      </p>
                      <p className="text-xs text-gray-400">
                        <Dimension value={source.medium} />
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Dimension value={source.campaign} />
                    </td>
                    <td className="px-5 py-3.5">
                      <Dimension value={source.content} />
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      {fullNumber(source.sessions)}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      {fullNumber(source.users)}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      {fullNumber(source.purchases)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold tabular-nums">
                      {getRupiahCurrency(source.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.sources.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">
                No ailene.id sources for this period.
              </p>
            )}
          </TableSection>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400 dark:text-zinc-500">
            <span>
              Property {data.property_id} · {data.metadata.timezone} ·{" "}
              {data.metadata.currency}
            </span>
            <span>
              Updated {new Date(data.metadata.generated_at).toLocaleString("en-GB")}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
