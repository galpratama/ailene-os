"use client";

import AppButton from "@/components/buttons/AppButton";
import AppNumberInput from "@/components/fields/AppNumberInput";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import { trpc } from "@/trpc/client";
import type {
  TrainerScreeningStatusEnum,
  TrainerScreeningStepEnum,
} from "@prisma/client";
import { Check, Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

const statusOptions: AppSelectOption[] = [
  { value: "PENDING", label: "Pending" },
  { value: "PASSED", label: "Passed" },
  { value: "FAILED", label: "Failed" },
  { value: "SKIPPED", label: "Skipped" },
];

const stepLabels: Record<TrainerScreeningStepEnum, string> = {
  APPLICATION_REVIEW: "Application review",
  INTERVIEW: "Interview",
  TEACHING_DEMO: "Teaching demo",
  PRACTICAL_TEST: "Practical test",
  REFERENCE_CHECK: "Reference check",
};

type Score = {
  ai_hands_on_score: number;
  facilitation_score: number;
  domain_credibility_score: number;
  communication_score: number;
  reliability_score: number;
  total_score: number;
};

function ScoreFormOS({
  trainerId,
  initial,
}: {
  trainerId: string;
  initial?: Score | null;
}) {
  const utils = trpc.useUtils();
  const [ai, setAi] = useState(String(initial?.ai_hands_on_score ?? 0));
  const [facilitation, setFacilitation] = useState(
    String(initial?.facilitation_score ?? 0)
  );
  const [domain, setDomain] = useState(
    String(initial?.domain_credibility_score ?? 0)
  );
  const [communication, setCommunication] = useState(
    String(initial?.communication_score ?? 0)
  );
  const [reliability, setReliability] = useState(
    String(initial?.reliability_score ?? 0)
  );
  const [result, setResult] = useState<string | null>(null);

  const mutation = trpc.update.trainerPool.screeningScore.useMutation({
    onSuccess: (data) => {
      setResult(
        `Total ${data.total_score}/100 · suggested level ${data.suggested_level.toLowerCase()}`
      );
      utils.read.trainerPool.trainer.invalidate({ id: trainerId });
      utils.list.trainerPool.trainers.invalidate();
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate({
      trainer_id: trainerId,
      ai_hands_on_score: Number(ai),
      facilitation_score: Number(facilitation),
      domain_credibility_score: Number(domain),
      communication_score: Number(communication),
      reliability_score: Number(reliability),
    });
  }

  return (
    <form
      onSubmit={submit}
      className="mt-5 rounded-xl border border-gray-200 p-4 dark:border-zinc-800"
    >
      <div className="mb-4">
        <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100">
          Rubric score
        </h4>
        <p className="mt-0.5 text-xs text-gray-500">
          Saving recalculates the total and applies the suggested initial level.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <AppNumberInput
          inputId="score-ai"
          label="AI hands-on · 30"
          value={ai}
          onValueChange={setAi}
        />
        <AppNumberInput
          inputId="score-facilitation"
          label="Facilitation · 25"
          value={facilitation}
          onValueChange={setFacilitation}
        />
        <AppNumberInput
          inputId="score-domain"
          label="Domain · 20"
          value={domain}
          onValueChange={setDomain}
        />
        <AppNumberInput
          inputId="score-communication"
          label="Communication · 15"
          value={communication}
          onValueChange={setCommunication}
        />
        <AppNumberInput
          inputId="score-reliability"
          label="Reliability · 10"
          value={reliability}
          onValueChange={setReliability}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <AppButton type="submit" size="sm" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Check size={13} />
          )}
          Save score
        </AppButton>
        {(result || initial) && (
          <p className="text-xs font-semibold text-gray-600 dark:text-zinc-300">
            {result ?? `Current total: ${
              (initial?.ai_hands_on_score ?? 0) +
              (initial?.facilitation_score ?? 0) +
              (initial?.domain_credibility_score ?? 0) +
              (initial?.communication_score ?? 0) +
              (initial?.reliability_score ?? 0)
            }/100`}
          </p>
        )}
        {mutation.error && (
          <p className="text-xs text-red-500">{mutation.error.message}</p>
        )}
      </div>
    </form>
  );
}

export default function TrainerScreeningFormOS({
  trainerId,
  steps,
  score,
}: {
  trainerId: string;
  steps: {
    step: TrainerScreeningStepEnum;
    status: TrainerScreeningStatusEnum;
  }[];
  score?: Score | null;
}) {
  const utils = trpc.useUtils();
  const updateStep = trpc.update.trainerPool.screeningStep.useMutation({
    onSuccess: () =>
      utils.read.trainerPool.trainer.invalidate({ id: trainerId }),
  });

  return (
    <section className="rounded-xl border border-gray-300 bg-card-bg p-5">
      <h3 className="font-bold text-gray-900 dark:text-zinc-100">Screening</h3>
      <p className="mt-1 text-sm text-gray-500">
        Five-step candidate review and the 100-point qualification rubric.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {steps.map((entry) => (
          <div
            key={entry.step}
            className="rounded-xl border border-gray-200 p-3 dark:border-zinc-800"
          >
            <p className="mb-2 text-xs font-semibold text-gray-700 dark:text-zinc-300">
              {stepLabels[entry.step]}
            </p>
            <AppSelect
              selectId={`screening-${entry.step}`}
              placeholder="Status"
              value={entry.status}
              options={statusOptions}
              onChange={(value) =>
                updateStep.mutate({
                  trainer_id: trainerId,
                  step: entry.step,
                  status: value as TrainerScreeningStatusEnum,
                })
              }
            />
          </div>
        ))}
      </div>
      <ScoreFormOS
        key={`${trainerId}-${score?.ai_hands_on_score ?? "new"}-${score?.total_score ?? 0}`}
        trainerId={trainerId}
        initial={score}
      />
    </section>
  );
}
