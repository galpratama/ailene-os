"use client";

import type { WarehouseAnalyticsPayload } from "@/apis/analytics";
import AppButton from "@/components/buttons/AppButton";
import type { AppSelectOption } from "@/components/fields/AppSelect";
import AnalyticsSyncStatusOS from "@/components/labels/AnalyticsSyncStatusOS";
import AnalyticsFilterBarOS, { type AnalyticsRange } from "@/components/navigations/AnalyticsFilterBarOS";
import AnalyticsHealthPanelOS from "@/components/pages/AnalyticsHealthPanelOS";
import AnalyticsLandingPagePanelOS from "@/components/pages/AnalyticsLandingPagePanelOS";
import AnalyticsMetaWarehousePanelOS from "@/components/pages/AnalyticsMetaWarehousePanelOS";
import AnalyticsOverviewPanelOS from "@/components/pages/AnalyticsOverviewPanelOS";
import AnalyticsSEOPanelOS from "@/components/pages/AnalyticsSEOPanelOS";
import AnalyticsTrafficPanelOS from "@/components/pages/AnalyticsTrafficPanelOS";
import { AnalyticsViewProvider } from "@/contexts/AnalyticsViewContext";
import { useWarehouseAnalytics } from "@/hooks/useAnalyticsDashboard";
import { jakartaToday, periodLabel, shiftDate } from "@/lib/analytics-warehouse";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { Activity, Database, LayoutDashboard, Megaphone, PanelTop, Search, TriangleAlert, type LucideIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const tabs: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "landing", label: "Landing Page", icon: PanelTop },
  { key: "meta", label: "Meta Ads", icon: Megaphone },
  { key: "seo", label: "SEO", icon: Search },
  { key: "traffic", label: "Traffic & Audience", icon: Activity },
  { key: "health", label: "Data Health", icon: Database },
];

const DEFAULT_HOST = "biz.ailene.id";
const DEFAULT_RANGE: AnalyticsRange = "7";

function LoadingSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading analytics" className="flex animate-pulse flex-col gap-4">
      <div className="h-24 rounded-xl border border-line bg-card-bg" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-32 rounded-xl border border-line bg-card-bg" />)}
      </div>
      <div className="grid gap-4 xl:grid-cols-5">
        <div className="h-96 rounded-xl border border-line bg-card-bg xl:col-span-2" />
        <div className="h-96 rounded-xl border border-line bg-card-bg xl:col-span-3" />
      </div>
    </div>
  );
}

