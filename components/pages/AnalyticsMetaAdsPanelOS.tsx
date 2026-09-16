"use client";

import AppButton from "@/components/buttons/AppButton";
import CreativeRankChartOS from "@/components/charts/CreativeRankChartOS";
import DemographicsChartOS from "@/components/charts/DemographicsChartOS";
import DonutChartOS from "@/components/charts/DonutChartOS";
import MetaSpendTrendChartOS from "@/components/charts/MetaSpendTrendChartOS";
import ChangeIndicator from "@/components/labels/ChangeIndicator";
import Label from "@/components/labels/Label";
import {
  compactNumber,
  decimalLabel,
  fullNumber,
  percentLabel,
  shortDateLabel,
} from "@/lib/analytics-format";
import { getAccountCurrency, getShortAccountCurrency } from "@/lib/currency";
import { setSessionToken, trpc } from "@/trpc/client";
import type { AppRouter } from "@/trpc/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Banknote,
  Eye,
  Gauge,
  Image as ImageIcon,
  Layers,
  MousePointerClick,
  Percent,
  RefreshCw,
  Repeat,
  Target,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type MetaDashboard =
  inferRouterOutputs<AppRouter>["list"]["analytics"]["metaAdsDashboard"];
// The procedure returns a short "not connected" shape or the full dashboard.
type ConnectedDashboard = Extract<MetaDashboard, { configured: true }>;
type CreativeRow = ConnectedDashboard["creatives"][number];

type SortKey =
  | "impressions"
  | "reach"
  | "frequency"
  | "link_clicks"
  | "link_ctr"
  | "cost_per_link_click"
  | "cpm"
  | "spend"
  | "results"
  | "cost_per_result";

// Cost columns sort cheapest-first; volume and rate columns sort biggest-first.
const COST_COLUMNS: SortKey[] = ["cpm", "cost_per_link_click", "cost_per_result"];

