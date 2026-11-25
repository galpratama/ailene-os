"use client";

import type { HomeExperiment, HomeExperimentTest, HomeExperimentVariant, HomeVariantKey } from "@/apis/analytics";
import WarehouseStackedTrendOS from "@/components/charts/WarehouseStackedTrendOS";
import AppSelect, { type AppSelectOption } from "@/components/fields/AppSelect";
import InfoTooltipOS from "@/components/elements/InfoTooltipOS";
import RevenueCardOS from "@/components/elements/RevenueCardOS";
import RevenueErrorOS from "@/components/elements/RevenueErrorOS";
import HomeVariantLabel, { homeVariantColors } from "@/components/labels/HomeVariantLabel";
import type { RevenueTabProps } from "@/components/pages/RevenueEngineOS";
import { useRevenue } from "@/hooks/useRevenue";
import { getHomeExperiment } from "@/lib/actions";
import { count, percent, shortDate } from "@/lib/revenue";
import { ArrowDown, ArrowUp, CircleCheck, Hourglass, Scale } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

type Direction = "higher" | "neutral";
type MetricRow = {
  key: string;
  label: string;
  info: string;
  value: (variant: HomeExperimentVariant) => number | null;
  format: (value: number | null) => string;
  lift: number | null;
  direction: Direction;
};
type TrendMetric = "sessions" | "conversion" | "engagement";

const trendMetrics: { key: TrendMetric; label: string }[] = [
  { key: "sessions", label: "Sessions" },
  { key: "conversion", label: "Conversion rate" },
  { key: "engagement", label: "Engagement rate" },
];

function duration(seconds: number | null) {
  if (seconds === null) return "—";
  const rounded = Math.round(seconds);
  const minutes = Math.floor(rounded / 60);
  return minutes ? `${minutes}m ${rounded % 60}s` : `${rounded}s`;
}

function decimal(value: number | null) {
  return value === null ? "—" : value.toFixed(2);
}

function rate(value: number | null) {
  return percent(value, 1);
}

function liftText(lift: number | null) {
  if (lift === null) return "—";
  return `${lift > 0 ? "+" : ""}${lift.toFixed(Math.abs(lift) < 10 ? 1 : 0)}%`;
}

