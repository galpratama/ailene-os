"use client";

import WarehouseCoverageChartOS from "@/components/charts/WarehouseCoverageChartOS";
import AnalyticsDataTableOS from "@/components/elements/AnalyticsDataTableOS";
import AnalyticsSectionOS from "@/components/elements/AnalyticsSectionOS";
import ChartHoverOS from "@/components/elements/ChartHoverOS";
import InfoTooltipOS from "@/components/elements/InfoTooltipOS";
import Label, { type LabelVariant } from "@/components/labels/Label";
import { useAnalyticsView } from "@/contexts/AnalyticsViewContext";
import { ageLabel, coverageOf, dateLabel, datasetInfo, integer, sourceNames, sourceState, timestampLabel, type DatasetKey, type SourceState } from "@/lib/analytics-warehouse";
import { CheckCircle2, CircleAlert, Clock3, Plug, TriangleAlert, type LucideIcon } from "lucide-react";

const stateCopy: Record<SourceState, { label: string; tone: LabelVariant; icon: LucideIcon }> = {
  healthy: { label: "On time", tone: "hijau", icon: CheckCircle2 },
  late: { label: "Late", tone: "kuning", icon: Clock3 },
  stale: { label: "Stale", tone: "merah", icon: TriangleAlert },
  not_connected: { label: "Not connected", tone: "gray", icon: Plug },
};

const statusColor = (status: string) => (status === "success" ? "var(--label-hijau)" : status === "running" ? "var(--label-biru)" : "var(--label-merah)");

const gapNames: Record<string, string> = {
  landing_form_by_page: "Form completion per page",
  landing_release_annotations: "Landing page release markers",
  seo_zero_impression_articles: "Articles with no impressions",
  crm_revenue: "Revenue, CAC, and ROAS",
  landing_key_events_missing: "Landing page conversion",
  landing_campaign_attribution: "Campaign filter on landing pages",
  funnel_form_campaign_attribution: "Campaign filter on form starts",
  web_lead_campaign_attribution: "Campaign filter on website leads",
};

