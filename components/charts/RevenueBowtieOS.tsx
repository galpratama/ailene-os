import ChartHoverOS from "@/components/elements/ChartHoverOS";
import PendingLabelOS from "@/components/labels/PendingLabelOS";
import { count, percent } from "@/lib/revenue";

export type BowtieStep = {
  key: string;
  label: string;
  value: number | null;
  rate?: number | null;
  definition: string;
  pending?: boolean;
};

const KNOT_HEIGHT = 34;

// Height (%) at each block boundary: it narrows toward the knot block, then widens again after it.
function boundaryHeight(boundary: number, knot: number, blocks: number) {
  if (boundary <= knot) return 100 - (boundary / Math.max(knot, 1)) * (100 - KNOT_HEIGHT);
  const rise = blocks - (knot + 1);
  return KNOT_HEIGHT + ((boundary - (knot + 1)) / Math.max(rise, 1)) * (100 - KNOT_HEIGHT);
}

function stepText(step: BowtieStep, weakest: string | null) {
  if (step.pending) return "backend not ready";
  const rate = step.rate === undefined || step.rate === null ? "" : `, ${percent(step.rate)} of the step before${weakest === step.key ? " (lowest)" : ""}`;
  return `${count(step.value)}${rate}`;
}

// Left: the period's lead-to-won funnel with step conversion under it. Right: life after the sale, which has no data source yet.
export default function RevenueBowtieOS({ left, right, weakest }: { left: BowtieStep[]; right: BowtieStep[]; weakest: string | null }) {
  const steps = [...left, ...right];
  const knot = left.length - 1;
  return (
    <div>
      <div className="hidden md:block">
        <div className="grid gap-x-0.5 gap-y-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {steps.map((step) => (
            <p key={`label-${step.key}`} className="truncate px-1 text-center text-xs font-medium text-gray-600 dark:text-zinc-300" title={step.label}>{step.label}</p>
          ))}
          {steps.map((step, index) => {
            const isKnot = index === knot;
            const start = isKnot ? KNOT_HEIGHT : boundaryHeight(index, knot, steps.length);
            const end = isKnot ? KNOT_HEIGHT : boundaryHeight(index + 1, knot, steps.length);
            const inset = (height: number) => (100 - height) / 2;
            const clipPath = `polygon(0% ${inset(start)}%, 100% ${inset(end)}%, 100% ${100 - inset(end)}%, 0% ${100 - inset(start)}%)`;
            const backgroundColor = step.pending ? "var(--line-soft)" : isKnot ? "var(--ink)" : `color-mix(in oklab, var(--viz-4) ${100 - index * 11}%, var(--card-bg))`;
            return (
              <ChartHoverOS
                key={`block-${step.key}`}
                label={`${step.label}: ${stepText(step, weakest)}`}
                title={step.label}
                rows={[{ label: step.pending ? "not available yet" : "in this period", value: step.pending ? "—" : count(step.value) }]}
                note={step.definition}
                className="h-28"
              >
                <div
                  className={`flex h-full items-center justify-center font-heading text-xl font-semibold tabular-nums ${step.pending ? "text-gray-400 dark:text-zinc-500" : "text-white"}`}
                  style={{ clipPath, backgroundColor }}
                >
                  {step.pending ? "—" : count(step.value)}
                </div>
              </ChartHoverOS>
            );
          })}
          {steps.map((step) => (
            <p key={`rate-${step.key}`} className={`text-center text-xs tabular-nums ${weakest === step.key ? "font-semibold text-merah" : "text-gray-500 dark:text-zinc-400"}`}>
              {step.rate === undefined ? "" : percent(step.rate)}
              {weakest === step.key && <span className="block text-[0.6875rem] font-medium">lowest</span>}
            </p>
          ))}
        </div>
      </div>

      <ol aria-label="Customer lifecycle" className="flex flex-col divide-y divide-line-soft md:hidden">
        {steps.map((step, index) => (
          <li key={step.key} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className={`size-2 rounded-full ${index <= knot ? "bg-biru" : "bg-line"}`} />
              {step.label}
            </span>
            {step.pending ? (
              <PendingLabelOS />
            ) : (
              <span className="tabular-nums">
                <strong className="font-semibold text-gray-900 dark:text-zinc-100">{count(step.value)}</strong>
                {step.rate !== undefined && (
                  <span className={weakest === step.key ? "font-semibold text-merah" : "text-gray-500 dark:text-zinc-400"}>
                    {" "}· {percent(step.rate)}
                    {weakest === step.key ? " lowest" : ""}
                  </span>
                )}
              </span>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-zinc-400">
        <span>This period: lead → won, conversion from the step before underneath (lowest in red)</span>
        <span className="flex items-center gap-2">
          After the sale: onboarded → referred <PendingLabelOS />
        </span>
      </div>
    </div>
  );
}