function share(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

function emptyVariant(variant: HomeVariantKey): HomeExperimentVariant {
  return {
    variant, sessions: 0, users: 0, new_users: 0, page_views: 0, engaged_sessions: 0, engagement_seconds: 0, lead_events: 0, lead_sessions: 0,
    pages_per_session: null, engagement_rate: null, avg_engagement_seconds: null, conversion_rate: null,
  };
}

const segmentedButton = (active: boolean) =>
  `rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
    active ? "bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100" : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"
  }`;

// B vs A change; color only marks direction on metrics where higher is better, and an arrow always carries it too.
function LiftChip({ lift, direction }: { lift: number | null; direction: Direction }) {
  if (lift === null) return <span className="text-xs text-gray-400 dark:text-zinc-500">—</span>;
  const up = lift >= 0;
  const tone = direction === "neutral" || lift === 0 ? "text-gray-600 dark:text-zinc-300" : up ? "text-hijau" : "text-merah";
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums ${tone}`}>
      {lift !== 0 && (up ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" />)}
      {liftText(lift)}
    </span>
  );
}

function ComparisonTile({ row, variants, note }: { row: MetricRow; variants: HomeExperimentVariant[]; note?: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-line bg-card-bg px-4 py-3.5">
      <div className="flex items-start gap-1">
        <p className="min-w-0 flex-1 text-xs font-medium text-gray-600 dark:text-zinc-300">{row.label}</p>
        <InfoTooltipOS label={row.label} explanation={row.info} />
      </div>
      <dl className="mt-2 flex flex-col gap-1.5">
        {variants.map((variant) => (
          <div key={variant.variant} className="flex items-center justify-between gap-3">
            <dt>
              <HomeVariantLabel variant={variant.variant} />
            </dt>
            <dd className="font-heading text-xl font-semibold tabular-nums text-gray-900 dark:text-zinc-100">{row.format(row.value(variant))}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-line-soft pt-2 text-xs text-gray-500 dark:text-zinc-400">
        B vs A <LiftChip lift={row.lift} direction={row.direction} />
        {note}
      </p>
    </div>
  );
}

function verdictCopy(test: HomeExperimentTest | undefined, data: HomeExperiment) {
  const [a, b] = data.variants;
  if (!test || !test.sample_reached) {
    return {
      icon: Hourglass,
      tone: "neutral" as const,
      title: "Not enough data to call a winner yet",
      body: `Each home needs at least 100 sessions before the comparison means anything. So far: Home A ${count(a.sessions)}, Home B ${count(b.sessions)}.`,
    };
  }
  const confidence = test.confidence === null ? "—" : `${(test.confidence * 100).toFixed(0)}%`;
  if (test.significant && test.leader) {
    const winner = test.leader === "a" ? a : b;
    const loser = test.leader === "a" ? b : a;
    return {
      icon: CircleCheck,
      tone: "winner" as const,
      title: `Home ${test.leader.toUpperCase()} converts better`,
      body: `Conversion rate ${rate(winner.conversion_rate)} vs ${rate(loser.conversion_rate)}, with ${confidence} confidence. The difference is unlikely to be chance.`,
    };
  }
  return {
    icon: Scale,
    tone: "neutral" as const,
    title: "No clear winner yet",
    body: `Conversion rate is ${rate(a.conversion_rate)} on Home A and ${rate(b.conversion_rate)} on Home B, but confidence is only ${confidence} (a winner needs 95%). Keep the test running.`,
  };
}

function Verdict({ data }: { data: HomeExperiment }) {
  const conversion = data.tests.find((test) => test.metric === "conversion_rate");
  const engagement = data.tests.find((test) => test.metric === "engagement_rate");
  const verdict = verdictCopy(conversion, data);
  const Icon = verdict.icon;
  return (
    <section
      aria-label="Test verdict"
      className={`flex flex-wrap items-start gap-3 rounded-xl border px-5 py-4 ${
        verdict.tone === "winner" ? "border-hijau/40 bg-hijau/5" : "border-line bg-card-bg"
      }`}
    >
      <Icon size={20} aria-hidden="true" className={`mt-0.5 shrink-0 ${verdict.tone === "winner" ? "text-hijau" : "text-gray-500 dark:text-zinc-400"}`} />
      <div className="min-w-0 flex-1 basis-64">
        <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{verdict.title}</p>
        <p className="mt-0.5 text-sm text-gray-600 dark:text-zinc-300">{verdict.body}</p>
        {engagement?.sample_reached && engagement.confidence !== null && (
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
            Engagement rate:{" "}
            {engagement.significant && engagement.leader
              ? `Home ${engagement.leader.toUpperCase()} keeps visitors engaged better (${(engagement.confidence * 100).toFixed(0)}% confidence).`
              : `no clear difference yet (${(engagement.confidence * 100).toFixed(0)}% confidence).`}
          </p>
        )}
      </div>
    </section>
  );
}

function SetupState({ data }: { data: HomeExperiment | undefined }) {
  return (
    <RevenueCardOS title="Waiting for A/B data" source="warehouse">
      <div className="flex flex-col gap-3 text-sm text-gray-600 dark:text-zinc-300">
        <p>
          {data?.first_date
            ? `The warehouse holds A/B data from ${shortDate(data.first_date)}, but nothing in this period or filter.`
            : "The warehouse has no A/B sessions yet. Figures appear the day after all of these are in place:"}
        </p>
        {!data?.first_date && (
          <ol className="list-decimal space-y-1 pl-5 text-gray-600 dark:text-zinc-300">
            <li>The home A/B switch is live on biz.ailene.id.</li>
            <li>GTM sends <code className="rounded bg-gray-100 px-1 text-xs dark:bg-zinc-800">home_variant</code> on every GA4 event (Google tag shared parameter).</li>
            <li>GA4 has an event-scoped custom dimension for <code className="rounded bg-gray-100 px-1 text-xs dark:bg-zinc-800">home_variant</code>.</li>
            <li>The warehouse GA4 job has run once since then.</li>
          </ol>
        )}
      </div>
    </RevenueCardOS>
  );
}

export default function RevenueHomeExperimentPanelOS({ period, periodLabel, enabled }: RevenueTabProps) {
  const [channel, setChannel] = useState("");
  const [device, setDevice] = useState("");
  const [trend, setTrend] = useState<TrendMetric>("sessions");
  const [breakdown, setBreakdown] = useState<"channel" | "device">("channel");
  const query = useRevenue<HomeExperiment>(
    "home-experiment",
    { period, channel, device },
    () => getHomeExperiment({ ...period, channel: channel || undefined, device: device || undefined }),
    enabled
  );
  const data = query.data;

  const channelOptions = useMemo<AppSelectOption[]>(
    () => [{ value: "", label: "All channels" }, ...(data?.filters.channels ?? []).map((value) => ({ value, label: value }))],
    [data?.filters.channels]
  );
  const deviceOptions = useMemo<AppSelectOption[]>(
    () => [{ value: "", label: "All devices" }, ...(data?.filters.devices ?? []).map((value) => ({ value, label: value }))],
    [data?.filters.devices]
  );

  const variants = data?.variants ?? [emptyVariant("a"), emptyVariant("b")];
  const [a, b] = variants;
  const totalSessions = a.sessions + b.sessions;
  const hasData = totalSessions > 0;
  const lift = data?.lift;

  const rows: MetricRow[] = [
    { key: "sessions", label: "Sessions", info: "Jumlah session GA4 yang mendapat varian ini. Bukan metrik menang/kalah: pembagian yang sehat mendekati 50/50.", value: (v) => v.sessions, format: count, lift: lift?.sessions ?? null, direction: "neutral" },
    { key: "users", label: "Users", info: "Pengunjung unik GA4 per varian.", value: (v) => v.users, format: count, lift: null, direction: "neutral" },
    { key: "page_views", label: "Page views", info: "Total halaman yang dilihat oleh session di varian ini, termasuk halaman lain setelah home.", value: (v) => v.page_views, format: count, lift: lift?.page_views ?? null, direction: "neutral" },
    { key: "pages", label: "Pages per session", info: "Rata-rata halaman yang dibuka per session. Lebih tinggi berarti pengunjung menjelajah lebih jauh.", value: (v) => v.pages_per_session, format: decimal, lift: lift?.pages_per_session ?? null, direction: "higher" },
    { key: "engagement", label: "Engagement rate", info: "Persentase session yang engaged menurut GA4: lebih dari 10 detik, ada konversi, atau 2+ halaman.", value: (v) => v.engagement_rate, format: rate, lift: lift?.engagement_rate ?? null, direction: "higher" },
    { key: "time", label: "Avg. engagement time", info: "Rata-rata waktu aktif (tab terbuka di depan) per session.", value: (v) => v.avg_engagement_seconds, format: duration, lift: lift?.avg_engagement_seconds ?? null, direction: "higher" },
    { key: "leads", label: "Converting sessions", info: "Session dengan event generate_lead: form konsultasi terkirim atau klik WhatsApp.", value: (v) => v.lead_sessions, format: count, lift: null, direction: "neutral" },
    { key: "conversion", label: "Conversion rate", info: "Converting sessions dibagi sessions. Ini metrik utama untuk menentukan pemenang.", value: (v) => v.conversion_rate, format: rate, lift: lift?.conversion_rate ?? null, direction: "higher" },
  ];
  const tileKeys = ["sessions", "engagement", "time", "conversion"];

  const trendData = useMemo(() => {
    const byDate = new Map<string, { date: string } & Record<string, number | string>>();
    for (const day of data?.daily ?? []) {
      const entry = byDate.get(day.date) ?? { date: day.date };
      const label = day.variant === "a" ? "Home A" : "Home B";
      entry[label] =
        trend === "sessions"
          ? day.sessions
          : day.sessions > 0
            ? Number((((trend === "conversion" ? day.lead_sessions : day.engaged_sessions) / day.sessions) * 100).toFixed(1))
            : 0;
      byDate.set(day.date, entry);
    }
    return [...byDate.values()];
  }, [data?.daily, trend]);

  const segments = useMemo(() => {
    const grouped = new Map<string, Record<HomeVariantKey, { sessions: number; engaged: number; leads: number }>>();
    for (const row of data?.segments ?? []) {
      if (row.dimension !== breakdown) continue;
      const entry = grouped.get(row.segment) ?? { a: { sessions: 0, engaged: 0, leads: 0 }, b: { sessions: 0, engaged: 0, leads: 0 } };
      entry[row.variant] = { sessions: row.sessions, engaged: row.engaged_sessions, leads: row.lead_sessions };
      grouped.set(row.segment, entry);
    }
    return [...grouped.entries()].sort(([, x], [, y]) => y.a.sessions + y.b.sessions - (x.a.sessions + x.b.sessions));
  }, [data?.segments, breakdown]);

  if (query.isError && !data) return <RevenueErrorOS error={query.error} onRetry={() => query.refetch()} />;

  const periodStartsEarly = !!data?.first_date && data.first_date > period.start_date;
  const pct = (value: number) => `${value.toFixed(1)}%`;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="min-w-0 flex-1 basis-80 text-base text-gray-800 dark:text-zinc-200">
          Home A (current home) vs Home B (&ldquo;Make AI stick.&rdquo;) on biz.ailene.id across {periodLabel}.
          {data?.as_of && <span className="text-gray-500 dark:text-zinc-400"> Warehouse data through {shortDate(data.last_date)}.</span>}
          {periodStartsEarly && <span className="text-gray-500 dark:text-zinc-400"> The test started {shortDate(data?.first_date)}; earlier days are empty.</span>}
        </p>
        <div className="flex flex-wrap gap-2">
          <AppSelect selectId="home-experiment-channel" className="w-44" placeholder="All channels" value={channel} options={channelOptions} onChange={(value) => setChannel(String(value ?? ""))} />
          <AppSelect selectId="home-experiment-device" className="w-36" placeholder="All devices" value={device} options={deviceOptions} onChange={(value) => setDevice(String(value ?? ""))} />
        </div>
      </div>

      {query.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tileKeys.map((key) => (
            <div key={key} aria-busy="true" aria-label="Loading A/B figures" className="h-36 animate-pulse rounded-xl border border-line bg-card-bg motion-reduce:animate-none" />
          ))}
        </div>
      ) : !hasData || !data ? (
        <SetupState data={data} />
      ) : (
        <>
          <Verdict data={data} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {rows
              .filter((row) => tileKeys.includes(row.key))
              .map((row) => (
                <ComparisonTile
                  key={row.key}
                  row={row}
                  variants={variants}
                  note={row.key === "sessions" ? <span>· split {share(a.sessions, totalSessions)}% / {share(b.sessions, totalSessions)}%</span> : undefined}
                />
              ))}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
            <RevenueCardOS
              title="All metrics"
              description="Semua metrik per varian dalam periode dan filter yang dipilih. Kolom terakhir adalah perubahan Home B dibanding Home A; panah hijau berarti B lebih baik pada metrik yang makin tinggi makin bagus."
              source="warehouse"
              className="xl:col-span-2"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Home A and Home B metrics with the change of B against A</caption>
                  <thead>
                    <tr className="border-b border-line-soft text-left text-xs text-gray-500 dark:text-zinc-400">
                      <th scope="col" className="py-2 pr-3 font-medium">Metric</th>
                      <th scope="col" className="px-3 py-2 text-right font-medium">Home A</th>
                      <th scope="col" className="px-3 py-2 text-right font-medium">Home B</th>
                      <th scope="col" className="py-2 pl-3 text-right font-medium">B vs A</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-soft">
                    {rows.map((row) => {
                      const valueA = row.value(a);
                      const valueB = row.value(b);
                      const better = row.direction === "higher" && valueA !== null && valueB !== null && valueA !== valueB ? (valueB > valueA ? "b" : "a") : null;
                      return (
                        <tr key={row.key}>
                          <th scope="row" className="py-2 pr-3 text-left font-normal text-gray-700 dark:text-zinc-300">{row.label}</th>
                          {(["a", "b"] as const).map((key) => (
                            <td key={key} className={`px-3 py-2 text-right tabular-nums ${better === key ? "font-semibold text-gray-900 dark:text-zinc-100" : "text-gray-700 dark:text-zinc-300"}`}>
                              {row.format(key === "a" ? valueA : valueB)}
                              {better === key && <span className="sr-only"> (better)</span>}
                            </td>
                          ))}
                          <td className="py-2 pl-3 text-right">
                            <LiftChip lift={row.lift} direction={row.direction} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </RevenueCardOS>

            <RevenueCardOS
              title="Day by day"
              description="Perbandingan harian kedua varian. Rate harian bisa naik-turun tajam saat session sedikit; jangan menyimpulkan dari satu hari."
              source="warehouse"
              className="xl:col-span-3"
              actions={
                <div role="group" aria-label="Day by day metric" className="flex rounded-lg border border-line p-0.5">
                  {trendMetrics.map((entry) => (
                    <button key={entry.key} type="button" aria-pressed={trend === entry.key} onClick={() => setTrend(entry.key)} className={segmentedButton(trend === entry.key)}>
                      {entry.label}
                    </button>
                  ))}
                </div>
              }
            >
              <WarehouseStackedTrendOS
                data={trendData}
                stacked={false}
                height={260}
                unit={trend === "sessions" ? "sessions" : "%"}
                format={trend === "sessions" ? undefined : pct}
                axisFormat={trend === "sessions" ? undefined : (value) => `${value}%`}
                series={[
                  { key: "Home A", color: homeVariantColors.a },
                  { key: "Home B", color: homeVariantColors.b },
                ]}
              />
              <ul className="mt-3 flex gap-4 text-xs text-gray-600 dark:text-zinc-300">
                {(["a", "b"] as const).map((key) => (
                  <li key={key} className="flex items-center gap-1.5">
                    <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: homeVariantColors[key] }} />
                    Home {key.toUpperCase()}
                  </li>
                ))}
              </ul>
            </RevenueCardOS>
          </div>

          <RevenueCardOS
            title={breakdown === "channel" ? "By channel" : "By device"}
            description="Apakah pemenangnya sama di setiap channel atau device? Segmen dengan session sedikit belum bisa dijadikan kesimpulan."
            source="warehouse"
            isEmpty={segments.length === 0}
            emptyMessage="No sessions in this breakdown."
            actions={
              <div role="group" aria-label="Breakdown" className="flex rounded-lg border border-line p-0.5">
                {(["channel", "device"] as const).map((entry) => (
                  <button key={entry} type="button" aria-pressed={breakdown === entry} onClick={() => setBreakdown(entry)} className={segmentedButton(breakdown === entry)}>
                    {entry === "channel" ? "Channel" : "Device"}
                  </button>
                ))}
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-150 text-sm">
                <caption className="sr-only">Sessions, engagement rate and conversion rate per {breakdown} for Home A and Home B</caption>
                <thead>
                  <tr className="border-b border-line-soft text-xs text-gray-500 dark:text-zinc-400">
                    <th scope="col" rowSpan={2} className="py-2 pr-3 text-left font-medium">{breakdown === "channel" ? "Channel" : "Device"}</th>
                    <th scope="colgroup" colSpan={2} className="px-3 pt-2 text-center font-medium">Sessions</th>
                    <th scope="colgroup" colSpan={2} className="px-3 pt-2 text-center font-medium">Engagement rate</th>
                    <th scope="colgroup" colSpan={2} className="px-3 pt-2 text-center font-medium">Conversion rate</th>
                  </tr>
                  <tr className="border-b border-line-soft text-xs text-gray-500 dark:text-zinc-400">
                    {[0, 1, 2].flatMap((group) =>
                      (["a", "b"] as const).map((key) => (
                        <th key={`${group}-${key}`} scope="col" className="px-3 pb-2 text-right font-medium">{key.toUpperCase()}</th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft">
                  {segments.map(([segment, values]) => (
                    <tr key={segment}>
                      <th scope="row" className="py-2 pr-3 text-left font-normal text-gray-700 dark:text-zinc-300">{segment}</th>
                      {(["a", "b"] as const).map((key) => (
                        <td key={`s-${key}`} className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-zinc-300">{count(values[key].sessions)}</td>
                      ))}
                      {(["a", "b"] as const).map((key) => (
                        <td key={`e-${key}`} className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-zinc-300">
                          {rate(values[key].sessions ? values[key].engaged / values[key].sessions : null)}
                        </td>
                      ))}
                      {(["a", "b"] as const).map((key) => (
                        <td key={`c-${key}`} className="px-3 py-2 text-right tabular-nums text-gray-700 dark:text-zinc-300">
                          {rate(values[key].sessions ? values[key].leads / values[key].sessions : null)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </RevenueCardOS>
        </>
      )}
    </>
  );
}
