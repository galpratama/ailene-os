import ChartHoverOS from "@/components/elements/ChartHoverOS";
import { count, percent } from "@/lib/revenue";

export type StepBar = { key: string; label: string; current: number; previous: number; rate: number | null };

// Thick bar for this period, thin bar for the one before; the step with the lowest conversion is red.
export default function RevenueStepBarsOS({ steps, previousLabel }: { steps: StepBar[]; previousLabel: string }) {
  const top = Math.max(...steps.flatMap((step) => [step.current, step.previous]), 0);
  const rated = steps.filter((step) => step.rate !== null);
  const weakest = rated.length ? rated.reduce((low, step) => ((step.rate ?? 1) < (low.rate ?? 1) ? step : low)).key : null;
  const width = (value: number) => `${top > 0 ? Math.max((value / top) * 100, value > 0 ? 1 : 0) : 0}%`;

  return (
    <ul className="flex flex-col gap-3">
      {steps.map((step) => {
        const diff = step.current - step.previous;
        const isWeakest = step.key === weakest;
        return (
          <li key={step.key}>
            <ChartHoverOS
              label={`${step.label}: ${step.current} this period, ${step.previous} before${step.rate !== null ? `, ${percent(step.rate)} of the step before` : ""}${isWeakest ? ", the lowest" : ""}`}
              title={step.label}
              rows={[
                { label: "this period", value: count(step.current), color: "var(--viz-4)" },
                { label: previousLabel, value: count(step.previous), color: "var(--viz-other)" },
                ...(step.rate !== null ? [{ label: "of the step before", value: percent(step.rate) }] : []),
              ]}
              className="grid grid-cols-[minmax(7rem,10rem)_1fr_auto] items-center gap-3 rounded-sm"
            >
              <span className="truncate text-xs text-gray-700 dark:text-zinc-300">{step.label}</span>
              <span className="flex flex-col gap-1">
                <span className="h-2.5 rounded-r-full" style={{ width: width(step.current), backgroundColor: isWeakest ? "var(--merah)" : "var(--viz-4)" }} />
                <span className="h-1 rounded-r-full bg-gray-300 dark:bg-zinc-600" style={{ width: width(step.previous) }} />
              </span>
              <span className="text-right text-xs tabular-nums text-gray-600 dark:text-zinc-300">
                <span className="font-semibold text-gray-900 dark:text-zinc-100">{count(step.current)}</span>
                {step.rate !== null && <span className={isWeakest ? "font-semibold text-merah" : ""}> · {percent(step.rate)}{isWeakest ? " lowest" : ""}</span>}
                <span> · {diff >= 0 ? "+" : "−"}{Math.abs(diff)}</span>
              </span>
            </ChartHoverOS>
          </li>
        );
      })}
    </ul>
  );
}
