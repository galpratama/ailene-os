import type { WarehouseAnalytics } from "@/apis/analytics";
import AnalyticsFreshnessOS from "@/components/labels/AnalyticsFreshnessOS";
import Label from "@/components/labels/Label";

function timestamp(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", dateStyle: "medium", timeStyle: "short" });
}

export default function AnalyticsHealthPanelOS({ data }: { data: WarehouseAnalytics }) {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-line bg-card-bg p-5"><h3 className="font-bold text-gray-900 dark:text-zinc-100">Source freshness</h3><p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">The last business date currently available from each source.</p><div className="mt-4"><AnalyticsFreshnessOS freshness={data.freshness} /></div></section>
      <section className="overflow-hidden rounded-xl border border-line bg-card-bg">
        <div className="px-5 py-4"><h3 className="font-bold text-gray-900 dark:text-zinc-100">Pipeline runs</h3><p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Latest ingestion activity and row counts.</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-200 text-sm tabular-nums"><thead><tr className="border-y border-line-soft text-left text-xs uppercase tracking-wider text-gray-400"><th className="px-5 py-3">Source</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Rows</th><th className="px-5 py-3">Started</th><th className="px-5 py-3">Finished</th><th className="px-5 py-3">Error</th></tr></thead><tbody>{data.pipeline_runs.map((run) => <tr key={run.run_id} className="border-b border-line-soft last:border-0"><td className="px-5 py-3 font-semibold text-gray-900 dark:text-zinc-100">{run.source}</td><td className="px-5 py-3"><Label variant={run.status === "success" ? "hijau" : run.status === "running" ? "biru" : "merah"}>{run.status}</Label></td><td className="px-5 py-3">{run.rows_upserted}</td><td className="px-5 py-3">{timestamp(run.started_at)}</td><td className="px-5 py-3">{timestamp(run.finished_at)}</td><td className="max-w-90 truncate px-5 py-3 text-gray-500" title={run.error ?? undefined}>{run.error ?? "—"}</td></tr>)}</tbody></table></div>
      </section>
      <section className="rounded-xl border border-line bg-card-bg p-5"><h3 className="font-bold text-gray-900 dark:text-zinc-100">Known data gaps</h3><p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">These metrics are intentionally unavailable until their source grain exists.</p><ul className="mt-4 flex flex-col gap-2">{data.data_gaps.map((gap) => <li key={gap.code} className="rounded-lg border border-line-soft px-3 py-2.5"><p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{gap.code.replaceAll("_", " ")}</p><p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">{gap.message}</p></li>)}</ul></section>
    </div>
  );
}