export default function AnalyticsMetaAdsPanelOS({
  sessionToken,
  startDate,
  endDate,
}: {
  sessionToken: string;
  startDate: string;
  endDate: string;
}) {
  // Must stay above the query: the token has to be set before its fetch effect runs.
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const query = trpc.list.analytics.metaAdsDashboard.useQuery(
    { start_date: startDate, end_date: endDate },
    {
      enabled: !!sessionToken && !!startDate && !!endDate,
      staleTime: 5 * 60 * 1000,
    }
  );

  const [sortKey, setSortKey] = useState<SortKey>("results");
  const [sortDescending, setSortDescending] = useState(true);

  const data = query.data;
  const connected = data?.configured ? data : null;
  const currency = connected?.account.currency ?? "IDR";

  const money = (value: number | null) =>
    value === null ? "—" : getAccountCurrency(value, currency);

  const columns: {
    key: SortKey;
    label: string;
    render: (creative: CreativeRow) => string;
  }[] = [
    {
      key: "impressions",
      label: "Impr.",
      render: (creative) => compactNumber(creative.impressions),
    },
    {
      key: "reach",
      label: "Reach",
      render: (creative) => compactNumber(creative.reach),
    },
    {
      key: "frequency",
      label: "Freq.",
      render: (creative) => decimalLabel(creative.frequency),
    },
    {
      key: "link_clicks",
      label: "Link clicks",
      render: (creative) => fullNumber(creative.link_clicks),
    },
    {
      key: "link_ctr",
      label: "Link CTR",
      render: (creative) => percentLabel(creative.link_ctr, 2),
    },
    {
      key: "cost_per_link_click",
      label: "CPC",
      render: (creative) => money(creative.cost_per_link_click),
    },
    {
      key: "cpm",
      label: "CPM",
      render: (creative) => money(creative.cpm),
    },
    {
      key: "spend",
      label: "Spend",
      render: (creative) => money(creative.spend),
    },
    {
      key: "results",
      label: "Results",
      render: (creative) => fullNumber(creative.results),
    },
    {
      key: "cost_per_result",
      label: "Cost / result",
      render: (creative) => money(creative.cost_per_result),
    },
  ];

  function selectSort(key: SortKey) {
    if (key === sortKey) {
      setSortDescending((current) => !current);
      return;
    }
    setSortKey(key);
    setSortDescending(!COST_COLUMNS.includes(key));
  }

  // A creative with no conversions has no cost per result, so it sorts to the bottom either way.
  const sortedCreatives = useMemo(() => {
    if (!connected) return [];
    return [...connected.creatives].sort((a, b) => {
      const first = a[sortKey];
      const second = b[sortKey];
      if (first === null && second === null) return 0;
      if (first === null) return 1;
      if (second === null) return -1;
      return sortDescending ? second - first : first - second;
    });
  }, [connected, sortKey, sortDescending]);

  const placementSlices = useMemo(
    () =>
      (connected?.placements ?? [])
        .filter((placement) => placement.spend > 0)
        .map((placement) => ({
          key: placement.key,
          label: placement.label,
          value: placement.spend,
        })),
    [connected]
  );

  const summaryCards = connected
    ? [
        {
          label: "Spend",
          value: getShortAccountCurrency(
            connected.summary.current.spend,
            currency
          ),
          change: connected.summary.changes.spend,
          icon: Wallet,
          invert: false,
        },
        {
          label: "Results",
          value: fullNumber(connected.summary.current.results),
          change: connected.summary.changes.results,
          icon: Target,
          invert: false,
        },
        {
          label: "Cost / result",
          value: money(connected.summary.current.cost_per_result),
          change: connected.summary.changes.cost_per_result,
          icon: Banknote,
          invert: true,
        },
        {
          label: "CPM",
          value: money(connected.summary.current.cpm),
          change: connected.summary.changes.cpm,
          icon: Gauge,
          invert: true,
        },
        {
          label: "CPC (link)",
          value: money(connected.summary.current.cost_per_link_click),
          change: connected.summary.changes.cpc,
          icon: MousePointerClick,
          invert: true,
        },
        {
          label: "Link CTR",
          value: percentLabel(connected.summary.current.link_ctr, 2),
          change: connected.summary.changes.ctr,
          icon: Percent,
          invert: false,
        },
        {
          label: "Impressions",
          value: compactNumber(connected.summary.current.impressions),
          change: connected.summary.changes.impressions,
          icon: Eye,
          invert: false,
        },
        {
          label: "Reach",
          value: compactNumber(connected.summary.current.reach),
          change: connected.summary.changes.reach,
          icon: Users,
          invert: false,
        },
        {
          label: "Frequency",
          value: decimalLabel(connected.summary.current.frequency),
          change: null,
          icon: Repeat,
          invert: false,
        },
        {
          label: "Link clicks",
          value: compactNumber(connected.summary.current.link_clicks),
          change: connected.summary.changes.link_clicks,
          icon: Layers,
          invert: false,
        },
      ]
    : [];

  const creativeById = useMemo(
    () => new Map((connected?.creatives ?? []).map((item) => [item.id, item])),
    [connected]
  );

  const spotlights = connected
    ? [
        {
          key: "best_cost_per_result",
          title: "Cheapest result",
          creative: creativeById.get(
            connected.highlights.best_cost_per_result ?? ""
          ),
          value: (creative: CreativeRow) => money(creative.cost_per_result),
        },
        {
          key: "best_link_ctr",
          title: "Most clickable",
          creative: creativeById.get(connected.highlights.best_link_ctr ?? ""),
          value: (creative: CreativeRow) =>
            `${percentLabel(creative.link_ctr, 2)} link CTR`,
        },
        {
          key: "top_spend",
          title: "Biggest spender",
          creative: creativeById.get(connected.highlights.top_spend ?? ""),
          value: (creative: CreativeRow) =>
            getShortAccountCurrency(creative.spend, currency),
        },
      ].filter(
        (
          spotlight
        ): spotlight is typeof spotlight & { creative: CreativeRow } =>
          Boolean(spotlight.creative)
      )
    : [];

  const previousPeriodLabel = data
    ? `${shortDateLabel(data.period.previous_start_date)} – ${shortDateLabel(
        data.period.previous_end_date
      )}`
    : "";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 dark:text-zinc-100">
              Meta Ads
            </h3>
            <span
              className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                query.isError
                  ? "border-merah/40 bg-merah-t text-merah"
                  : connected
                    ? "border-hijau/40 bg-hijau-t text-hijau"
                    : "border-gray-300 bg-gray-100 text-gray-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {query.isError
                ? "Meta Ads unavailable"
                : connected
                  ? `${connected.account.name} connected`
                  : data
                    ? "Not connected"
                    : "Connecting Meta Ads"}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
            What the paid budget bought, and which creative bought it cheapest.
            Compared against {previousPeriodLabel || "the previous period"}.
          </p>
        </div>
        <AppButton
          type="button"
          variant="outline"
          size="icon"
          title="Refresh Meta Ads data"
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
          {Array.from({ length: 10 }).map((_, index) => (
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
            Meta Ads data could not be loaded
          </h3>
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {query.error.message}
          </p>
        </div>
      )}

      {data && !data.configured && (
        <div className="rounded-xl border border-kuning/50 bg-kuning-t p-5 text-sm text-gray-700">
          <p className="font-bold">The Meta ad account is not connected yet.</p>
          <p className="mt-1">
            Add <code>META_ADS_ACCOUNT_ID</code> (the account number, with or
            without the <code>act_</code> prefix) and{" "}
            <code>META_ADS_ACCESS_TOKEN</code> to the environment, then reload.
            The token needs the <code>ads_read</code> permission on that account
            — a system user token from Meta Business Settings is the one that
            does not expire.
          </p>
        </div>
      )}

      {connected && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-gray-300 bg-card-bg p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-claude/10 text-claude">
                    <card.icon size={16} />
                  </div>
                  <ChangeIndicator value={card.change} invert={card.invert} />
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

          {connected.summary.current.impressions === 0 && (
            <div className="rounded-xl border border-kuning/50 bg-kuning-t p-4 text-sm text-gray-700">
              <span className="font-bold">The account is connected,</span> but
              nothing was delivered in this period. Widen the reporting period,
              or check that the campaigns are still running.
            </div>
          )}

          {spotlights.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              {spotlights.map((spotlight) => (
                <div
                  key={spotlight.key}
                  className="flex items-center gap-3.5 rounded-xl border border-gray-300 bg-card-bg p-4"
                >
                  <CreativeThumbnail
                    url={spotlight.creative.thumbnail_url}
                    name={spotlight.creative.name}
                    size={56}
                  />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-claude">
                      <Trophy size={12} />
                      {spotlight.title}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
                      {spotlight.creative.name}
                    </p>
                    <p className="truncate text-xs text-gray-500 dark:text-zinc-400">
                      {spotlight.value(spotlight.creative)} ·{" "}
                      {fullNumber(spotlight.creative.results)} results
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
            <MetaSpendTrendChartOS data={connected.daily} currency={currency} />
            <DonutChartOS
              data={placementSlices}
              title="Spend by placement"
              description="Where the budget was actually delivered."
              centerLabel={currency}
            />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <CreativeRankChartOS
              data={connected.creatives}
              currency={currency}
            />
            <DemographicsChartOS
              data={connected.demographics}
              currency={currency}
            />
          </div>

          <section className="rounded-xl border border-gray-300 bg-card-bg p-5">
            <h3 className="font-bold text-gray-900 dark:text-zinc-100">
              What counts as a result
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
              The headline Results number is these three added together, on a{" "}
              {connected.metadata.attribution} attribution window.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {connected.result_mix.map((entry) => (
                <li
                  key={entry.key}
                  className="rounded-lg border border-gray-200 px-4 py-3 dark:border-zinc-800"
                >
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    {entry.label}
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900 dark:text-zinc-100">
                    {fullNumber(entry.results)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {entry.cost_per_result === null
                      ? "No cost reported"
                      : `${money(entry.cost_per_result)} each`}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="overflow-hidden rounded-xl border border-gray-300 bg-card-bg">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-5 py-4 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-claude" />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-zinc-100">
                    Creative performance
                  </h3>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
                    Every ad that served, best first. Tap a column to re-rank.
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                Badges need at least{" "}
                {fullNumber(connected.metadata.min_ranking_impressions)}{" "}
                impressions
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-300 text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-800">
                    <th className="px-5 py-3">Creative</th>
                    {columns.map((column) => (
                      <th key={column.key} className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => selectSort(column.key)}
                          className={`inline-flex items-center gap-1 uppercase transition-colors hover:cursor-pointer hover:text-gray-700 dark:hover:text-zinc-200 ${
                            sortKey === column.key
                              ? "text-claude"
                              : "text-gray-400"
                          }`}
                        >
                          {column.label}
                          {sortKey === column.key &&
                            (sortDescending ? (
                              <ArrowDownWideNarrow size={12} />
                            ) : (
                              <ArrowUpWideNarrow size={12} />
                            ))}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedCreatives.map((creative) => (
                    <tr
                      key={creative.id}
                      className="border-b border-gray-200 last:border-0 dark:border-zinc-800"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-start gap-3">
                          <CreativeThumbnail
                            url={creative.thumbnail_url}
                            name={creative.name}
                            size={44}
                          />
                          <div className="min-w-0 max-w-70">
                            <p className="truncate font-semibold text-gray-900 dark:text-zinc-100">
                              {creative.name}
                            </p>
                            <p className="truncate text-xs text-gray-400">
                              {creative.campaign} · {creative.adset}
                            </p>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {connected.highlights.best_cost_per_result ===
                                creative.id && (
                                <Label variant="hijau">Cheapest result</Label>
                              )}
                              {connected.highlights.best_link_ctr ===
                                creative.id && (
                                <Label variant="biru">Best CTR</Label>
                              )}
                              {creative.quality_ranking && (
                                <Label variant="gray">
                                  Quality: {creative.quality_ranking}
                                </Label>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={`px-5 py-3.5 whitespace-nowrap ${
                            sortKey === column.key
                              ? "font-semibold text-gray-900 dark:text-zinc-100"
                              : ""
                          }`}
                        >
                          {column.render(creative)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {sortedCreatives.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-400">
                  No creative served in this period.
                </p>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-gray-300 bg-card-bg">
            <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4 dark:border-zinc-800">
              <Layers size={16} className="text-claude" />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-zinc-100">
                  Campaigns
                </h3>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
                  Where the budget went, biggest spender first.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-230 text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-800">
                    <th className="px-5 py-3">Campaign</th>
                    <th className="px-5 py-3">Spend</th>
                    <th className="px-5 py-3">Impressions</th>
                    <th className="px-5 py-3">Link CTR</th>
                    <th className="px-5 py-3">CPM</th>
                    <th className="px-5 py-3">CPC</th>
                    <th className="px-5 py-3">Results</th>
                    <th className="px-5 py-3">Cost / result</th>
                  </tr>
                </thead>
                <tbody>
                  {connected.campaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="border-b border-gray-200 last:border-0 dark:border-zinc-800"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-900 dark:text-zinc-100">
                          {campaign.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {campaign.objective}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {money(campaign.spend)}
                      </td>
                      <td className="px-5 py-3.5">
                        {compactNumber(campaign.impressions)}
                      </td>
                      <td className="px-5 py-3.5">
                        {percentLabel(campaign.link_ctr, 2)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {money(campaign.cpm)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {money(campaign.cost_per_link_click)}
                      </td>
                      <td className="px-5 py-3.5">
                        {fullNumber(campaign.results)}
                      </td>
                      <td className="px-5 py-3.5 font-semibold whitespace-nowrap">
                        {money(campaign.cost_per_result)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {connected.campaigns.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-400">
                  No campaign delivered in this period.
                </p>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-gray-300 bg-card-bg">
            <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4 dark:border-zinc-800">
              <Gauge size={16} className="text-claude" />
              <div>
                <h3 className="font-bold text-gray-900 dark:text-zinc-100">
                  Placements
                </h3>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
                  Feed, Reels, Stories and the rest, priced side by side.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-190 text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-800">
                    <th className="px-5 py-3">Placement</th>
                    <th className="px-5 py-3">Spend</th>
                    <th className="px-5 py-3">Impressions</th>
                    <th className="px-5 py-3">Link CTR</th>
                    <th className="px-5 py-3">CPM</th>
                    <th className="px-5 py-3">Results</th>
                    <th className="px-5 py-3">Cost / result</th>
                  </tr>
                </thead>
                <tbody>
                  {connected.placements.map((placement) => (
                    <tr
                      key={placement.key}
                      className="border-b border-gray-200 last:border-0 dark:border-zinc-800"
                    >
                      <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-zinc-100">
                        {placement.label}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {money(placement.spend)}
                      </td>
                      <td className="px-5 py-3.5">
                        {compactNumber(placement.impressions)}
                      </td>
                      <td className="px-5 py-3.5">
                        {percentLabel(placement.link_ctr, 2)}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {money(placement.cpm)}
                      </td>
                      <td className="px-5 py-3.5">
                        {fullNumber(placement.results)}
                      </td>
                      <td className="px-5 py-3.5 font-semibold whitespace-nowrap">
                        {money(placement.cost_per_result)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {connected.placements.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-400">
                  No placement data for this period.
                </p>
              )}
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400 dark:text-zinc-500">
            <span>
              Account act_{connected.account.id} · {connected.account.timezone}{" "}
              · {connected.metadata.attribution}
            </span>
            <span>
              Updated{" "}
              {new Date(connected.metadata.generated_at).toLocaleString("en-GB")}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// Meta thumbnail URLs are signed and expiring, so a missing one falls back to a placeholder.
function CreativeThumbnail({
  url,
  name,
  size,
}: {
  url: string | null;
  name: string;
  size: number;
}) {
  if (!url) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-300 dark:border-zinc-800 dark:bg-zinc-900"
        style={{ width: size, height: size }}
      >
        <ImageIcon size={size / 3} />
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={name}
      width={size}
      height={size}
      unoptimized
      className="shrink-0 rounded-lg border border-gray-200 object-cover dark:border-zinc-800"
      style={{ width: size, height: size }}
    />
  );
}
