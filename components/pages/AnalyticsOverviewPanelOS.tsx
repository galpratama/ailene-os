import type { WarehouseAnalytics } from "@/apis/analytics";
import AnalyticsTrendChartOS from "@/components/charts/AnalyticsTrendChartOS";
import AnalyticsStatCardOS from "@/components/items/AnalyticsStatCardOS";
import { getShortRupiahCurrency } from "@/lib/currency";
import { Activity, BadgeDollarSign, MousePointerClick, Target, Users, WalletCards } from "lucide-react";

function integer(value: number) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value);
}

function rate(value: number | null) {
  return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
}

export default function AnalyticsOverviewPanelOS({ data }: { data: WarehouseAnalytics }) {
  const current = data.summary.current;
  const changes = data.summary.changes;
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <AnalyticsStatCardOS label="Spend" value={getShortRupiahCurrency(current.spend_idr)} change={changes.spend_idr} icon={WalletCards} />
        <AnalyticsStatCardOS label="Total leads" value={integer(current.total_leads)} change={changes.total_leads} icon={Target} />
        <AnalyticsStatCardOS label="CPL" value={current.cpl_idr === null ? "—" : getShortRupiahCurrency(current.cpl_idr)} change={changes.cpl_idr} icon={BadgeDollarSign} hint={current.total_leads < 5 ? "Hidden until at least 5 leads" : undefined} />
        <AnalyticsStatCardOS label="Sessions" value={integer(current.sessions)} change={changes.sessions} icon={Users} />
        <AnalyticsStatCardOS label="Engaged rate" value={rate(current.engaged_rate)} change={changes.engaged_rate} icon={Activity} />
        <AnalyticsStatCardOS label="Lead conversion" value={rate(current.conversion_rate)} change={changes.conversion_rate} icon={MousePointerClick} />
      </div>

      <AnalyticsTrendChartOS
        data={data.daily}
        title="Daily marketing pulse"
        description="Spend, leads, and sessions for the selected period."
        metrics={[
          { key: "spend_idr", label: "Spend", format: getShortRupiahCurrency },
          { key: "total_leads", label: "Leads", format: integer },
          { key: "sessions", label: "Sessions", format: integer },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-xl border border-line bg-card-bg p-5">
          <h3 className="font-bold text-gray-900 dark:text-zinc-100">End-to-end funnel</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">From ad delivery to a lead, using one warehouse definition.</p>
          <div className="mt-4 flex flex-col gap-2">
            {data.funnel.map((step, index) => (
              <div key={step.key} className="flex items-center justify-between rounded-lg border border-line-soft px-3 py-2.5">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{step.label}</p>
                  {index > 0 && <p className="text-xs text-gray-400">{rate(step.from_previous_rate)} from previous stage</p>}
                </div>
                <p className="font-heading text-lg font-bold tabular-nums text-gray-900 dark:text-zinc-100">{integer(step.value)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-line bg-card-bg">
          <div className="px-5 py-4">
            <h3 className="font-bold text-gray-900 dark:text-zinc-100">Channel mix</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Sessions, leads, and spend by channel.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-150 text-sm tabular-nums">
              <thead><tr className="border-y border-line-soft text-left text-xs uppercase tracking-wider text-gray-400"><th className="px-5 py-3">Channel</th><th className="px-5 py-3">Sessions</th><th className="px-5 py-3">Leads</th><th className="px-5 py-3">Conv.</th><th className="px-5 py-3">Spend</th></tr></thead>
              <tbody>{data.channels.map((row) => <tr key={row.channel} className="border-b border-line-soft last:border-0"><td className="px-5 py-3 font-semibold text-gray-900 dark:text-zinc-100">{row.channel}</td><td className="px-5 py-3">{integer(row.sessions)}</td><td className="px-5 py-3">{integer(row.total_leads)}</td><td className="px-5 py-3">{rate(row.conversion_rate)}</td><td className="px-5 py-3">{getShortRupiahCurrency(row.spend_idr)}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
