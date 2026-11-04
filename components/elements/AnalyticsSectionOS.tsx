"use client";

import AppButton from "@/components/buttons/AppButton";
import AnalyticsDataTableOS, { toCsv, type AnalyticsColumn } from "@/components/elements/AnalyticsDataTableOS";
import InfoTooltipOS from "@/components/elements/InfoTooltipOS";
import { useAnalyticsView, type AnalyticsFilterKey } from "@/contexts/AnalyticsViewContext";
import { coverageWarnings, dateLabel, datasetInfo, sourceNames, timestampLabel, type DatasetKey } from "@/lib/analytics-warehouse";
import { BarChart3, Download, Info, Table2, TriangleAlert } from "lucide-react";
import { useState, type ReactNode } from "react";

const filterNames: Record<AnalyticsFilterKey, string> = { host: "Host", channel: "Channel", campaign: "Campaign" };

type SectionTable<T> = {
  columns: AnalyticsColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  filename: string;
};

// Every analytics section shares this frame: the question, the black how-to-read tooltip, its own view controls, and where the numbers came from.
export default function AnalyticsSectionOS<T>({
  title,
  question,
  info,
  datasets,
  ignores = [],
  takeaway,
  controls,
  table,
  emptyMessage,
  className,
  children,
}: {
  title: string;
  question?: string;
  info: string;
  datasets: DatasetKey[];
  ignores?: AnalyticsFilterKey[];
  takeaway?: ReactNode;
  controls?: ReactNode;
  table?: SectionTable<T>;
  emptyMessage?: string | null;
  className?: string;
  children: ReactNode;
}) {
  const { data, activeFilters } = useAnalyticsView();
  const [view, setView] = useState<"chart" | "table">("chart");
  const sources = [...new Set(datasets.map((dataset) => datasetInfo[dataset].source))];
  const freshness = sources.map((source) => data.freshness.find((entry) => entry.source === source));
  const lastSync = freshness.map((entry) => entry?.loaded_at).filter(Boolean).sort().at(-1);
  const warnings = coverageWarnings(data, datasets);
  const ignoredActive = ignores.filter((key) => activeFilters[key]).map((key) => filterNames[key]);
  const showTable = view === "table" && !!table;

  function exportCsv() {
    if (!table) return;
    const url = URL.createObjectURL(new Blob([`﻿${toCsv(table.columns, table.rows)}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${table.filename}-${data.period.start_date}-to-${data.period.end_date}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className={`flex min-w-0 flex-col rounded-xl border border-line bg-card-bg ${className ?? ""}`}>
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-5 pt-4">
        <div className="min-w-0 flex-1 basis-56">
          <div className="flex items-center gap-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{title}</h3>
            <InfoTooltipOS label={title} explanation={info} />
          </div>
          {question && <p className="text-xs text-gray-500 dark:text-zinc-400">{question}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!showTable && controls}
          {table && !emptyMessage && (
            <>
              <div className="flex rounded-lg border border-line p-0.5" role="group" aria-label={`${title} view`}>
                {(["chart", "table"] as const).map((entry) => (
                  <button
                    key={entry}
                    type="button"
                    aria-pressed={view === entry}
                    aria-label={`Show ${entry}`}
                    title={`Show ${entry}`}
                    onClick={() => setView(entry)}
                    className={`flex size-6 items-center justify-center rounded-md transition-colors ${view === entry ? "bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100" : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"}`}
                  >
                    {entry === "chart" ? <BarChart3 size={13} aria-hidden="true" /> : <Table2 size={13} aria-hidden="true" />}
                  </button>
                ))}
              </div>
              <AppButton type="button" variant="outline" size="iconSm" title="Download CSV" aria-label={`Download ${title} as CSV`} onClick={exportCsv}>
                <Download size={13} aria-hidden="true" />
              </AppButton>
            </>
          )}
        </div>
      </header>

      {takeaway && !emptyMessage && <p className="mx-5 mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:bg-zinc-800/60 dark:text-zinc-200">{takeaway}</p>}

      <div className="min-w-0 flex-1 px-5 py-4">
        {emptyMessage ? (
          <div className="flex min-h-36 flex-col items-center justify-center gap-2 text-center text-sm text-gray-500 dark:text-zinc-400">
            <Info size={18} aria-hidden="true" />
            <p className="max-w-sm">{emptyMessage}</p>
          </div>
        ) : showTable ? (
          <AnalyticsDataTableOS columns={table.columns} rows={table.rows} rowKey={table.rowKey} />
        ) : (
          children
        )}
      </div>

      <footer className="flex flex-col gap-1 border-t border-line-soft px-5 py-2 text-xs text-gray-500 dark:text-zinc-400">
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {sources.map((source, index) => (
            <span key={source}>
              {sourceNames[source] ?? source} through <span className="font-medium text-gray-700 dark:text-zinc-300">{dateLabel(freshness[index]?.last_date)}</span>
            </span>
          ))}
          <span>Last sync <span className="font-medium text-gray-700 dark:text-zinc-300">{timestampLabel(lastSync)}</span></span>
          {ignoredActive.length > 0 && <span>{ignoredActive.join(" and ")} filter not applied here</span>}
        </div>
        {warnings.map((warning) => (
          <p key={warning} className="flex items-start gap-1.5" style={{ color: "var(--label-kuning)" }}>
            <TriangleAlert size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{warning}</span>
          </p>
        ))}
      </footer>
    </section>
  );
}
