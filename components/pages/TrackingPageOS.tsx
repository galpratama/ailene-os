"use client";

import AppButton from "@/components/buttons/AppButton";
import AnalyticsTrendChartOS from "@/components/charts/AnalyticsTrendChartOS";
import AppInput from "@/components/fields/AppInput";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import { getRupiahCurrency } from "@/lib/currency";
import { setSessionToken, trpc } from "@/trpc/client";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Eye,
  MousePointerClick,
  RefreshCw,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const websiteOptions: AppSelectOption[] = [
  { value: null, label: "All websites" },
  { value: "jagohermes.com", label: "Jago Hermes" },
  { value: "kelasclaude.com", label: "Kelas Claude" },
  { value: "belajarvibecoding.com", label: "Belajar Vibe Coding" },
  { value: "belajarkoding.com", label: "Belajar Koding" },
];

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

export default function TrackingPageOS({
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
  const [website, setWebsite] = useState<string | null>(null);

  const query = trpc.list.analytics.ga4Dashboard.useQuery(
    {
      start_date: startDate,
      end_date: endDate,
      website: website
        ? (website as
            | "jagohermes.com"
            | "kelasclaude.com"
            | "belajarvibecoding.com"
            | "belajarkoding.com")
        : undefined,
    },
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
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
              Tracking B2C
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
            Understand acquisition and purchase intent across Ailene product
            websites.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="https://docs.google.com/spreadsheets/d/1Ew24liu5-scsHoTVkFE4o96S6IHF3ecWkhTsoHfwo_E/edit?gid=1341796980#gid=1341796980"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-gray-500 hover:text-claude"
          >
            Event taxonomy ↗
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

      <section className="grid gap-3 rounded-xl border border-gray-300 bg-card-bg p-4 md:grid-cols-2 xl:grid-cols-[220px_200px_170px_170px]">
        <AppSelect
          selectId="tracking-website"
          label="Website"
          placeholder="All websites"
          value={website}
          options={websiteOptions}
          onChange={(value) => setWebsite(value as string | null)}
        />
        <AppSelect
          selectId="tracking-period"
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
              inputId="tracking-start-date"
              label="Start date"
              type="date"
              max={endDate}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
            <AppInput
              inputId="tracking-end-date"
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

            <section className="rounded-xl border border-gray-300 bg-card-bg p-5">
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

          <section className="overflow-hidden rounded-xl border border-gray-300 bg-card-bg">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-zinc-800">
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
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-800">
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
                      className="border-b border-gray-200 last:border-0 dark:border-zinc-800"
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
                        {site.session_to_purchase_rate === null
                          ? "—"
                          : `${site.session_to_purchase_rate.toFixed(1)}%`}
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

          <section className="overflow-hidden rounded-xl border border-gray-300 bg-card-bg">
            <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-4 dark:border-zinc-800">
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
                  <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-800">
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