export default function AnalyticsHealthPanelOS() {
  const { data, today } = useAnalyticsView();
  const states = data.freshness.map((entry) => ({ ...entry, ...sourceState(entry.source, entry.last_date, today) }));
  const failedRuns = data.pipeline_runs.filter((run) => run.status !== "success" && run.status !== "running");
  const attention = states.filter((entry) => entry.state === "late" || entry.state === "stale").length + failedRuns.length;
  const connectedCount = states.filter((entry) => entry.state !== "not_connected").length;
  const latestRun = data.pipeline_runs[0];
  const OverallIcon = attention > 0 ? TriangleAlert : CheckCircle2;

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-card-bg p-4" aria-label="Warehouse status">
        <OverallIcon size={24} style={{ color: attention > 0 ? "var(--label-kuning)" : "var(--label-hijau)" }} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-heading text-lg font-semibold text-gray-900 dark:text-zinc-100">
            {attention > 0 ? `${attention} item${attention > 1 ? "s" : ""} need attention` : "The warehouse is healthy"}
          </p>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            {connectedCount} of {states.length} sources connected · last run {latestRun ? `${ageLabel(latestRun.finished_at ?? latestRun.started_at)} (${timestampLabel(latestRun.finished_at ?? latestRun.started_at)})` : "never"}
          </p>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {states.map((entry) => {
          const copy = stateCopy[entry.state];
          const Icon = copy.icon;
          const runs = data.pipeline_runs.filter((run) => run.source === entry.source);
          const name = sourceNames[entry.source] ?? entry.source;
          return (
            <article key={entry.source} className="flex min-w-0 flex-col gap-3 rounded-xl border border-line bg-card-bg p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">{name}</h3>
                <Label variant={copy.tone}><Icon size={12} aria-hidden="true" />{copy.label}</Label>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <div><dt className="text-gray-500 dark:text-zinc-400">Data through</dt><dd className="font-semibold text-gray-900 dark:text-zinc-100">{entry.last_date ? dateLabel(entry.last_date) : "—"}</dd></div>
                <div><dt className="text-gray-500 dark:text-zinc-400">Behind today</dt><dd className="font-semibold text-gray-900 dark:text-zinc-100">{entry.lagDays === null ? "—" : `${entry.lagDays} day${entry.lagDays === 1 ? "" : "s"}`}</dd></div>
                <div className="col-span-2"><dt className="text-gray-500 dark:text-zinc-400">Last sync</dt><dd className="font-semibold text-gray-900 dark:text-zinc-100">{timestampLabel(entry.loaded_at)}</dd></div>
              </dl>
              <div className="mt-auto">
                <p className="mb-1 text-xs text-gray-500 dark:text-zinc-400">Recent runs, oldest to newest</p>
                {runs.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-zinc-400">No runs recorded.</p>
                ) : (
                  <div className="flex h-6 items-stretch gap-0.5">
                    {[...runs].reverse().map((run) => (
                      <ChartHoverOS
                        key={run.run_id}
                        label={`${name} run ${timestampLabel(run.started_at)}: ${run.status}`}
                        title={timestampLabel(run.started_at)}
                        rows={[
                          { label: "status", value: run.status, color: statusColor(run.status) },
                          { label: "rows written", value: integer(run.rows_upserted) },
                          { label: "data window", value: `${dateLabel(run.window_start)} – ${dateLabel(run.window_end)}` },
                        ]}
                        note={run.error ?? undefined}
                        className="w-2 max-w-3 flex-1 rounded-xs transition-opacity hover:opacity-70"
                        style={{ backgroundColor: statusColor(run.status) }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnalyticsSectionOS
          title="Data coverage"
          question="What each dataset actually holds"
          info="Each green bar runs from the first to the latest day a dataset holds. The blue band is the period you selected. A bar that starts after the band means part of your period has no data, so totals there and comparisons with the previous period are incomplete."
          datasets={["meta_ads", "ga4_traffic", "search_console"]}
        >
          <WarehouseCoverageChartOS
            start={data.period.start_date}
            end={data.period.end_date}
            today={today}
            rows={(Object.keys(datasetInfo) as DatasetKey[]).map((dataset) => ({ key: dataset, label: datasetInfo[dataset].label, first: coverageOf(data, dataset)?.first_date ?? null, last: coverageOf(data, dataset)?.last_date ?? null }))}
          />
        </AnalyticsSectionOS>

        <section className="flex min-w-0 flex-col rounded-xl border border-line bg-card-bg p-5" aria-label="Known data gaps">
          <div className="flex items-center gap-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Known data gaps</h3>
            <InfoTooltipOS label="Known data gaps" explanation="Figures the warehouse cannot honestly produce yet, listed here instead of being filled with estimates. Each one needs a data source or a tracking change first." />
          </div>
          <ul className="mt-3 flex flex-col divide-y divide-line-soft">
            {data.data_gaps.map((gap) => (
              <li key={gap.code} className="flex gap-2.5 py-2.5 first:pt-0 last:pb-0">
                <CircleAlert size={14} className="mt-0.5 shrink-0 text-gray-400 dark:text-zinc-500" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-zinc-100">{gapNames[gap.code] ?? gap.code.replaceAll("_", " ")}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-zinc-400">{gap.message}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="min-w-0 rounded-xl border border-line bg-card-bg p-5" aria-label="Pipeline run log">
        <div className="mb-3 flex items-center gap-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Run log</h3>
          <InfoTooltipOS label="Run log" explanation="The latest 30 ingestion runs, newest first. Rows written is how many rows a run inserted or updated. A run that re-reads an old window is normal, because ad platforms restate recent days. Compare Meta spend with Ads Manager weekly as a manual check." />
        </div>
        <AnalyticsDataTableOS
          rowKey={(run) => run.run_id}
          rows={data.pipeline_runs}
          columns={[
            { key: "source", label: "Source", value: (run) => sourceNames[run.source] ?? run.source },
            { key: "status", label: "Status", value: (run) => run.status, render: (run) => <Label variant={run.status === "success" ? "hijau" : run.status === "running" ? "biru" : "merah"}>{run.status}</Label> },
            { key: "rows", label: "Rows written", align: "right", value: (run) => run.rows_upserted, render: (run) => integer(run.rows_upserted) },
            { key: "window", label: "Data window", value: (run) => run.window_start, render: (run) => `${dateLabel(run.window_start)} – ${dateLabel(run.window_end)}` },
            { key: "started", label: "Started", value: (run) => run.started_at, render: (run) => timestampLabel(run.started_at) },
            { key: "duration", label: "Duration", align: "right", value: (run) => (run.finished_at ? new Date(run.finished_at).getTime() - new Date(run.started_at).getTime() : null), render: (run) => (run.finished_at ? `${Math.round((new Date(run.finished_at).getTime() - new Date(run.started_at).getTime()) / 1000)}s` : "—") },
            { key: "error", label: "Error", value: (run) => run.error, render: (run) => run.error ?? "—" },
          ]}
        />
      </section>
    </div>
  );
}
