"use client";

import AppButton from "@/components/buttons/AppButton";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import CreateTrainerAssignmentFormOS from "@/components/forms/CreateTrainerAssignmentFormOS";
import TrainerAvailabilityFormOS from "@/components/forms/TrainerAvailabilityFormOS";
import TrainerLevelLabel from "@/components/labels/TrainerLevelLabel";
import ProgressBar from "@/components/labels/ProgressBar";
import TrainerStageLabel from "@/components/labels/TrainerStageLabel";
import TrainerStatusLabel from "@/components/labels/TrainerStatusLabel";
import { setSessionToken, trpc } from "@/trpc/client";
import type { TrainerLevelEnum, TrainerStageEnum } from "@prisma/client";
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  CalendarPlus,
  Check,
  Mail,
  MessageCircle,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const levelOptions: AppSelectOption[] = [
  { value: "JUNIOR", label: "Junior" },
  { value: "SENIOR", label: "Senior" },
];

// The pipeline is a straight line with two decision forks. Stage is always
// derived server-side (see deriveTrainerStage), so this is read-only.
const journeySteps = [
  { label: "Candidate", caption: "Screening & rubric" },
  { label: "Qualified", caption: "Certification pathway" },
  { label: "Certified", caption: "Ready for assignments" },
];

function journeyStepIndex(stage: TrainerStageEnum) {
  switch (stage) {
    case "CANDIDATE":
      return 0;
    case "QUALIFIED":
    case "NOT_QUALIFIED":
      return 1;
    case "CERTIFIED":
    case "NOT_ELIGIBLE":
      return 2;
  }
}

