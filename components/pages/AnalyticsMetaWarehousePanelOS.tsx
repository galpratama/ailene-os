import type { WarehouseAnalytics } from "@/apis/analytics";
import Label from "@/components/labels/Label";
import { getShortRupiahCurrency } from "@/lib/currency";
import Image from "next/image";

function number(value: number) {
  return new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function rate(value: number | null) {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}

export default function AnalyticsMetaWarehousePanelOS({ data }: { data: WarehouseAnalytics }) {
  return (
    <div className="flex flex-col gap-5">
      <section className="overflow-hidden rounded-xl border border-line bg-card-bg">
        <div className="px-5 py-4">
          <h3 className="font-bold text-gray-900 dark:text-zinc-100">Creative performance</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Creative, delivery, landing, and CPL metrics joined in the warehouse.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-350 text-sm tabular-nums">
            <thead><tr className="border-y border-line-soft text-left text-xs uppercase tracking-wider text-gray-400"><th className="px-5 py-3">Ad</th><th className="px-5 py-3">Spend</th><th className="px-5 py-3">Impr.</th><th className="px-5 py-3">Link CTR</th><th className="px-5 py-3">Hook</th><th className="px-5 py-3">Hold</th><th className="px-5 py-3">Landing</th><th className="px-5 py-3">Web engaged</th><th className="px-5 py-3">Leads</th><th className="px-5 py-3">CPL</th><th className="px-5 py-3">Ranking</th></tr></thead>
            <tbody>{data.ads.map((ad) => <tr key={ad.id} className="border-b border-line-soft last:border-0 align-top"><td className="px-5 py-3"><div className="flex min-w-70 gap-3">{ad.thumbnail_url ? <Image src={ad.thumbnail_url} alt="" width={44} height={44} unoptimized className="size-11 rounded-lg border border-line-soft object-cover" /> : <div className="size-11 rounded-lg border border-line-soft bg-gray-50 dark:bg-zinc-900" />}<div className="min-w-0"><p className="truncate font-semibold text-gray-900 dark:text-zinc-100">{ad.name}</p><p className="truncate text-xs text-gray-400">{ad.campaign} · {ad.adset}</p><div className="mt-1 flex gap-1">{ad.low_n_leads && <Label variant="kuning">low-n leads</Label>}{ad.low_n_clicks && <Label variant="gray">low-n clicks</Label>}</div></div></div></td><td className="px-5 py-3">{getShortRupiahCurrency(ad.spend_idr)}</td><td className="px-5 py-3">{number(ad.impressions)}</td><td className="px-5 py-3">{rate(ad.link_ctr)}</td><td className="px-5 py-3">{rate(ad.hook_rate)}</td><td className="px-5 py-3">{rate(ad.hold_rate)}</td><td className="px-5 py-3">{rate(ad.landing_rate)}</td><td className="px-5 py-3">{rate(ad.web_engaged_rate)}</td><td className="px-5 py-3">{number(ad.total_leads)}</td><td className="px-5 py-3 font-semibold">{ad.cpl_idr === null ? "—" : getShortRupiahCurrency(ad.cpl_idr)}</td><td className="px-5 py-3 text-xs text-gray-500 dark:text-zinc-400">{ad.quality_ranking ?? "—"}<br />{ad.engagement_ranking ?? "—"}<br />{ad.conversion_ranking ?? "—"}</td></tr>)}</tbody>
          </table>
          {data.ads.length === 0 && <p className="py-10 text-center text-sm text-gray-400">No Meta Ads data for this filter.</p>}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-line bg-card-bg">
        <div className="px-5 py-4"><h3 className="font-bold text-gray-900 dark:text-zinc-100">Audience breakdown</h3><p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Age/gender, region, placement, device, and hour segments.</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-190 text-sm tabular-nums"><thead><tr className="border-y border-line-soft text-left text-xs uppercase tracking-wider text-gray-400"><th className="px-5 py-3">Dimension</th><th className="px-5 py-3">Segment</th><th className="px-5 py-3">Spend</th><th className="px-5 py-3">Impressions</th><th className="px-5 py-3">Clicks</th><th className="px-5 py-3">Leads</th><th className="px-5 py-3">CPL</th></tr></thead><tbody>{data.meta_audience.map((row, index) => <tr key={`${row.breakdown}-${row.segment_1}-${row.segment_2}-${index}`} className="border-b border-line-soft last:border-0"><td className="px-5 py-3 font-semibold">{row.breakdown.replaceAll("_", " ")}</td><td className="px-5 py-3">{row.segment_1}{row.segment_2 ? ` · ${row.segment_2}` : ""}</td><td className="px-5 py-3">{getShortRupiahCurrency(row.spend_idr)}</td><td className="px-5 py-3">{number(row.impressions)}</td><td className="px-5 py-3">{number(row.link_clicks)}</td><td className="px-5 py-3">{number(row.leads)}</td><td className="px-5 py-3">{row.cpl_idr === null ? "—" : getShortRupiahCurrency(row.cpl_idr)}</td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
