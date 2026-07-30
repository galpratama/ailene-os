"use client";

import AppButton from "@/components/buttons/AppButton";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import type { B2BLostReasonEnum } from "@prisma/client";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export type StageReasonPromptTarget = {
  leadName: string;
  stage: "CLOSED_LOST" | "ON_HOLD";
};

const reasonOptions: AppSelectOption[] = [
  { value: "BUDGET_TOO_HIGH", label: "Budget Too High" },
  { value: "TIMING_NOT_RIGHT", label: "Timing Not Right" },
  { value: "LOST_TO_COMPETITOR", label: "Lost to Competitor" },
  { value: "NO_RESPONSE", label: "No Response" },
  { value: "NOT_A_FIT", label: "Not a Fit" },
  { value: "INTERNAL_PRIORITY_SHIFT", label: "Internal Priority Shift" },
  { value: "OTHER", label: "Other" },
];

const stageCopy: Record<
  StageReasonPromptTarget["stage"],
  { title: string; description: string }
> = {
  CLOSED_LOST: {
    title: "Why was this lead lost?",
    description:
      "Pick a reason so this shows up in the lost-reason breakdown on the dashboard.",
  },
  ON_HOLD: {
    title: "Why is this lead on hold?",
    description:
      "Pick a reason so the team knows what's blocking it before it goes stale.",
  },
};

export default function StageReasonPromptOS({
  target,
  onConfirm,
  onSkip,
  onCancel,
}: {
  target: StageReasonPromptTarget | null;
  onConfirm: (reasonCode: B2BLostReasonEnum) => void;
  onSkip: () => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState<B2BLostReasonEnum | null>(null);

  // Reset on a *new* prompt via render-time state adjustment (like EditLeadFormOS) — an effect would false-positive on every parent re-render's fresh object literal.
  const targetKey = target ? `${target.leadName}-${target.stage}` : null;
  const [seededKey, setSeededKey] = useState<string | null>(null);
  if (targetKey !== seededKey) {
    setSeededKey(targetKey);
    if (targetKey) setReason(null);
  }

  useEffect(() => {
    if (!target) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [target]);

  if (!target) return null;
  const copy = stageCopy[target.stage];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-gray-300 bg-card-bg shadow-xl dark:border-zinc-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 dark:border-zinc-800">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-claude">
              {target.leadName}
            </p>
            <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100">
              {copy.title}
            </h2>
          </div>
          <AppButton
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={onCancel}
            aria-label="Cancel"
          >
            <X size={16} />
          </AppButton>
        </div>

        <div className="flex flex-col gap-4 px-5 py-5">
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {copy.description}
          </p>
          <AppSelect
            selectId="stage-reason-prompt"
            placeholder="Pick a reason"
            value={reason}
            onChange={(value) => setReason(value as B2BLostReasonEnum)}
            options={reasonOptions}
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4 dark:border-zinc-800">
          <AppButton type="button" variant="outline" size="sm" onClick={onSkip}>
            Skip
          </AppButton>
          <AppButton
            type="button"
            variant="primary"
            size="sm"
            disabled={!reason}
            onClick={() => reason && onConfirm(reason)}
          >
            Save reason
          </AppButton>
        </div>
      </div>
    </div>
  );
}