function TrainerJourney({ stage }: { stage: TrainerStageEnum }) {
  const currentIndex = journeyStepIndex(stage);
  const isRejected = stage === "NOT_QUALIFIED" || stage === "NOT_ELIGIBLE";

  return (
    <div className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
      <div className="flex items-center">
        {journeySteps.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isFailed = isCurrent && isRejected;
          const isComplete =
            index < currentIndex || (isCurrent && !isRejected && index > 0);
          return (
            <div
              key={step.label}
              className="flex flex-1 items-center last:flex-none"
            >
              <div className="flex flex-col items-center gap-1.5 text-center">
                <span
                  className={`flex size-8 items-center justify-center rounded-full border-2 text-xs font-bold ${
                    isFailed
                      ? "border-merah bg-merah text-white"
                      : isComplete
                        ? "border-hijau bg-hijau text-white"
                        : isCurrent
                          ? "border-claude bg-claude/10 text-claude"
                          : "border-gray-300 bg-gray-50 text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
                  }`}
                >
                  {isFailed ? (
                    <X size={15} />
                  ) : isComplete ? (
                    <Check size={15} />
                  ) : (
                    index + 1
                  )}
                </span>
                <div>
                  <p
                    className={`text-xs font-bold ${
                      isCurrent || isComplete
                        ? "text-gray-900 dark:text-zinc-100"
                        : "text-gray-400 dark:text-zinc-500"
                    }`}
                  >
                    {isFailed
                      ? stage === "NOT_QUALIFIED"
                        ? "Not qualified"
                        : "Not eligible"
                      : step.label}
                  </p>
                  <p className="text-[11px] text-gray-400">{step.caption}</p>
                </div>
              </div>
              {index < journeySteps.length - 1 && (
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
      {stage === "NOT_QUALIFIED" && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-merah-t px-3 py-2 text-xs font-semibold text-merah dark:bg-red-950/40 dark:text-red-300">
          <AlertTriangle size={14} />
          Did not qualify — screening steps or rubric score didn&apos;t clear
          the bar.
        </div>
      )}
      {stage === "NOT_ELIGIBLE" && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-merah-t px-3 py-2 text-xs font-semibold text-merah dark:bg-red-950/40 dark:text-red-300">
          <AlertTriangle size={14} />
          Not eligible — certification review did not pass.
        </div>
      )}
    </div>
  );
}

export default function TrainerDetailOS({
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
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const { data, isLoading, isError } =
    trpc.read.trainerPool.trainer.useQuery(
      { id: trainerId },
      { enabled: !!sessionToken }
    );
  const { data: assignmentData } =
    trpc.list.trainerPool.assignments.useQuery(
      { trainer_id: trainerId, page: 1, page_size: 200 },
      { enabled: !!sessionToken }
    );
  const trainer = data?.trainer;
  const screeningPassed =
    trainer?.screening_steps.filter((entry) => entry.status === "PASSED")
      .length ?? 0;
  const screeningTotal = trainer?.screening_steps.length ?? 0;
  const certificationPassed =
    trainer?.certification_steps.filter((entry) => entry.status === "PASSED")
      .length ?? 0;
  const certificationTotal = trainer?.certification_steps.length ?? 0;

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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/trainers"
            className="text-xs font-semibold text-gray-500 hover:text-claude"
          >
            ← Trainer Pool
          </Link>
          <h2 className="mt-2 text-xl font-bold text-gray-900 dark:text-zinc-100">
            {trainer.full_name}
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <TrainerStageLabel stage={trainer.stage} />
            <TrainerLevelLabel level={trainer.level} />
            {trainer.status === "INACTIVE" && (
              <TrainerStatusLabel status={trainer.status} />
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <AppButton onClick={() => setAssignmentOpen(true)}>
            <CalendarPlus size={14} />
            Assign to Project
          </AppButton>
        </div>
      </div>

      <TrainerJourney stage={trainer.stage} />

      <section className="grid gap-5 rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-zinc-100">
            Overview
          </h3>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-300">
              <Mail size={15} className="text-gray-400" />
              {trainer.email}
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-300">
              <MessageCircle size={15} className="text-gray-400" />
              {trainer.phone_country?.phone_code ?? ""}{" "}
              {trainer.phone_number ?? "No WhatsApp"}
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-300">
              <BriefcaseBusiness size={15} className="text-gray-400" />
              {trainer.source?.toLowerCase().replaceAll("_", " ") ??
                "Source not set"}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {trainer.specializations.map((entry) => (
              <span
                key={entry.id}
                className="rounded-full border border-gray-300 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {entry.name}
              </span>
            ))}
          </div>
          {trainer.notes && (
            <div className="mt-4 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">
              {trainer.notes}
            </div>
          )}
        </div>
        <div className="grid content-start gap-3 rounded-xl border border-gray-200 p-4 dark:border-zinc-800">
          <AppSelect
            selectId="trainer-detail-level"
            label="Trainer Level"
            placeholder="Level"
            value={trainer.level}
            options={levelOptions}
            onChange={(value) =>
              updateTrainer.mutate({
                id: trainerId,
                level: value as TrainerLevelEnum,
              })
            }
          />
          <p className="text-xs leading-relaxed text-gray-500">
            Certification approval moves this trainer to certified.
          </p>
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        <Link
          href={`/trainers/${trainerId}/screening`}
          className="block rounded-xl border border-gray-300 bg-card-bg p-5 transition-colors hover:border-claude/60 dark:border-zinc-700"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-zinc-100">
                Screening
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Five-step candidate review and the 100-point rubric.
              </p>
            </div>
            <ArrowRight size={16} className="shrink-0 text-gray-400" />
          </div>
          <div className="mt-4">
            <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-zinc-300">
              {screeningPassed}/{screeningTotal} passed
            </p>
            <ProgressBar
              value={screeningPassed}
              total={screeningTotal}
              variant={screeningPassed === screeningTotal ? "hijau" : "claude"}
            />
          </div>
        </Link>
        <Link
          href={`/trainers/${trainerId}/certification`}
          className="block rounded-xl border border-gray-300 bg-card-bg p-5 transition-colors hover:border-claude/60 dark:border-zinc-700"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-zinc-100">
                Certification
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Pathway toward the certified pool.
              </p>
            </div>
            <ArrowRight size={16} className="shrink-0 text-gray-400" />
          </div>
          <div className="mt-4">
            <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-zinc-300">
              {certificationPassed}/{certificationTotal} complete
            </p>
            <ProgressBar
              value={certificationPassed}
              total={certificationTotal}
              variant={
                certificationPassed === certificationTotal ? "hijau" : "claude"
              }
            />
          </div>
        </Link>
      </div>

      <section className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-zinc-100">
              Assignments
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Client projects this trainer supports.
            </p>
          </div>
          <AppButton size="sm" onClick={() => setAssignmentOpen(true)}>
            <Plus size={13} /> Assign
          </AppButton>
        </div>
        <div className="mt-4 divide-y divide-gray-200 dark:divide-zinc-800">
          {assignmentData?.list.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
            >
              <div>
                <Link
                  href={`/leads/${entry.pipeline_id}`}
                  className="font-semibold text-gray-900 hover:text-claude dark:text-zinc-100"
                >
                  {entry.company_name} · {entry.pipeline_name}
                </Link>
                <p className="mt-0.5 text-xs text-gray-500">
                  {entry.role.toLowerCase().replaceAll("_", " ")}
                  {entry.participant_count
                    ? ` · ${entry.participant_count} participants`
                    : ""}
                </p>
              </div>
              <span className="text-xs text-gray-500">
                {entry.session_date
                  ? new Date(entry.session_date).toLocaleDateString("en-GB")
                  : "Date TBD"}
              </span>
            </div>
          ))}
          {!assignmentData?.list.length && (
            <p className="py-5 text-sm text-gray-400">No assignments yet.</p>
          )}
        </div>
      </section>

      <TrainerAvailabilityFormOS
        trainerId={trainerId}
        availabilities={trainer.availabilities}
      />

      <CreateTrainerAssignmentFormOS
        trainerId={trainerId}
        isOpen={assignmentOpen}
        onClose={() => setAssignmentOpen(false)}
      />
    </div>
  );
}
