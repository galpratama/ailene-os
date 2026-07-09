"use client";

import AppButton from "@/components/buttons/AppButton";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import { trpc } from "@/trpc/client";
import type {
  TrainerCertificationStatusEnum,
  TrainerCertificationStepEnum,
} from "@prisma/client";
import { Minus, Plus } from "lucide-react";

const statusOptions: AppSelectOption[] = [
  { value: "NOT_STARTED", label: "Not started" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "PASSED", label: "Passed" },
  { value: "FAILED", label: "Failed" },
];
const labels: Record<TrainerCertificationStepEnum, string> = {
  ORIENTATION: "Orientation",
  MATERIAL_MASTERY: "Material mastery",
  SHADOWING: "Shadowing",
  CO_TRAINING: "Co-training",
  SOLO_OBSERVED_DELIVERY: "Solo observed delivery",
  CERTIFICATION_DECISION: "Certification decision",
};

export default function TrainerCertificationFormOS({
  trainerId,
  steps,
}: {
  trainerId: string;
  steps: {
    step: TrainerCertificationStepEnum;
    status: TrainerCertificationStatusEnum;
    sessions_required: number;
    sessions_completed: number;
  }[];
}) {
  const utils = trpc.useUtils();
  const mutation = trpc.update.trainerPool.certificationStep.useMutation({
    onSuccess: () => {
      utils.read.trainerPool.trainer.invalidate({ id: trainerId });
      utils.list.trainerPool.trainers.invalidate();
    },
  });

  function update(
    entry: (typeof steps)[number],
    patch: {
      status?: TrainerCertificationStatusEnum;
      sessions_completed?: number;
    }
  ) {
    mutation.mutate({
      trainer_id: trainerId,
      step: entry.step,
      status: patch.status ?? entry.status,
      sessions_required: entry.sessions_required,
      sessions_completed:
        patch.sessions_completed ?? entry.sessions_completed,
    });
  }

  return (
    <section className="rounded-xl border border-gray-300 bg-card-bg p-5">
      <h3 className="font-bold text-gray-900 dark:text-zinc-100">
        Certification pathway
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Passing the final decision promotes the trainer into the certified pool.
      </p>
      {mutation.error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {mutation.error.message}
        </p>
      )}
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {steps.map((entry, index) => (
          <div
            key={entry.step}
            className="rounded-xl border border-gray-200 p-4 dark:border-zinc-800"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-claude/10 text-xs font-bold text-claude">
                {index + 1}
              </span>
              <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                {labels[entry.step]}
              </p>
            </div>
            <AppSelect
              selectId={`certification-${entry.step}`}
              placeholder="Status"
              value={entry.status}
              options={statusOptions}
              onChange={(value) =>
                update(entry, {
                  status: value as TrainerCertificationStatusEnum,
                })
              }
            />
            {(entry.step === "SHADOWING" ||
              entry.step === "CO_TRAINING") && (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-zinc-800">
                <span className="text-xs text-gray-500">Sessions</span>
                <div className="flex items-center gap-2">
                  <AppButton
                    type="button"
                    variant="outline"
                    size="iconSm"
                    disabled={entry.sessions_completed <= 0}
                    onClick={() =>
                      update(entry, {
                        sessions_completed: entry.sessions_completed - 1,
                      })
                    }
                  >
                    <Minus size={12} />
                  </AppButton>
                  <span className="min-w-9 text-center text-xs font-bold">
                    {entry.sessions_completed}/{entry.sessions_required}
                  </span>
                  <AppButton
                    type="button"
                    variant="outline"
                    size="iconSm"
                    onClick={() =>
                      update(entry, {
                        sessions_completed: entry.sessions_completed + 1,
                      })
                    }
                  >
                    <Plus size={12} />
                  </AppButton>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
