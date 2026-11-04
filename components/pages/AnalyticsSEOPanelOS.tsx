import type { WarehouseAnalytics } from "@/apis/analytics";
import AnalyticsTrendChartOS from "@/components/charts/AnalyticsTrendChartOS";
import Label from "@/components/labels/Label";

function number(value: number) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(value);
}

function rate(value: number | null) {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}

export default function AnalyticsSEOPanelOS({ data }: { data: WarehouseAnalytics }) {
  return (
    <div className="flex flex-col gap-5">
      <AnalyticsTrendChartOS data={data.seo_daily.map((row) => ({ ...row, ctr: row.ctr ?? 0, average_position: row.average_position ?? 0 }))} title="Organic search trend" description="Search Console clicks and impressions for the marketing site." metrics={[{ key: "clicks", label: "Clicks", format: number }, { key: "impressions", label: "Impressions", format: number }, { key: "average_position", label: "Avg. position", format: number }]} />
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="overflow-hidden rounded-xl border border-line bg-card-bg">
          <div className="px-5 py-4"><h3 className="font-bold text-gray-900 dark:text-zinc-100">Quick-win queries</h3><p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Queries in positions 8–20, ordered by impressions.</p></div>
          <div className="overflow-x-auto"><table className="w-full min-w-160 text-sm tabular-nums"><thead><tr className="border-y border-line-soft text-left text-xs uppercase tracking-wider text-gray-400"><th className="px-5 py-3">Query</th><th className="px-5 py-3">Clicks</th><th className="px-5 py-3">Impr.</th><th className="px-5 py-3">CTR</th><th className="px-5 py-3">Position</th></tr></thead><tbody>{data.seo_queries.map((row) => <tr key={row.query} className="border-b border-line-soft last:border-0"><td className="px-5 py-3"><div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-zinc-100">{row.query}{row.branded && <Label variant="gray">branded</Label>}</div></td><td className="px-5 py-3">{number(row.clicks)}</td><td className="px-5 py-3">{number(row.impressions)}</td><td className="px-5 py-3">{rate(row.ctr)}</td><td className="px-5 py-3">{row.average_position === null ? "—" : number(row.average_position)}</td></tr>)}</tbody></table></div>
        </section>
        <section className="overflow-hidden rounded-xl border border-line bg-card-bg">
          <div className="px-5 py-4"><h3 className="font-bold text-gray-900 dark:text-zinc-100">Pages</h3><p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Organic performance by indexed URL.</p></div>
          <div className="overflow-x-auto"><table className="w-full min-w-160 text-sm tabular-nums"><thead><tr className="border-y border-line-soft text-left text-xs uppercase tracking-wider text-gray-400"><th className="px-5 py-3">Page</th><th className="px-5 py-3">Clicks</th><th className="px-5 py-3">Impr.</th><th className="px-5 py-3">CTR</th><th className="px-5 py-3">Position</th></tr></thead><tbody>{data.seo_pages.map((row) => <tr key={row.page} className="border-b border-line-soft last:border-0"><td className="max-w-80 truncate px-5 py-3 font-semibold text-gray-900 dark:text-zinc-100" title={row.page}>{row.page}</td><td className="px-5 py-3">{number(row.clicks)}</td><td className="px-5 py-3">{number(row.impressions)}</td><td className="px-5 py-3">{rate(row.ctr)}</td><td className="px-5 py-3">{row.average_position === null ? "—" : number(row.average_position)}</td></tr>)}</tbody></table></div>
        </section>
      </div>
    </div>
  );
}
