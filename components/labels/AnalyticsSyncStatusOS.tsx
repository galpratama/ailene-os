"use client";

import AppButton from "@/components/buttons/AppButton";
import { ChartTooltipCard } from "@/components/elements/ChartHoverOS";
import type { WarehouseAnalytics } from "@/apis/analytics";
import { ageLabel, dateLabel, sourceNames, sourceState, timestampLabel } from "@/lib/analytics-warehouse";
import { CheckCircle2, Clock3, TriangleAlert } from "lucide-react";
import { useState } from "react";

// The page's trust signal: how fresh the warehouse is overall, with per-source detail on hover and a jump to Data Health.
export default function AnalyticsSyncStatusOS({ data, today, onOpen }: { data: WarehouseAnalytics; today: string; onOpen: () => void }) {
  const [open, setOpen] = useState(false);
  const connected = data.freshness.filter((entry) => entry.last_date);
  const states = connected.map((entry) => sourceState(entry.source, entry.last_date, today).state);
  const failed = data.pipeline_runs.some((run) => run.status !== "success" && run.status !== "running");
  const stale = states.includes("stale") || failed;
  const late = states.includes("late");
  const lastSync = connected.map((entry) => entry.loaded_at).filter(Boolean).sort().at(-1);
  const Icon = stale ? TriangleAlert : late ? Clock3 : CheckCircle2;
  const color = stale ? "var(--label-merah)" : late ? "var(--label-kuning)" : "var(--label-hijau)";
  const summary = stale ? "Needs attention" : late ? "A source is late" : "All sources healthy";

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <AppButton type="button" variant="outline" size="sm" onClick={onOpen} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} aria-label={`${summary}, last sync ${timestampLabel(lastSync)}. Open Data Health`}>
        <Icon size={14} style={{ color }} aria-hidden="true" />
        <span className="font-medium">{summary}</span>
        <span className="text-gray-500 dark:text-zinc-400">· synced {ageLabel(lastSync)}</span>
      </AppButton>
      {open && (
        <div role="tooltip" className="absolute right-0 top-full z-40 pt-1.5">
          <ChartTooltipCard
            title={`Last sync ${timestampLabel(lastSync)}`}
            rows={data.freshness.map((entry) => ({ label: sourceNames[entry.source] ?? entry.source, value: entry.last_date ? `through ${dateLabel(entry.last_date)}` : "Not connected" }))}
            note="Click to open Data Health."
          />
        </div>
      )}
    </div>
  );
}
