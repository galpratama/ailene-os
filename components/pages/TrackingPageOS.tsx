"use client";

import AppInput from "@/components/fields/AppInput";
import AppButton from "@/components/buttons/AppButton";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import TrackingAileneReferralsPanelOS from "@/components/pages/TrackingAileneReferralsPanelOS";
import TrackingOverviewPanelOS from "@/components/pages/TrackingOverviewPanelOS";
import type { TrackingWebsiteId } from "@/apis/analytics";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

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

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "ailene-referrals", label: "ailene.id referrals" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

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

export default function TrackingPageOS({
  sessionToken,
}: {
  sessionToken: string;
}) {
  const today = useMemo(() => jakartaToday(), []);
  const [tab, setTab] = useState<TabKey>("overview");
  const [period, setPeriod] = useState("28");
  const [startDate, setStartDate] = useState(() => dateDaysBefore(today, 27));
  const [endDate, setEndDate] = useState(today);
  const [website, setWebsite] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const queryKey = ["analytics", "tracking"];
  const isRefreshing = useIsFetching({ queryKey }) > 0;

  const payload = {
    start_date: startDate,
    end_date: endDate,
    ...(website && { website: website as TrackingWebsiteId }),
  };
  const enabled = !!sessionToken && !!startDate && !!endDate;

  function selectPeriod(value: string) {
    setPeriod(value);
    if (value === "custom") return;
    const days = Number(value);
    setEndDate(today);
    setStartDate(dateDaysBefore(today, days - 1));
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
            Tracking B2C
          </h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
            Acquisition and purchase intent across Ailene product websites.
          </p>
        </div>
        <Link
          href="https://docs.google.com/spreadsheets/d/1Ew24liu5-scsHoTVkFE4o96S6IHF3ecWkhTsoHfwo_E/edit?gid=1341796980#gid=1341796980"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-gray-500 hover:text-claude"
        >
          Event taxonomy ↗
        </Link>
      </div>

      {/* Segmented control, not a button group — these switch a view rather than act. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex w-fit rounded-lg border border-line bg-gray-50 p-0.5 dark:bg-zinc-800">
        {tabs.map((entry) => (
          <button
            key={entry.key}
            type="button"
            onClick={() => setTab(entry.key)}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors hover:cursor-pointer ${
              tab === entry.key
                ? "bg-lime-bright text-forest-deep"
                : "text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <AppSelect
          selectId="tracking-website"
          className="w-48"
          placeholder="All websites"
          value={website}
          options={websiteOptions}
          onChange={(value) => setWebsite(value as string | null)}
        />
        <AppSelect
          selectId="tracking-period"
          className="w-44"
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
              containerClassName="w-40"
              aria-label="Start date"
              type="date"
              max={endDate}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
            <AppInput
              inputId="tracking-end-date"
              containerClassName="w-40"
              aria-label="End date"
              type="date"
              min={startDate}
              max={today}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </>
        )}
        <AppButton type="button" variant="outline" size="icon" title="Refresh tracking data" aria-label="Refresh tracking data" onClick={() => queryClient.refetchQueries({ queryKey, type: "active" })} disabled={isRefreshing}>
          <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
        </AppButton>
      </div>
      </div>

      {tab === "overview" ? (
        <TrackingOverviewPanelOS payload={payload} enabled={enabled} />
      ) : (
        <TrackingAileneReferralsPanelOS payload={payload} enabled={enabled} />
      )}
    </div>
  );
}
