import InfoTooltipOS from "@/components/elements/InfoTooltipOS";

export type StripStat = { label: string; value: string; info: string; caption?: string };

// A compact row of period totals for views whose API has no prior-period comparison to show.
export default function AnalyticsStatStripOS({ stats }: { stats: StripStat[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line-soft sm:grid-cols-3 xl:grid-flow-col xl:auto-cols-fr xl:grid-cols-none">
      {stats.map((stat) => (
        <div key={stat.label} className="min-w-0 bg-card-bg px-4 py-3">
          <div className="flex items-center gap-1">
            <p className="truncate text-xs font-medium text-gray-600 dark:text-zinc-300">{stat.label}</p>
            <InfoTooltipOS label={stat.label} explanation={stat.info} />
          </div>
          <p className="truncate font-heading text-xl font-semibold text-gray-900 dark:text-zinc-100">{stat.value}</p>
          {stat.caption && <p className="truncate text-xs text-gray-500 dark:text-zinc-400">{stat.caption}</p>}
        </div>
      ))}
    </div>
  );
}
