"use client";

import type { WarehouseAnalyticsPayload } from "@/apis/analytics";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, { type AppSelectOption } from "@/components/fields/AppSelect";
import AnalyticsFreshnessOS from "@/components/labels/AnalyticsFreshnessOS";
import AnalyticsHealthPanelOS from "@/components/pages/AnalyticsHealthPanelOS";
import AnalyticsLandingPagePanelOS from "@/components/pages/AnalyticsLandingPagePanelOS";
import AnalyticsMetaWarehousePanelOS from "@/components/pages/AnalyticsMetaWarehousePanelOS";
import AnalyticsOverviewPanelOS from "@/components/pages/AnalyticsOverviewPanelOS";
import AnalyticsSEOPanelOS from "@/components/pages/AnalyticsSEOPanelOS";
import AnalyticsTrafficPanelOS from "@/components/pages/AnalyticsTrafficPanelOS";
import { useWarehouseAnalytics } from "@/hooks/useAnalyticsDashboard";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

const periodOptions: AppSelectOption[] = [
  { value: "7", label: "Last 7 days" },
  { value: "28", label: "Last 28 days" },
  { value: "90", label: "Last 90 days" },
  { value: "custom", label: "Custom range" },
];

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "landing", label: "Landing Page" },
  { key: "meta", label: "Meta Ads" },
  { key: "seo", label: "SEO" },
  { key: "traffic", label: "Traffic & Audience" },
  { key: "health", label: "Data Health" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

function jakartaToday() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function dateDaysBefore(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function AnalyticsPageOS({ sessionToken }: { sessionToken: string }) {
  const today = useMemo(() => jakartaToday(), []);
  const [tab, setTab] = useState<TabKey>("overview");
  const [period, setPeriod] = useState("7");
  const [startDate, setStartDate] = useState(() => dateDaysBefore(today, 6));
  const [endDate, setEndDate] = useState(today);
  const [host, setHost] = useState("biz.ailene.id");
  const [channel, setChannel] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const queryClient = useQueryClient();
  const payload = useMemo<WarehouseAnalyticsPayload>(() => ({
    start_date: startDate,
    end_date: endDate,
    ...(host ? { host } : {}),
    ...(channel ? { channel } : {}),
    ...(campaignId ? { campaign_id: campaignId } : {}),
  }), [startDate, endDate, host, channel, campaignId]);
  const query = useWarehouseAnalytics(payload, !!sessionToken && !!startDate && !!endDate);
  const isRefreshing = useIsFetching({ queryKey: ["analytics", "warehouse"] }) > 0;

  function selectPeriod(value: string) {
    setPeriod(value);
    if (value === "custom") return;
    const days = Number(value);
    setEndDate(today);
    setStartDate(dateDaysBefore(today, days - 1));
  }

  const hostOptions = useMemo<AppSelectOption[]>(() => [
    { value: "", label: "All marketing hosts" },
    ...(query.data?.filters.hosts ?? []).map((value) => ({ value, label: value })),
  ], [query.data]);
  const channelOptions = useMemo<AppSelectOption[]>(() => [
    { value: "", label: "All channels" },
    ...(query.data?.filters.channels ?? []).map((value) => ({ value, label: value })),
  ], [query.data]);
  const campaignOptions = useMemo<AppSelectOption[]>(() => [
    { value: "", label: "All campaigns" },
    ...(query.data?.filters.campaigns ?? []).map((value) => ({ value: value.id, label: value.name })),
  ], [query.data]);

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Marketing Analytics</h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">Meta Ads, GA4, and Search Console from the Ailene Warehouse semantic layer.</p>
        </div>
        {query.data && <AnalyticsFreshnessOS freshness={query.data.freshness} />}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-card-bg p-3">
        <AppSelect selectId="analytics-period" className="w-42" icon={<CalendarDays size={14} />} placeholder="Period" value={period} options={periodOptions} onChange={(value) => selectPeriod(String(value))} />
        {period === "custom" && <><AppInput inputId="analytics-start-date" containerClassName="w-38" aria-label="Start date" type="date" max={endDate} value={startDate} onChange={(event) => setStartDate(event.target.value)} /><AppInput inputId="analytics-end-date" containerClassName="w-38" aria-label="End date" type="date" min={startDate} max={today} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></>}
        <AppSelect selectId="analytics-host" className="w-46" placeholder="Host" value={host} options={hostOptions} onChange={(value) => setHost(String(value ?? ""))} />
        <AppSelect selectId="analytics-channel" className="w-46" placeholder="Channel" value={channel} options={channelOptions} onChange={(value) => setChannel(String(value ?? ""))} />
        <AppSelect selectId="analytics-campaign" className="min-w-56 flex-1" placeholder="Campaign" value={campaignId} options={campaignOptions} onChange={(value) => setCampaignId(String(value ?? ""))} />
        <AppButton type="button" variant="outline" size="icon" title="Refresh warehouse data" aria-label="Refresh warehouse data" onClick={() => queryClient.refetchQueries({ queryKey: ["analytics", "warehouse"], type: "active" })} disabled={isRefreshing}>
          <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
        </AppButton>
      </div>

      <div className="overflow-x-auto">
        <div className="flex w-max min-w-full rounded-lg border border-line bg-gray-50 p-0.5 dark:bg-zinc-800">
          {tabs.map((entry) => <button key={entry.key} type="button" onClick={() => setTab(entry.key)} className={`flex-1 whitespace-nowrap rounded-md px-4 py-2 text-sm font-semibold transition-colors ${tab === entry.key ? "bg-lime-bright text-forest-deep" : "text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-100"}`}>{entry.label}</button>)}
        </div>
      </div>

      {query.isLoading && <div className="flex min-h-70 items-center justify-center rounded-xl border border-line bg-card-bg text-sm text-gray-400">Loading analytics from Ailene Warehouse…</div>}
      {query.isError && <div className="rounded-xl border border-red-300 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"><p className="font-bold">Warehouse analytics is unavailable</p><p className="mt-1">{query.error instanceof Error ? query.error.message : "The analytics API could not load the semantic layer."}</p></div>}
      {query.data && <>
        {tab === "overview" && <AnalyticsOverviewPanelOS data={query.data} />}
        {tab === "landing" && <AnalyticsLandingPagePanelOS data={query.data} />}
        {tab === "meta" && <AnalyticsMetaWarehousePanelOS data={query.data} />}
        {tab === "seo" && <AnalyticsSEOPanelOS data={query.data} />}
        {tab === "traffic" && <AnalyticsTrafficPanelOS data={query.data} />}
        {tab === "health" && <AnalyticsHealthPanelOS data={query.data} />}
      </>}
    </div>
  );
}
