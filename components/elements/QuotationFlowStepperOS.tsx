import type { QuotationStatus } from "@/apis/quotations";
import { Check, CornerDownLeft } from "lucide-react";

type StepState = "done" | "current" | "upcoming" | "skipped" | "returned";

const dotStyles: Record<StepState, string> = {
  done: "border-hijau bg-hijau text-white",
  current: "border-claude bg-card-bg text-claude ring-4 ring-claude/15",
  upcoming: "border-line bg-card-bg text-gray-400 dark:text-zinc-500",
  skipped: "border-dashed border-line bg-card-bg text-gray-400 dark:text-zinc-500",
  returned: "border-oranye bg-oranye text-white",
};

function states(status: QuotationStatus | null, requiresReview: boolean): StepState[] {
  if (status === "approved") return ["done", requiresReview ? "done" : "skipped", "done"];
  if (status === "manager_review") return ["done", "current", "upcoming"];
  if (status === "needs_revision") return ["returned", "upcoming", "upcoming"];
  return ["current", requiresReview ? "upcoming" : "skipped", "upcoming"];
}

// Draft -> manager review -> approved; review is skipped when the quotation qualifies for auto-approval.
export default function QuotationFlowStepperOS({ status, requiresReview }: { status: QuotationStatus | null; requiresReview: boolean }) {
  const stepStates = states(status, requiresReview);
  const steps = [
    { title: status === "needs_revision" ? "Perlu revisi" : "Draft", note: status === "needs_revision" ? "Dikembalikan manager" : "Susun penawaran" },
    { title: "Manager review", note: stepStates[1] === "skipped" ? "Dilewati, disetujui otomatis" : "Custom atau margin di bawah 45%" },
    { title: "Approved", note: "Langsung dikirim ke klien" },
  ];

  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Alur quotation">
      {steps.map((step, i) => {
        const state = stepStates[i];
        return (
          <li key={step.title} aria-current={state === "current" ? "step" : undefined} className="relative flex min-w-0 flex-col items-center gap-1.5 text-center">
            {i > 0 && (
              <span
                aria-hidden="true"
                className={`absolute top-3.5 -left-1/2 h-0.5 w-full ${stepStates[i - 1] === "done" && state !== "upcoming" ? "bg-hijau" : "bg-line"} ${state === "skipped" ? "opacity-50" : ""}`}
              />
            )}
            <span className={`relative flex size-7 items-center justify-center rounded-full border-2 text-xs font-semibold ${dotStyles[state]}`}>
              {state === "done" ? <Check size={14} aria-hidden="true" /> : state === "returned" ? <CornerDownLeft size={13} aria-hidden="true" /> : i + 1}
            </span>
            <span className={`text-xs font-semibold ${state === "upcoming" || state === "skipped" ? "text-gray-500 dark:text-zinc-400" : "text-gray-900 dark:text-zinc-100"}`}>
              {step.title}
            </span>
            <span className="text-[11px] leading-tight text-gray-500 dark:text-zinc-400">{step.note}</span>
          </li>
        );
      })}
    </ol>
  );
}
