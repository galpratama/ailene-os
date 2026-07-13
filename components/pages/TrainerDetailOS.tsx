"use client";

import AppButton from "@/components/buttons/AppButton";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import CreateTrainerAssignmentFormOS from "@/components/forms/CreateTrainerAssignmentFormOS";
import CreateTrainerEvaluationFormOS from "@/components/forms/CreateTrainerEvaluationFormOS";
import TrainerAvailabilityFormOS from "@/components/forms/TrainerAvailabilityFormOS";
import TrainerLevelLabel from "@/components/labels/TrainerLevelLabel";
import ProgressBar from "@/components/labels/ProgressBar";
import TrainerStatusLabel from "@/components/labels/TrainerStatusLabel";
import { setSessionToken, trpc } from "@/trpc/client";
import type {
  TrainerLevelEnum,
  TrainerLevelOverrideEnum,
  TrainerStatusEnum,
} from "@prisma/client";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarPlus,
  Mail,
  MessageCircle,
  Plus,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const statusOptions: AppSelectOption[] = [
  { value: "CANDIDATE", label: "Candidate" },
  { value: "CERTIFIED", label: "Certified" },
  { value: "ACTIVE", label: "Active" },
  { value: "REMEDIAL", label: "Remedial" },
  { value: "INACTIVE", label: "Inactive" },
];
const levelOptions: AppSelectOption[] = [
  { value: "APPRENTICE", label: "Apprentice" },
  { value: "CERTIFIED", label: "Certified Trainer" },
  { value: "SENIOR", label: "Senior / Specialist" },
  { value: "LEAD", label: "Lead Trainer" },
];
const levelOverrideOptions: AppSelectOption[] = [
  { value: "", label: "Derived from level" },
  { value: "JUNIOR", label: "Junior (manual override)" },
  { value: "SENIOR", label: "Senior (manual override)" },
];

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
  const [evaluationOpen, setEvaluationOpen] = useState(false);
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
  const { data: evaluationData } =
    trpc.list.trainerPool.evaluations.useQuery(
      { trainer_id: trainerId, page: 1, page_size: 200 },
      { enabled: !!sessionToken }
    );
  const trainer = data?.trainer;
  const ratings = useMemo(
    () =>
      evaluationData?.list
        .filter((entry) => entry.participant_rating_avg !== null)
        .map((entry) => Number(entry.participant_rating_avg)) ?? [],
    [evaluationData?.list]
  );
  const averageRating = ratings.length
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    : null;
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
            <TrainerStatusLabel status={trainer.status} />
            <TrainerLevelLabel level={trainer.level} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <AppButton variant="outline" onClick={() => setEvaluationOpen(true)}>
            <Star size={14} />
            Add Evaluation
          </AppButton>
          <AppButton onClick={() => setAssignmentOpen(true)}>
            <CalendarPlus size={14} />
            Assign to Project
          </AppButton>
        </div>
      </div>

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
            <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-300">
              <Star size={15} className="text-gray-400" />
              {averageRating ? `${averageRating.toFixed(1)} rolling rating` : "No rating yet"}
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
            selectId="trainer-detail-status"
            label="Pool Status"
            placeholder="Status"
            value={trainer.status}
            options={statusOptions}
            onChange={(value) =>
              updateTrainer.mutate({
                id: trainerId,
                status: value as TrainerStatusEnum,
              })
            }
          />
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
          <AppSelect
            selectId="trainer-detail-level-override"
            label="Junior/Senior Override"
            placeholder="Derived from level"
            value={trainer.level_override ?? ""}
            options={levelOverrideOptions}
            onChange={(value) =>
              updateTrainer.mutate({
                id: trainerId,
                level_override:
                  (value as TrainerLevelOverrideEnum | "") || null,
              })
            }
          />
          {trainer.level_override && trainer.level_override_setter && (
            <p className="text-xs text-gray-500">
              Set by {trainer.level_override_setter.full_name}
              {trainer.level_override_set_at
                ? ` on ${new Date(trainer.level_override_set_at).toLocaleDateString("en-GB")}`
                : ""}
            </p>
          )}
          <p className="text-xs leading-relaxed text-gray-500">
            QC evaluations may automatically move this trainer to remedial or
            inactive. Certification approval moves them to certified.
          </p>
        </div>
      </section>

      <Link
        href={`/trainers/${trainerId}/qualification`}
        className="block rounded-xl border border-gray-300 bg-card-bg p-5 transition-colors hover:border-claude/60 dark:border-zinc-700"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-zinc-100">
              Screening &amp; Certification
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Review the qualification pipeline for this trainer.
            </p>
          </div>
          <ArrowRight size={16} className="shrink-0 text-gray-400" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-zinc-300">
              Screening · {screeningPassed}/{screeningTotal} passed
            </p>
            <ProgressBar
              value={screeningPassed}
              total={screeningTotal}
              variant={screeningPassed === screeningTotal ? "hijau" : "claude"}
            />
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold text-gray-600 dark:text-zinc-300">
              Certification · {certificationPassed}/{certificationTotal} complete
            </p>
            <ProgressBar
              value={certificationPassed}
              total={certificationTotal}
              variant={
                certificationPassed === certificationTotal ? "hijau" : "claude"
              }
            />
          </div>
        </div>
      </Link>

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

      <section className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-zinc-100">
              Evaluations
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Delivery feedback powering the quality-control loop.
            </p>
          </div>
          <AppButton
            size="sm"
            variant="outline"
            onClick={() => setEvaluationOpen(true)}
          >
            <Plus size={13} /> Evaluate
          </AppButton>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {evaluationData?.list.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-gray-200 p-4 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                  {entry.company_name ?? "General evaluation"}
                </p>
                <span className="flex items-center gap-1 text-sm font-bold text-claude">
                  <Star size={13} fill="currentColor" />
                  {entry.participant_rating_avg
                    ? Number(entry.participant_rating_avg).toFixed(1)
                    : "—"}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {entry.pipeline_name ?? "No assignment linked"}
              </p>
              {entry.review_notes && (
                <p className="mt-3 text-xs leading-relaxed text-gray-600 dark:text-zinc-300">
                  {entry.review_notes}
                </p>
              )}
            </div>
          ))}
          {!evaluationData?.list.length && (
            <p className="text-sm text-gray-400">No evaluations yet.</p>
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
      <CreateTrainerEvaluationFormOS
        trainerId={trainerId}
        isOpen={evaluationOpen}
        onClose={() => setEvaluationOpen(false)}
      />
    </div>
  );
}
