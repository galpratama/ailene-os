import type { WarehouseAnalytics } from "@/apis/analytics";
import Label from "@/components/labels/Label";

function number(value: number) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(value);
}

function rate(value: number | null) {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}

export default function AnalyticsTrafficPanelOS({ data }: { data: WarehouseAnalytics }) {
  return (
    <div className="flex flex-col gap-5">
      {data.utm_issues.length > 0 && <section className="rounded-xl border border-kuning/50 bg-kuning-t p-4"><h3 className="font-bold text-gray-900">UTM hygiene</h3><div className="mt-2 flex flex-wrap gap-2">{data.utm_issues.map((issue) => <Label key={issue.issue} variant="kuning">{issue.issue}: {number(issue.sessions)} sessions</Label>)}</div></section>}
      <section className="overflow-hidden rounded-xl border border-line bg-card-bg">
        <div className="px-5 py-4"><h3 className="font-bold text-gray-900 dark:text-zinc-100">Source / medium / campaign</h3><p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Acquisition quality from the marketing-site GA4 property.</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-230 text-sm tabular-nums"><thead><tr className="border-y border-line-soft text-left text-xs uppercase tracking-wider text-gray-400"><th className="px-5 py-3">Channel</th><th className="px-5 py-3">Source / medium</th><th className="px-5 py-3">Campaign</th><th className="px-5 py-3">Sessions</th><th className="px-5 py-3">Users</th><th className="px-5 py-3">Engaged</th><th className="px-5 py-3">Leads</th></tr></thead><tbody>{data.traffic_sources.map((row, index) => <tr key={`${row.channel}-${row.source}-${row.medium}-${row.campaign}-${index}`} className="border-b border-line-soft last:border-0"><td className="px-5 py-3 font-semibold text-gray-900 dark:text-zinc-100">{row.channel}</td><td className="px-5 py-3">{row.source} / {row.medium}</td><td className="max-w-70 truncate px-5 py-3" title={row.campaign}>{row.campaign}</td><td className="px-5 py-3">{number(row.sessions)}</td><td className="px-5 py-3">{number(row.users)}</td><td className="px-5 py-3">{rate(row.engaged_rate)}</td><td className="px-5 py-3">{number(row.leads)}</td></tr>)}</tbody></table></div>
      </section>
      <section className="overflow-hidden rounded-xl border border-line bg-card-bg">
        <div className="px-5 py-4"><h3 className="font-bold text-gray-900 dark:text-zinc-100">Audience</h3><p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Device, region, and new-versus-returning segments.</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-170 text-sm tabular-nums"><thead><tr className="border-y border-line-soft text-left text-xs uppercase tracking-wider text-gray-400"><th className="px-5 py-3">Device</th><th className="px-5 py-3">Region</th><th className="px-5 py-3">Visitor</th><th className="px-5 py-3">Sessions</th><th className="px-5 py-3">Engaged</th><th className="px-5 py-3">Key events</th></tr></thead><tbody>{data.web_audience.map((row, index) => <tr key={`${row.device}-${row.region}-${row.new_vs_returning}-${index}`} className="border-b border-line-soft last:border-0"><td className="px-5 py-3 font-semibold">{row.device}</td><td className="px-5 py-3">{row.region}</td><td className="px-5 py-3">{row.new_vs_returning}</td><td className="px-5 py-3">{number(row.sessions)}</td><td className="px-5 py-3">{rate(row.engaged_rate)}</td><td className="px-5 py-3">{number(row.key_events)}</td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