export default function AnalyticsPageOS({ sessionToken }: { sessionToken: string }) {
  const params = useSearchParams();
  // Yesterday is the newest complete day: today's GA4 and Meta rows would make every total look like a fall.
  const today = useMemo(() => jakartaToday(), []);
  const lastCompleteDay = useMemo(() => shiftDate(today, -1), [today]);

  const initialRange = (["7", "28", "90", "custom"].includes(params.get("range") ?? "") ? params.get("range") : DEFAULT_RANGE) as AnalyticsRange;
  const [tab, setTab] = useState(() => (tabs.some((entry) => entry.key === params.get("tab")) ? (params.get("tab") as string) : "overview"));
  const [range, setRange] = useState<AnalyticsRange>(initialRange);
  const [startDate, setStartDate] = useState(() => (initialRange === "custom" && params.get("start")) || shiftDate(lastCompleteDay, -(Number(initialRange === "custom" ? DEFAULT_RANGE : initialRange) - 1)));
  const [endDate, setEndDate] = useState(() => (initialRange === "custom" && params.get("end")) || lastCompleteDay);
  const [host, setHost] = useState(() => { const value = params.get("host"); return value === null ? DEFAULT_HOST : value; });
  const [channel, setChannel] = useState(() => params.get("channel") ?? "");
  const [campaign, setCampaign] = useState(() => params.get("campaign") ?? "");

  useEffect(() => {
    const next = new URLSearchParams();
    if (tab !== "overview") next.set("tab", tab);
    if (range !== DEFAULT_RANGE) next.set("range", range);
    if (range === "custom") {
      next.set("start", startDate);
      next.set("end", endDate);
    }
    if (host !== DEFAULT_HOST) next.set("host", host);
    if (channel) next.set("channel", channel);
    if (campaign) next.set("campaign", campaign);
    const query = next.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }, [tab, range, startDate, endDate, host, channel, campaign]);

  const payload = useMemo<WarehouseAnalyticsPayload>(() => ({
    start_date: startDate,
    end_date: endDate,
    ...(host ? { host } : {}),
    ...(channel ? { channel } : {}),
    ...(campaign ? { campaign_id: campaign } : {}),
  }), [startDate, endDate, host, channel, campaign]);

  const queryClient = useQueryClient();
  const query = useWarehouseAnalytics(payload, !!sessionToken && !!startDate && !!endDate && startDate <= endDate);
  const isRefreshing = useIsFetching({ queryKey: ["analytics", "warehouse"] }) > 0;
  const data = query.data;

  function selectRange(value: AnalyticsRange) {
    setRange(value);
    if (value === "custom") return;
    setEndDate(lastCompleteDay);
    setStartDate(shiftDate(lastCompleteDay, -(Number(value) - 1)));
  }

  function resetFilters() {
    selectRange(DEFAULT_RANGE);
    setHost(DEFAULT_HOST);
    setChannel("");
    setCampaign("");
  }

  const hostOptions = useMemo<AppSelectOption[]>(() => [{ value: "", label: "All marketing hosts" }, ...(data?.filters.hosts ?? [DEFAULT_HOST]).map((value) => ({ value, label: value }))], [data?.filters.hosts]);
  const channelOptions = useMemo<AppSelectOption[]>(() => [{ value: "", label: "All channels" }, ...(data?.filters.channels ?? []).map((value) => ({ value, label: value }))], [data?.filters.channels]);
  const campaignOptions = useMemo<AppSelectOption[]>(() => [{ value: "", label: "All campaigns" }, ...(data?.filters.campaigns ?? []).map((value) => ({ value: value.id, label: value.name }))], [data?.filters.campaigns]);

  const view = useMemo(() => (data ? {
    data,
    today,
    activeFilters: { host: !!host, channel: !!channel, campaign: !!campaign },
  } : null), [data, today, host, channel, campaign]);

  return (
    <div className="flex flex-col gap-4 px-4 py-5 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Marketing Analytics</h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">Meta Ads, GA4, and Search Console from one warehouse, so every number here agrees.</p>
        </div>
        {data && <AnalyticsSyncStatusOS data={data} today={today} onOpen={() => setTab("health")} />}
      </div>

      <div className="z-30 rounded-xl border border-line bg-card-bg shadow-sm lg:sticky lg:top-3">
        <div role="tablist" aria-label="Analytics views" className="flex overflow-x-auto overflow-y-hidden border-b border-line-soft px-2">
          {tabs.map((entry) => {
            const Icon = entry.icon;
            const active = tab === entry.key;
            return (
              <button
                key={entry.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(entry.key)}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${active ? "border-claude text-gray-900 dark:border-lime-bright dark:text-zinc-100" : "border-transparent text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"}`}
              >
                <Icon size={14} aria-hidden="true" />
                {entry.label}
              </button>
            );
          })}
        </div>
        <AnalyticsFilterBarOS
          range={range}
          onRange={selectRange}
          startDate={startDate}
          endDate={endDate}
          maxDate={today}
          onStartDate={setStartDate}
          onEndDate={setEndDate}
          host={host}
          onHost={setHost}
          hostOptions={hostOptions}
          channel={channel}
          onChannel={setChannel}
          channelOptions={channelOptions}
          campaign={campaign}
          onCampaign={setCampaign}
          campaignOptions={campaignOptions}
          compareLabel={data ? `${periodLabel(data.period.start_date, data.period.end_date)} vs ${periodLabel(data.period.previous_start_date, data.period.previous_end_date)}` : ""}
          canReset={range !== DEFAULT_RANGE || host !== DEFAULT_HOST || !!channel || !!campaign}
          onReset={resetFilters}
          onRefresh={() => queryClient.refetchQueries({ queryKey: ["analytics", "warehouse"], type: "active" })}
          isRefreshing={isRefreshing}
        />
      </div>

      {query.isLoading && <LoadingSkeleton />}
      {query.isError && !data && (
        <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-line bg-card-bg p-8 text-center">
          <TriangleAlert size={22} style={{ color: "var(--label-merah)" }} aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">The warehouse could not be reached</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{query.error instanceof Error ? query.error.message : "The analytics API did not respond."}</p>
          </div>
          <AppButton type="button" variant="outline" size="sm" onClick={() => query.refetch()}>Try again</AppButton>
        </div>
      )}
      {view && (
        <AnalyticsViewProvider value={view}>
          <div className={`transition-opacity duration-200 ${query.isPlaceholderData ? "opacity-60" : "opacity-100"}`} aria-busy={query.isPlaceholderData}>
            {tab === "overview" && <AnalyticsOverviewPanelOS />}
            {tab === "landing" && <AnalyticsLandingPagePanelOS />}
            {tab === "meta" && <AnalyticsMetaWarehousePanelOS />}
            {tab === "seo" && <AnalyticsSEOPanelOS />}
            {tab === "traffic" && <AnalyticsTrafficPanelOS />}
            {tab === "health" && <AnalyticsHealthPanelOS />}
          </div>
        </AnalyticsViewProvider>
      )}
    </div>
  );
}
