"use client";

import AppButton from "@/components/buttons/AppButton";
import AppNumberInput from "@/components/fields/AppNumberInput";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import ProgressBar from "@/components/labels/ProgressBar";
import { trpc } from "@/trpc/client";
import type {
  TrainerScreeningStatusEnum,
  TrainerScreeningStepEnum,
} from "@prisma/client";
import {
  Bot,
  Check,
  ClipboardCheck,
  ClipboardList,
  FileText,
  GaugeCircle,
  Info,
  Loader2,
  MessageSquare,
  Minus,
  PhoneCall,
  Presentation,
  RotateCcw,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
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

const stepDescriptions: Record<TrainerScreeningStepEnum, string> = {
  APPLICATION_REVIEW:
    "Initial review of the candidate's application and portfolio.",
  INTERVIEW: "Structured interview with the trainer pool team.",
  TEACHING_DEMO: "Live teaching demo evaluated by reviewers.",
  PRACTICAL_TEST: "Hands-on practical assessment of AI skills.",
  REFERENCE_CHECK: "Verification of references from prior work.",
};

const stepIcons: Record<TrainerScreeningStepEnum, typeof FileText> = {
  APPLICATION_REVIEW: FileText,
  INTERVIEW: Users,
  TEACHING_DEMO: Presentation,
  PRACTICAL_TEST: ClipboardCheck,
  REFERENCE_CHECK: PhoneCall,
};

// Mirrors MIN_SCREENING_STEPS_PASSED / QUALIFYING_SCORE in
// trpc/routers/trainer-pool/trainer-pool.shared.ts — kept in sync manually
// since that file pulls in server-only packages that can't be imported here.
const MIN_STEPS_PASSED = 4;
const QUALIFYING_SCORE = 75;

const statusStyle: Record<
  TrainerScreeningStatusEnum,
  { ring: string; icon?: typeof Check }
> = {
  PASSED: {
    ring: "border-hijau bg-hijau text-white",
    icon: Check,
  },
  FAILED: {
    ring: "border-merah bg-merah text-white",
    icon: X,
  },
  PENDING: {
    ring: "border-gray-300 bg-gray-50 text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500",
  },
  SKIPPED: {
    ring: "border-gray-200 bg-gray-50 text-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-600",
    icon: Minus,
  },
};

type Score = {
  ai_hands_on_score: number;
  facilitation_score: number;
  domain_credibility_score: number;
  communication_score: number;
  reliability_score: number;
  total_score: number;
};

type Criterion = {
  key: keyof Omit<Score, "total_score">;
  label: string;
  description: string;
  max: number;
  icon: typeof Bot;
};

const criteria: Criterion[] = [
  {
    key: "ai_hands_on_score",
    label: "AI hands-on",
    description: "Depth of practical, hands-on AI skill.",
    max: 30,
    icon: Bot,
  },
  {
    key: "facilitation_score",
    label: "Facilitation",
    description: "Ability to lead and engage a room.",
    max: 25,
    icon: Presentation,
  },
  {
    key: "domain_credibility_score",
    label: "Domain credibility",
    description: "Track record and credibility in the subject area.",
    max: 20,
    icon: ShieldCheck,
  },
  {
    key: "communication_score",
    label: "Communication",
    description: "Clarity and structure when explaining ideas.",
    max: 15,
    icon: MessageSquare,
  },
  {
    key: "reliability_score",
    label: "Reliability",
    description: "Punctuality and consistency across sessions.",
    max: 10,
    icon: ClipboardList,
  },
];

function computeTotal(values: Record<Criterion["key"], string>) {
  return criteria.reduce(
    (sum, criterion) => sum + (Number(values[criterion.key]) || 0),
    0
  );
}

function ScoreGauge({ score }: { score: number }) {
  const percent = Math.min(100, Math.max(0, score));
  const radius = 45;
  const circumference = Math.PI * radius;
  const filled = (percent / 100) * circumference;
  const needleAngle = -90 + (percent / 100) * 180;
  const passed = percent >= QUALIFYING_SCORE;

  return (
    <div className="mx-auto w-44">
      <svg viewBox="0 0 100 55" className="w-full">
        <path
          d="M 5 50 A 45 45 0 0 1 95 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-gray-100 dark:text-zinc-800"
        />
        <path
          d="M 5 50 A 45 45 0 0 1 95 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          className={passed ? "text-hijau" : "text-claude"}
        />
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="14"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="text-gray-600 dark:text-zinc-300"
          style={{
            transformOrigin: "50px 50px",
            transform: `rotate(${needleAngle}deg)`,
          }}
        />
        <circle cx="50" cy="50" r="3.5" className="fill-gray-600 dark:fill-zinc-300" />
      </svg>
      <p className="-mt-3 text-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
          {score}
        </span>
        <span className="text-sm font-semibold text-gray-400">/100</span>
      </p>
    </div>
  );
}

function RubricScorePanel({
  trainerId,
  initial,
}: {
  trainerId: string;
  initial?: Score | null;
}) {
  const utils = trpc.useUtils();
  const defaults = {
    ai_hands_on_score: String(initial?.ai_hands_on_score ?? 0),
    facilitation_score: String(initial?.facilitation_score ?? 0),
    domain_credibility_score: String(initial?.domain_credibility_score ?? 0),
    communication_score: String(initial?.communication_score ?? 0),
    reliability_score: String(initial?.reliability_score ?? 0),
  };
  const [values, setValues] =
    useState<Record<Criterion["key"], string>>(defaults);

  const mutation = trpc.update.trainerPool.screeningScore.useMutation({
    onSuccess: () => {
      utils.read.trainerPool.trainer.invalidate({ id: trainerId });
      utils.list.trainerPool.trainers.invalidate();
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate({
      trainer_id: trainerId,
      ai_hands_on_score: Number(values.ai_hands_on_score),
      facilitation_score: Number(values.facilitation_score),
      domain_credibility_score: Number(values.domain_credibility_score),
      communication_score: Number(values.communication_score),
      reliability_score: Number(values.reliability_score),
    });
  }

  return (
    <section className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
      <h3 className="font-bold text-gray-900 dark:text-zinc-100">
        Rubric score
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Saving recalculates the total and applies the suggested level.
      </p>
      <form onSubmit={submit} className="mt-4 flex flex-col gap-3">
        {criteria.map((criterion) => (
          <div
            key={criterion.key}
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-zinc-800"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-claude/10 text-claude">
              <criterion.icon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                {criterion.label}{" "}
                <span className="font-normal text-gray-400">
                  · max {criterion.max}
                </span>
              </p>
              <p className="truncate text-xs text-gray-500">
                {criterion.description}
              </p>
            </div>
            <div className="w-20 shrink-0">
              <AppNumberInput
                inputId={`score-${criterion.key}`}
                value={values[criterion.key]}
                onValueChange={(next) =>
                  setValues((current) => ({ ...current, [criterion.key]: next }))
                }
              />
            </div>
          </div>
        ))}
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <AppButton type="submit" size="sm" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Check size={13} />
            )}
            Save score
          </AppButton>
          <AppButton
            type="button"
            variant="outline"
            size="sm"
            disabled={mutation.isPending}
            onClick={() => setValues(defaults)}
          >
            <RotateCcw size={13} />
            Reset
          </AppButton>
          <p className="text-xs font-semibold text-gray-600 dark:text-zinc-300">
            Live total: {computeTotal(values)}/100
          </p>
          {mutation.error && (
            <p className="text-xs text-red-500">{mutation.error.message}</p>
          )}
        </div>
      </form>
    </section>
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
    onSuccess: () => {
      utils.read.trainerPool.trainer.invalidate({ id: trainerId });
      utils.list.trainerPool.trainers.invalidate();
    },
  });

  const passedCount = steps.filter((entry) => entry.status === "PASSED").length;
  const totalScore = score?.total_score ?? 0;
  const clearsBar = totalScore >= QUALIFYING_SCORE;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
          <div className="flex items-center gap-2 text-gray-500">
            <GaugeCircle size={15} />
            <p className="text-xs font-semibold uppercase tracking-wide">
              Overall progress
            </p>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-zinc-100">
            {passedCount} of {steps.length}
          </p>
          <p className="text-xs text-gray-500">steps passed</p>
          <ProgressBar
            className="mt-3"
            value={passedCount}
            total={steps.length}
            variant={passedCount >= MIN_STEPS_PASSED ? "hijau" : "claude"}
          />
        </div>

        <div className="rounded-xl border border-gray-300 bg-card-bg p-5 text-center dark:border-zinc-700">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <ClipboardList size={15} />
            <p className="text-xs font-semibold uppercase tracking-wide">
              Current total score
            </p>
          </div>
          <ScoreGauge score={totalScore} />
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
              clearsBar
                ? "bg-hijau-t text-hijau dark:bg-green-950/40 dark:text-green-300"
                : "bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {clearsBar ? "Clears the bar" : "Below bar"}
          </span>
        </div>

        <div className="flex gap-3 rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
          <Info size={16} className="mt-0.5 shrink-0 text-claude" />
          <p className="text-xs leading-relaxed text-gray-500">
            A trainer qualifies once at least {MIN_STEPS_PASSED} of{" "}
            {steps.length} screening steps pass and the rubric total reaches{" "}
            {QUALIFYING_SCORE}+. Certification review then decides Certified
            vs. Not eligible.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
          <h3 className="font-bold text-gray-900 dark:text-zinc-100">
            Screening steps
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Five-step candidate review, in order.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {steps.map((entry, index) => {
              const style = statusStyle[entry.status];
              const StatusIcon = style.icon;
              const StepIcon = stepIcons[entry.step];
              return (
                <div
                  key={entry.step}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-zinc-800"
                >
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${style.ring}`}
                  >
                    {StatusIcon ? <StatusIcon size={14} /> : index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-zinc-100">
                      <StepIcon size={13} className="text-gray-400" />
                      {stepLabels[entry.step]}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {stepDescriptions[entry.step]}
                    </p>
                  </div>
                  <div className="w-32 shrink-0">
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
                </div>
              );
            })}
          </div>
        </section>

        <RubricScorePanel
          key={`${trainerId}-${score?.total_score ?? 0}`}
          trainerId={trainerId}
          initial={score}
        />
      </div>
    </div>
  );
}
