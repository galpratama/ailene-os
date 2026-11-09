"use client";

import type { RevenuePeriodPayload } from "@/apis/revenue";
import AppButton from "@/components/buttons/AppButton";
import AppDateRangeFilter from "@/components/fields/AppDateRangeFilter";
import { revenuePresetRange, revenueRangeError, type RevenueRangePreset } from "@/lib/revenue";
import { useState } from "react";

const presets: { value: RevenueRangePreset; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "14d", label: "Last 14 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "3m", label: "Last 3 months" },
  { value: "6m", label: "Last 6 months" },
];

export default function RevenueDateRangeOS({ period, today, onChange }: {
  period: RevenuePeriodPayload;
  today: string;
  onChange: (period: RevenuePeriodPayload) => void;
}) {
  const [draft, setDraft] = useState(period);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  const selected = editing ? null : presets.find(({ value }) => {
    const range = revenuePresetRange(value, today);
    return range.start_date === period.start_date && range.end_date === period.end_date;
  })?.value ?? null;

  function apply() {
    const message = revenueRangeError(draft.start_date, draft.end_date);
    setError(message);
    if (message) return;
    onChange(draft);
    setEditing(false);
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end xl:w-auto">
      <div className="w-full sm:w-44">
        <label htmlFor="revenue-range-preset" className="sr-only">Date range preset</label>
        <select
          id="revenue-range-preset"
          value={selected ?? "custom"}
          onChange={(event) => {
            if (event.target.value === "custom") {
              setEditing(true);
              return;
            }
            const range = revenuePresetRange(event.target.value as RevenueRangePreset, today);
            setDraft(range);
            setEditing(false);
            setError("");
            onChange(range);
          }}
          className="h-9 w-full rounded-lg border border-line bg-gray-50 px-3 text-sm text-gray-900 focus:border-claude focus:outline-none focus:ring-2 focus:ring-claude/30 dark:bg-zinc-800 dark:text-zinc-100"
        >
          <option value="custom">Custom range</option>
          {presets.map((preset) => <option key={preset.value} value={preset.value}>{preset.label}</option>)}
        </select>
      </div>
      <div className="w-full sm:w-68">
        <AppDateRangeFilter
          fieldId="revenue-range"
          label="Revenue period"
          from={draft.start_date}
          to={draft.end_date}
          onChange={({ from, to }) => {
            setDraft({ start_date: from, end_date: to });
            setEditing(true);
            setError("");
          }}
        />
      </div>
      <AppButton type="button" variant="outline" size="sm" disabled={!editing} onClick={apply}>Apply</AppButton>
      {error && <p role="alert" className="w-full text-xs text-merah">{error}</p>}
    </div>
  );
}
