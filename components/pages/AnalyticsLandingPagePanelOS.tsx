import type { WarehouseAnalytics } from "@/apis/analytics";

function number(value: number) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(value);
}

function rate(value: number | null) {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}

export default function AnalyticsLandingPagePanelOS({ data }: { data: WarehouseAnalytics }) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-card-bg">
      <div className="px-5 py-4">
        <h3 className="font-bold text-gray-900 dark:text-zinc-100">Landing page performance</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Traffic quality, conversion, paid share, and organic search signals per page.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-280 text-sm tabular-nums">
          <thead><tr className="border-y border-line-soft text-left text-xs uppercase tracking-wider text-gray-400"><th className="px-5 py-3">Landing page</th><th className="px-5 py-3">Sessions</th><th className="px-5 py-3">Users</th><th className="px-5 py-3">Engaged</th><th className="px-5 py-3">Avg. engagement</th><th className="px-5 py-3">Key events</th><th className="px-5 py-3">Conversion</th><th className="px-5 py-3">Paid share</th><th className="px-5 py-3">SEO clicks</th><th className="px-5 py-3">SEO position</th></tr></thead>
          <tbody>{data.landing_pages.map((row) => <tr key={row.landing_page} className="border-b border-line-soft last:border-0"><td className="max-w-80 truncate px-5 py-3 font-semibold text-gray-900 dark:text-zinc-100" title={row.landing_page}>{row.landing_page}</td><td className="px-5 py-3">{number(row.sessions)}</td><td className="px-5 py-3">{number(row.users)}</td><td className="px-5 py-3">{rate(row.engaged_rate)}</td><td className="px-5 py-3">{row.average_engagement_seconds === null ? "—" : `${number(row.average_engagement_seconds)}s`}</td><td className="px-5 py-3">{number(row.key_events)}</td><td className="px-5 py-3">{rate(row.conversion_rate)}</td><td className="px-5 py-3">{rate(row.paid_share)}</td><td className="px-5 py-3">{number(row.seo_clicks)}</td><td className="px-5 py-3">{row.seo_average_position === null ? "—" : number(row.seo_average_position)}</td></tr>)}</tbody>
        </table>
        {data.landing_pages.length === 0 && <p className="py-10 text-center text-sm text-gray-400">No landing-page data for this filter.</p>}
      </div>
    </section>
  );
}
