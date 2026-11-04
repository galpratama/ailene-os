"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, { type AppSelectOption } from "@/components/fields/AppSelect";
import { Globe, Megaphone, RadioTower, RefreshCw, RotateCcw } from "lucide-react";

export type AnalyticsRange = "7" | "28" | "90" | "custom";

const ranges: { value: AnalyticsRange; label: string; title: string }[] = [
  { value: "7", label: "7D", title: "Last 7 complete days" },
  { value: "28", label: "28D", title: "Last 28 complete days" },
  { value: "90", label: "90D", title: "Last 90 complete days" },
  { value: "custom", label: "Custom", title: "Choose your own dates" },
];

// One row of filters above everything they scope; every chart below re-renders against this same slice.
export default function AnalyticsFilterBarOS({
  range,
  onRange,
  startDate,
  endDate,
  maxDate,
  onStartDate,
  onEndDate,
  host,
  onHost,
  hostOptions,
  channel,
  onChannel,
  channelOptions,
  campaign,
  onCampaign,
  campaignOptions,
  compareLabel,
  canReset,
  onReset,
  onRefresh,
  isRefreshing,
}: {
  range: AnalyticsRange;
  onRange: (value: AnalyticsRange) => void;
  startDate: string;
  endDate: string;
  maxDate: string;
  onStartDate: (value: string) => void;
  onEndDate: (value: string) => void;
  host: string;
  onHost: (value: string) => void;
  hostOptions: AppSelectOption[];
  channel: string;
  onChannel: (value: string) => void;
  channelOptions: AppSelectOption[];
  campaign: string;
  onCampaign: (value: string) => void;
  campaignOptions: AppSelectOption[];
  compareLabel: string;
  canReset: boolean;
  onReset: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-3">
      <div role="group" aria-label="Date range" className="flex h-9 items-center rounded-lg border border-line p-0.5">
        {ranges.map((entry) => (
          <button
            key={entry.value}
            type="button"
            title={entry.title}
            aria-pressed={range === entry.value}
            onClick={() => onRange(entry.value)}
            className={`h-full rounded-md px-2.5 text-xs font-semibold transition-colors ${range === entry.value ? "bg-lime-bright text-forest-deep" : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"}`}
          >
            {entry.label}
          </button>
        ))}
      </div>
      {range === "custom" && (
        <>
          <AppInput inputId="analytics-start-date" containerClassName="w-38" aria-label="Start date" type="date" max={endDate} value={startDate} onChange={(event) => onStartDate(event.target.value)} />
          <AppInput inputId="analytics-end-date" containerClassName="w-38" aria-label="End date" type="date" min={startDate} max={maxDate} value={endDate} onChange={(event) => onEndDate(event.target.value)} />
        </>
      )}
      <AppSelect selectId="analytics-host" className="w-40" icon={<Globe size={14} />} placeholder="Host" value={host} options={hostOptions} onChange={(value) => onHost(String(value ?? ""))} />
      <AppSelect selectId="analytics-channel" className="w-40" icon={<RadioTower size={14} />} placeholder="Channel" value={channel} options={channelOptions} onChange={(value) => onChannel(String(value ?? ""))} />
      <AppSelect selectId="analytics-campaign" className="w-48" icon={<Megaphone size={14} />} placeholder="Campaign" value={campaign} options={campaignOptions} onChange={(value) => onCampaign(String(value ?? ""))} />
      {canReset && (
        <AppButton type="button" variant="secondary" size="sm" onClick={onReset}>
          <RotateCcw size={13} aria-hidden="true" /> Reset
        </AppButton>
      )}
      <div className="ml-auto flex items-center gap-2">
        <p className="text-xs text-gray-500 dark:text-zinc-400">{compareLabel}</p>
        <AppButton type="button" variant="outline" size="icon" title="Refresh data" aria-label="Refresh data" onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} aria-hidden="true" />
        </AppButton>
      </div>
    </div>
  );
}
