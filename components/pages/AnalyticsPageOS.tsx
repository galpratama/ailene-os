"use client";

import AnalyticsGA4PanelOS from "@/components/pages/AnalyticsGA4PanelOS";
import AnalyticsMetaAdsPanelOS from "@/components/pages/AnalyticsMetaAdsPanelOS";
import AppInput from "@/components/fields/AppInput";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import { setSessionToken } from "@/trpc/client";
import { CalendarDays } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const periodOptions: AppSelectOption[] = [
  { value: "7", label: "Last 7 days" },
  { value: "28", label: "Last 28 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 12 months" },
  { value: "custom", label: "Custom range" },
];

const tabs = [
  { key: "ga4", label: "GA4" },
  { key: "meta", label: "Meta Ads" },
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

export default function AnalyticsPageOS({
  sessionToken,
}: {
  sessionToken: string;
}) {
  // Covers the shell itself; each panel sets the token again for its own query.
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const today = useMemo(() => jakartaToday(), []);
  const [tab, setTab] = useState<TabKey>("ga4");
  const [period, setPeriod] = useState("28");
  const [startDate, setStartDate] = useState(() => dateDaysBefore(today, 27));
  const [endDate, setEndDate] = useState(today);

  function selectPeriod(value: string) {
    setPeriod(value);
    if (value === "custom") return;
    const days = Number(value);
    setEndDate(today);
    setStartDate(dateDaysBefore(today, days - 1));
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
          Analytics B2B
        </h2>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
          Organic traffic from the marketing site and paid delivery from Meta,
          on one reporting period.
        </p>
      </div>

      {/* Segmented control, not a button group — these switch a view rather than act. */}
      <div className="flex w-fit rounded-lg border border-gray-300 bg-gray-50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
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

      {tab === "ga4" ? (
        <AnalyticsGA4PanelOS
          sessionToken={sessionToken}
          startDate={startDate}
          endDate={endDate}
        />
      ) : (
        <AnalyticsMetaAdsPanelOS
          sessionToken={sessionToken}
          startDate={startDate}
          endDate={endDate}
        />
      )}
    </div>
  );
}
