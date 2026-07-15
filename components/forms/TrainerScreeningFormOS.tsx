"use client";

import AppButton from "@/components/buttons/AppButton";
import AppNumberInput from "@/components/fields/AppNumberInput";
import AppSelect, { type AppSelectOption } from "@/components/fields/AppSelect";
import TrainerLevelLabel from "@/components/labels/TrainerLevelLabel";
import ProgressBar from "@/components/labels/ProgressBar";
import TrainerStageLabel from "@/components/labels/TrainerStageLabel";
import { trpc } from "@/trpc/client";
import type {
  TrainerLevelEnum,
  TrainerScreeningStatusEnum,
  TrainerStageEnum,
} from "@prisma/client";
import {
  Bot,
  Check,
  CircleUserRound,
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
import Image from "next/image";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

// Mirrors SCREENING_STEP_KEYS in trpc/routers/trainer-pool/trainer-pool.shared.ts
type TrainerScreeningStepKey =
  | "APPLICATION_REVIEW"
  | "INTERVIEW"
  | "TEACHING_DEMO"
  | "PRACTICAL_TEST"
  | "REFERENCE_CHECK";

const statusOptions: AppSelectOption[] = [
  { value: "PENDING", label: "Pending" },
  { value: "PASSED", label: "Passed" },
  { value: "FAILED", label: "Failed" },
  { value: "SKIPPED", label: "Skipped" },
];

const stepLabels: Record<TrainerScreeningStepKey, string> = {
  APPLICATION_REVIEW: "Application review",
  INTERVIEW: "Interview",
  TEACHING_DEMO: "Teaching demo",
  PRACTICAL_TEST: "Practical test",
  REFERENCE_CHECK: "Reference check",
};

const stepDescriptions: Record<TrainerScreeningStepKey, string> = {
  APPLICATION_REVIEW:
    "Initial review of the candidate's application and portfolio.",
  INTERVIEW: "Structured interview with the trainer pool team.",
  TEACHING_DEMO: "Live teaching demo evaluated by reviewers.",
  PRACTICAL_TEST: "Hands-on practical assessment of AI skills.",
  REFERENCE_CHECK: "Verification of references from prior work.",
};

const stepIcons: Record<TrainerScreeningStepKey, typeof FileText> = {
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
  // Mirrors SCREENING_RUBRIC_WEIGHTS in trainer-pool.shared.ts — display
  // only. Each criterion is scored 0-100; the backend applies these weights
  // to compute the total, never the frontend.
  weight: number;
  icon: typeof Bot;
};

const criteria: Criterion[] = [
  {
    key: "ai_hands_on_score",
    label: "AI hands-on",
    description: "Depth of practical, hands-on AI skill.",
    weight: 30,
    icon: Bot,
  },
  {
    key: "facilitation_score",
    label: "Facilitation",
    description: "Ability to lead and engage a room.",
    weight: 25,
    icon: Presentation,
  },
  {
    key: "domain_credibility_score",
    label: "Domain credibility",
    description: "Track record and credibility in the subject area.",
    weight: 20,
    icon: ShieldCheck,
  },
  {
    key: "communication_score",
    label: "Communication",
    description: "Clarity and structure when explaining ideas.",
    weight: 15,
    icon: MessageSquare,
  },
  {
    key: "reliability_score",
    label: "Reliability",
    description: "Punctuality and consistency across sessions.",
    weight: 10,
    icon: ClipboardList,
  },
];

function ScoreGauge({ score }: { score: number }) {
  const percent = Math.min(100, Math.max(0, score));
  const radius = 45;
  const circumference = Math.PI * radius;
  const filled = (percent / 100) * circumference;
  const passed = percent >= QUALIFYING_SCORE;

  return (
    <div className="relative mx-auto w-44">
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
      </svg>
      <div className="absolute inset-0 flex items-end justify-center gap-0.5 pb-1">
        <span className="text-4xl font-extrabold leading-none text-gray-900 dark:text-zinc-100">
          {score}
        </span>
        <span className="pb-1 text-sm font-semibold text-gray-400">/100</span>
      </div>
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
    onSuccess: (data) => {
      toast.success("Screening score saved.", {
        description: `Weighted total ${data.total_score}/100 · suggested level ${data.suggested_level.toLowerCase()}`,
      });
      utils.read.trainerPool.trainer.invalidate({ id: trainerId });
      utils.list.trainerPool.trainers.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to save score.", { description: error.message });
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
        Score each criterion 0-100. Weighting into the overall total happens on
        save.
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
                  · weight {criterion.weight}%
                </span>
              </p>
              <p className="truncate text-xs text-gray-500">
                {criterion.description}
              </p>
            </div>
            <div className="w-20 shrink-0">
              <AppNumberInput
                inputId={`score-${criterion.key}`}
                placeholder="/100"
                value={values[criterion.key]}
                onValueChange={(next) =>
                  setValues((current) => ({
                    ...current,
                    [criterion.key]: next,
                  }))
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
        </div>
      </form>
    </section>
  );
}

export default function TrainerScreeningFormOS({
  trainerId,
  trainer,
  steps,
  score,
}: {
  trainerId: string;
  trainer: {
    full_name: string;
    avatar: string | null;
    ai_experience_years: number;
    stage: TrainerStageEnum;
    level: TrainerLevelEnum;
  };
  steps: {
    step: TrainerScreeningStepKey;
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

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
        <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <div className="flex items-center gap-3">
              {trainer.avatar ? (
                <Image
                  src={trainer.avatar}
                  alt={trainer.full_name}
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-claude text-white">
                  <CircleUserRound size={22} fill="currentColor" />
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900 dark:text-zinc-100">
                  {trainer.full_name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <TrainerStageLabel stage={trainer.stage} />
                  <TrainerLevelLabel level={trainer.level} />
                  <span className="text-xs text-gray-500">
                    {trainer.ai_experience_years}{" "}
                    {trainer.ai_experience_years === 1 ? "year" : "years"} exp
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-gray-500">
              <GaugeCircle size={15} />
              <p className="text-xs font-semibold uppercase tracking-wide">
                Screening progress
              </p>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-zinc-100">
              {passedCount} of {steps.length}{" "}
              <span className="text-sm font-normal text-gray-500">
                steps passed
              </span>
            </p>
            <ProgressBar
              className="mt-3"
              value={passedCount}
              total={steps.length}
              variant={passedCount >= MIN_STEPS_PASSED ? "hijau" : "claude"}
            />
            <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-gray-500">
              <Info size={14} className="mt-0.5 shrink-0 text-claude" />A
              trainer qualifies once at least {MIN_STEPS_PASSED} of{" "}
              {steps.length} steps pass and the rubric total reaches{" "}
              {QUALIFYING_SCORE}+. Certification review then decides Certified
              vs. Not eligible.
            </p>
          </div>
          <div className="flex flex-col items-center border-t border-gray-200 pt-4 text-center sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0 dark:border-zinc-800">
            <ScoreGauge score={totalScore} />
          </div>
        </div>
      </section>

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
                    <p className="line-clamp-2 text-xs text-gray-500">
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
