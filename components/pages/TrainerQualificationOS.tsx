"use client";

import AppButton from "@/components/buttons/AppButton";
import TrainerCertificationFormOS from "@/components/forms/TrainerCertificationFormOS";
import TrainerScreeningFormOS from "@/components/forms/TrainerScreeningFormOS";
import TrainerLevelLabel from "@/components/labels/TrainerLevelLabel";
import TrainerStatusLabel from "@/components/labels/TrainerStatusLabel";
import { setSessionToken, trpc } from "@/trpc/client";
import type { TrainerStatusEnum } from "@prisma/client";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PauseCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const journeyStages: {
  status: TrainerStatusEnum;
  label: string;
  caption: string;
}[] = [
  {
    status: "CANDIDATE",
    label: "Candidate",
    caption: "Screening & rubric",
  },
  {
    status: "CERTIFIED",
    label: "Certified",
    caption: "Certification pathway done",
  },
  { status: "ACTIVE", label: "Active", caption: "Delivering live projects" },
];

function TrainerJourney({
  status,
  isPending,
  onNavigate,
}: {
  status: TrainerStatusEnum;
  isPending: boolean;
  onNavigate: (direction: "prev" | "next") => void;
}) {
  const isDetour = status === "REMEDIAL" || status === "INACTIVE";
  const currentIndex = isDetour
    ? journeyStages.length - 1
    : journeyStages.findIndex((stage) => stage.status === status);
  const linearIndex = journeyStages.findIndex((stage) => stage.status === status);
  const canGoPrev = linearIndex > 0;
  const canGoNext = linearIndex !== -1 && linearIndex < journeyStages.length - 1;

  return (
    <div className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
      <div className="flex items-center gap-3">
        <AppButton
          type="button"
          variant="outline"
          size="iconSm"
          disabled={!canGoPrev || isPending}
          onClick={() => onNavigate("prev")}
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <ChevronLeft size={14} />
          )}
        </AppButton>
        <div className="flex flex-1 items-center">
        {journeyStages.map((stage, index) => {
          const isCurrent = !isDetour && index === currentIndex;
          const isComplete = index < currentIndex;
          return (
            <div key={stage.status} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <span
                  className={`flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold ${
                    isComplete
                      ? "border-hijau bg-hijau text-white"
                      : isCurrent
                        ? "border-claude bg-claude/10 text-claude"
                        : "border-gray-300 bg-gray-50 text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
                  }`}
                >
                  {isComplete ? <Check size={15} /> : index + 1}
                </span>
                <div>
                  <p
                    className={`text-xs font-bold ${
                      isCurrent || isComplete
                        ? "text-gray-900 dark:text-zinc-100"
                        : "text-gray-400 dark:text-zinc-500"
                    }`}
                  >
                    {stage.label}
                  </p>
                  <p className="text-[11px] text-gray-400">{stage.caption}</p>
                </div>
              </div>
              {index < journeyStages.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 rounded-full ${
                    index < currentIndex
                      ? "bg-hijau"
                      : "bg-gray-200 dark:bg-zinc-700"
                  }`}
                />
              )}
            </div>
          );
        })}
        </div>
        <AppButton
          type="button"
          variant="outline"
          size="iconSm"
          disabled={!canGoNext || isPending}
          onClick={() => onNavigate("next")}
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <ChevronRight size={14} />
          )}
        </AppButton>
      </div>
      {status === "REMEDIAL" && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-kuning-t px-3 py-2 text-xs font-semibold text-[#9a7a1a] dark:bg-yellow-950/40 dark:text-yellow-300">
          <AlertTriangle size={14} />
          Off track — under remedial review after evaluations flagged quality issues.
        </div>
      )}
      {status === "INACTIVE" && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">
          <PauseCircle size={14} />
          Paused — not currently eligible for new assignments.
        </div>
      )}
    </div>
  );
}

export default function TrainerQualificationOS({
  sessionToken,
  trainerId,
}: {
  sessionToken: string;
  trainerId: string;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const utils = trpc.useUtils();
  const { data, isLoading, isError } =
    trpc.read.trainerPool.trainer.useQuery(
      { id: trainerId },
      { enabled: !!sessionToken }
    );
  const trainer = data?.trainer;

  const updateTrainer = trpc.update.trainerPool.trainer.useMutation({
    onSuccess: () => {
      utils.read.trainerPool.trainer.invalidate({ id: trainerId });
      utils.list.trainerPool.trainers.invalidate();
    },
  });

  if (isLoading) {
    return (
      <p className="px-8 py-12 text-center text-sm text-gray-400">
        Loading trainer...
      </p>
    );
  }
  if (isError || !trainer) {
    return (
      <p className="px-8 py-12 text-center text-sm text-red-500">
        Trainer not found or you do not have access.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div>
        <Link
          href={`/trainers/${trainerId}`}
          className="text-xs font-semibold text-gray-500 hover:text-claude"
        >
          ← {trainer.full_name}
        </Link>
        <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-zinc-100">
          Screening &amp; Certification
        </h2>
        <div className="mt-2 flex flex-wrap gap-2">
          <TrainerStatusLabel status={trainer.status} />
          <TrainerLevelLabel level={trainer.level} />
        </div>
      </div>

      <TrainerJourney
        status={trainer.status}
        isPending={updateTrainer.isPending}
        onNavigate={(direction) => {
          const currentIndex = journeyStages.findIndex(
            (stage) => stage.status === trainer.status
          );
          if (currentIndex === -1) return;
          const targetIndex =
            direction === "next" ? currentIndex + 1 : currentIndex - 1;
          const target = journeyStages[targetIndex];
          if (!target) return;
          updateTrainer.mutate({ id: trainerId, status: target.status });
        }}
      />

      <TrainerScreeningFormOS
        trainerId={trainerId}
        steps={trainer.screening_steps}
        score={trainer.screening_score}
      />
      <TrainerCertificationFormOS
        trainerId={trainerId}
        steps={trainer.certification_steps}
      />
    </div>
  );
}
