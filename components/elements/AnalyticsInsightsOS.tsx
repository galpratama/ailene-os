import InfoTooltipOS from "@/components/elements/InfoTooltipOS";
import type { Insight } from "@/lib/analytics-warehouse";
import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from "lucide-react";

const tones: Record<Insight["tone"], { icon: LucideIcon; color: string; label: string }> = {
  good: { icon: CircleCheck, color: "var(--label-hijau)", label: "Good" },
  warn: { icon: TriangleAlert, color: "var(--label-kuning)", label: "Watch" },
  bad: { icon: CircleAlert, color: "var(--label-merah)", label: "Act" },
  info: { icon: Info, color: "var(--label-biru)", label: "Note" },
};

// The plain-language read of the current filters, so the first thing on the page is what the numbers mean.
export default function AnalyticsInsightsOS({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null;
  return (
    <section className="rounded-xl border border-line bg-card-bg p-4" aria-label="Key takeaways">
      <div className="mb-3 flex items-center gap-1">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">What the data says</h3>
        <InfoTooltipOS label="What the data says" explanation="Written automatically from the numbers on this page, for the filters above. Each line is a fact to check or act on, not a forecast." />
      </div>
      <ul className="grid gap-3 md:grid-cols-2 xl:grid-flow-col xl:auto-cols-fr">
        {insights.map((insight) => {
          const tone = tones[insight.tone];
          const Icon = tone.icon;
          return (
            <li key={insight.title} className="flex min-w-0 gap-2.5">
              <Icon size={16} className="mt-0.5 shrink-0" style={{ color: tone.color }} aria-label={tone.label} />
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug text-gray-900 dark:text-zinc-100">{insight.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-zinc-400">{insight.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
