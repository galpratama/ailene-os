"use client";

import type { RevenuePeriodPayload } from "@/apis/revenue";
import AppButton from "@/components/buttons/AppButton";
import AppSelect from "@/components/fields/AppSelect";
import RevenueAfterSalePanelOS from "@/components/pages/RevenueAfterSalePanelOS";
import RevenueBDRPanelOS from "@/components/pages/RevenueBDRPanelOS";
import RevenueDataHealthPanelOS from "@/components/pages/RevenueDataHealthPanelOS";
import RevenueLeadGenPanelOS from "@/components/pages/RevenueLeadGenPanelOS";
import RevenueOverviewPanelOS from "@/components/pages/RevenueOverviewPanelOS";
import RevenueSDRPanelOS from "@/components/pages/RevenueSDRPanelOS";
import RevenueTargetsPanelOS from "@/components/pages/RevenueTargetsPanelOS";
import RevenueTeamTasksPanelOS from "@/components/pages/RevenueTeamTasksPanelOS";
import { revenueMonths } from "@/lib/revenue";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { Banknote, CalendarRange, Database, Handshake, LayoutDashboard, ListChecks, Megaphone, PhoneCall, RefreshCw, Sparkles, type LucideIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

export type RevenueTabProps = { period: RevenuePeriodPayload; monthLabel: string; enabled: boolean };

const tabs: { key: string; label: string; icon: LucideIcon; group: "ceo" | "team" | "gtm" }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard, group: "ceo" },
  { key: "leads", label: "Lead generation", icon: Megaphone, group: "team" },
  { key: "sdr", label: "SDR", icon: PhoneCall, group: "team" },
  { key: "bdr", label: "BDR", icon: Handshake, group: "team" },
  { key: "targets", label: "Targets & cash", icon: Banknote, group: "team" },
  { key: "after", label: "After the sale", icon: Sparkles, group: "team" },
  { key: "tasks", label: "Team tasks", icon: ListChecks, group: "team" },
  { key: "health", label: "Data health", icon: Database, group: "gtm" },
];

const groupLabels = { ceo: "CEO", team: "Team", gtm: "GTM engineer" };

// The revenue engine: one month at a time, compared with the equally long period before it, split into the dashboard's views.
export default function RevenueEngineOS({ sessionToken }: { sessionToken: string }) {
  const params = useSearchParams();
  const months = useMemo(() => revenueMonths(12), []);
  const [monthKey, setMonthKey] = useState(() => {
    const value = params.get("month");
    return months.some((entry) => entry.key === value) ? (value as string) : months[0].key;
  });
  const [tab, setTab] = useState(() => {
    const value = params.get("view");
    return tabs.some((entry) => entry.key === value) ? (value as string) : "overview";
  });
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const queryClient = useQueryClient();
  const isFetching = useIsFetching({ queryKey: ["revenue"] }) > 0;
  const month = months.find((entry) => entry.key === monthKey) ?? months[0];
  const props: RevenueTabProps = { period: { start_date: month.start, end_date: month.end }, monthLabel: month.label.replace(" (to date)", ""), enabled: !!sessionToken };

  useEffect(() => {
    // Keep the open view and month in the URL so a link reopens the same figures.
    const next = new URLSearchParams(window.location.search);
    if (tab === "overview") next.delete("view");
    else next.set("view", tab);
    if (monthKey === months[0].key) next.delete("month");
    else next.set("month", monthKey);
    const query = next.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }, [tab, monthKey, months]);

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const moves: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = tabs[(moves[event.key] + tabs.length) % tabs.length];
    setTab(next.key);
    tabRefs.current[next.key]?.focus();
  }

  return (
    <section aria-labelledby="revenue-engine-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 id="revenue-engine-title" className="text-lg font-bold text-gray-900 dark:text-zinc-100">Revenue engine</h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
            Leads to cash from Ailene OS and the marketing warehouse. Figures follow your data scope; money in rupiah.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AppSelect
            selectId="revenue-month"
            className="w-56"
            icon={<CalendarRange size={14} aria-hidden="true" />}
            placeholder="Month"
            value={monthKey}
            onChange={(value) => setMonthKey(String(value ?? months[0].key))}
            options={months.map((entry) => ({ value: entry.key, label: entry.label }))}
          />
          <AppButton
            type="button"
            variant="outline"
            size="icon"
            aria-label="Refresh revenue figures"
            title="Refresh"
            disabled={isFetching}
            onClick={() => queryClient.refetchQueries({ queryKey: ["revenue"], type: "active" })}
          >
            <RefreshCw size={14} aria-hidden="true" className={isFetching ? "animate-spin motion-reduce:animate-none" : ""} />
          </AppButton>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-card-bg">
        <div role="tablist" aria-label="Revenue engine views" className="flex flex-wrap px-2">
          {tabs.map((entry, index) => {
            const Icon = entry.icon;
            const active = tab === entry.key;
            const newGroup = index === 0 || tabs[index - 1].group !== entry.group;
            return (
              <div key={entry.key} className="flex shrink-0 items-center">
                {newGroup && (
                  <span aria-hidden="true" className={`px-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500 ${index > 0 ? "ml-1 border-l border-line-soft pl-3" : ""}`}>
                    {groupLabels[entry.group]}
                  </span>
                )}
                <button
                  ref={(node) => {
                    tabRefs.current[entry.key] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`revenue-tab-${entry.key}`}
                  aria-selected={active}
                  aria-controls="revenue-panel"
                  tabIndex={active ? 0 : -1}
                  onClick={() => setTab(entry.key)}
                  onKeyDown={(event) => onTabKey(event, index)}
                  className={`flex min-h-11 cursor-pointer items-center gap-1.5 border-b-2 px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-claude dark:focus-visible:ring-lime-bright ${active ? "border-claude text-gray-900 dark:border-lime-bright dark:text-zinc-100" : "border-transparent text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"}`}
                >
                  <Icon size={14} aria-hidden="true" />
                  {entry.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div id="revenue-panel" role="tabpanel" aria-labelledby={`revenue-tab-${tab}`} className="flex flex-col gap-4">
        {tab === "overview" && <RevenueOverviewPanelOS {...props} />}
        {tab === "leads" && <RevenueLeadGenPanelOS {...props} />}
        {tab === "sdr" && <RevenueSDRPanelOS {...props} />}
        {tab === "bdr" && <RevenueBDRPanelOS {...props} />}
        {tab === "targets" && <RevenueTargetsPanelOS {...props} />}
        {tab === "after" && <RevenueAfterSalePanelOS />}
        {tab === "tasks" && <RevenueTeamTasksPanelOS {...props} />}
        {tab === "health" && <RevenueDataHealthPanelOS {...props} />}
      </div>
    </section>
  );
}
