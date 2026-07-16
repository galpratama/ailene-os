"use client";

import AppButton from "@/components/buttons/AppButton";
import AppTextArea from "@/components/fields/AppTextArea";
import Label, { type LabelVariant } from "@/components/labels/Label";
import TrainerStatusLabel from "@/components/labels/TrainerStatusLabel";
import { setSessionToken, trpc } from "@/trpc/client";
import type {
  TrainerCertificationStatusEnum,
  TrainerScreeningStatusEnum,
  TrainerStageEnum,
} from "@prisma/client";
import {
  ArrowRight,
  Award,
  Check,
  CircleUserRound,
  Mail,
  MessageCircle,
  Plus,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Mirrors CertificationStepKey in trpc/routers/trainer-pool/trainer-pool.shared.ts
type CertificationStepKey =
  | "ORIENTATION"
  | "MATERIAL_MASTERY"
  | "SHADOWING"
  | "CO_TRAINING"
  | "SOLO_OBSERVED_DELIVERY"
  | "CERTIFICATION_DECISION";

const certificationStepTitles: Record<CertificationStepKey, string> = {
  ORIENTATION: "Orientation",
  MATERIAL_MASTERY: "Material Mastery",
  SHADOWING: "Shadowing",
  CO_TRAINING: "Co-training",
  SOLO_OBSERVED_DELIVERY: "Solo Observed Delivery",
  CERTIFICATION_DECISION: "Certification Decision",
};

const certificationStatusConfig: Record<
  TrainerCertificationStatusEnum,
  { label: string; variant: LabelVariant }
> = {
  NOT_STARTED: { label: "Not started", variant: "gray" },
  IN_PROGRESS: { label: "In progress", variant: "kuning" },
  PASSED: { label: "Completed", variant: "hijau" },
  FAILED: { label: "Failed", variant: "merah" },
};

// Mirrors ScreeningStepKey in trpc/routers/trainer-pool/trainer-pool.shared.ts
type ScreeningStepKey =
  | "APPLICATION_REVIEW"
  | "INTERVIEW"
  | "TEACHING_DEMO"
  | "PRACTICAL_TEST"
  | "REFERENCE_CHECK";

const screeningStepTitles: Record<ScreeningStepKey, string> = {
  APPLICATION_REVIEW: "Application Review",
  INTERVIEW: "Interview",
  TEACHING_DEMO: "Teaching Demo",
  PRACTICAL_TEST: "Practical Test",
  REFERENCE_CHECK: "Reference Check",
};

const screeningStatusConfig: Record<
  TrainerScreeningStatusEnum,
  { label: string; variant: LabelVariant }
> = {
  PENDING: { label: "Pending", variant: "gray" },
  PASSED: { label: "Passed", variant: "biru" },
  FAILED: { label: "Failed", variant: "merah" },
  SKIPPED: { label: "Skipped", variant: "gray" },
};

const stageValueText: Record<TrainerStageEnum, string> = {
  CANDIDATE: "Candidate",
  QUALIFIED: "Qualified",
  NOT_QUALIFIED: "Not qualified",
  ELIGIBLE: "Eligible",
  NOT_ELIGIBLE: "Not eligible",
};

type PathwayTone = "passed" | "failed" | "active" | "neutral";
type PathwayAccent = "hijau" | "claude";

const pathwayCircleClass: Record<PathwayAccent, Record<PathwayTone, string>> = {
  hijau: {
    passed: "border-hijau bg-hijau text-white",
    failed: "border-merah bg-merah text-white",
    active: "border-claude bg-claude/10 text-claude",
    neutral:
      "border-gray-300 bg-gray-50 text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500",
  },
  claude: {
    passed: "border-claude bg-claude text-white",
    failed: "border-merah bg-merah text-white",
    active: "border-claude bg-claude/10 text-claude",
    neutral:
      "border-gray-300 bg-gray-50 text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500",
  },
};

type PathwayStep = {
  key: string;
  title: string;
  tone: PathwayTone;
  label: string;
  labelVariant: LabelVariant;
};

function PathwaySection({
  title,
  href,
  steps,
  accent = "hijau",
}: {
  title: string;
  href: string;
  steps: PathwayStep[];
  accent?: PathwayAccent;
}) {
  const router = useRouter();

  return (
    <section className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-bold text-gray-900 dark:text-zinc-100">{title}</h3>
        <AppButton variant="ghost" size="sm" onClick={() => router.push(href)}>
          View details
          <ArrowRight size={13} />
        </AppButton>
      </div>
      <div className="relative mt-5 overflow-x-auto pb-1">
        <div className="absolute left-4.5 right-4.5 top-4.5 h-0.5 bg-gray-200 dark:bg-zinc-800" />
        <div className="relative flex items-start gap-1">
          {steps.map((step, index) => (
            <div
              key={step.key}
              className="flex flex-1 flex-col items-center gap-2 text-center"
            >
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${pathwayCircleClass[accent][step.tone]}`}
              >
                {step.tone === "passed" ? <Check size={16} /> : index + 1}
              </div>
              <p className="min-w-20 px-1 text-xs font-bold text-gray-900 dark:text-zinc-100">
                {step.title}
              </p>
              <Label variant={step.labelVariant}>{step.label}</Label>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 dark:border-zinc-800">
      <div className="flex items-center gap-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-claude/10 text-claude">
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="truncate whitespace-nowrap font-bold text-gray-900 dark:text-zinc-100">
            {value}
          </p>
        </div>
      </div>
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
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const { data, isLoading, isError } = trpc.read.trainerPool.trainer.useQuery(
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

  function openNotesEditor() {
    setNotesDraft(trainer?.notes ?? "");
    setEditingNotes(true);
  }

  function saveNotes() {
    updateTrainer.mutate(
      { id: trainerId, notes: notesDraft || null },
      { onSuccess: () => setEditingNotes(false) }
    );
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-100">
        Trainer Profile
      </h2>

      <section className="flex flex-wrap items-center justify-between gap-5 rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
        <div className="flex flex-wrap gap-4">
          {trainer.user.avatar ? (
            <Image
              src={trainer.user.avatar}
              alt={trainer.full_name}
              width={72}
              height={72}
              className="size-18 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex size-18 shrink-0 items-center justify-center rounded-full bg-claude text-white">
              <CircleUserRound size={38} fill="currentColor" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                {trainer.full_name}
              </h3>
              {trainer.status === "INACTIVE" && (
                <TrainerStatusLabel status={trainer.status} />
              )}
            </div>
            <div className="mt-2 flex flex-col gap-1.5 text-sm text-gray-600 dark:text-zinc-300">
              <span className="flex items-center gap-2">
                <Mail size={15} className="text-gray-400" />
                {trainer.email}
              </span>
              <span className="flex items-center gap-2">
                <MessageCircle size={15} className="text-gray-400" />
                {trainer.phone_country?.phone_code ?? ""}{" "}
                {trainer.phone_number ?? "No WhatsApp"}
              </span>
              <span className="flex items-center gap-2">
                <Sparkles size={15} className="text-gray-400" />
                {trainer.ai_experience_years}{" "}
                {trainer.ai_experience_years === 1 ? "year" : "years"} AI
                experience
              </span>
            </div>
            {trainer.specializations.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {trainer.specializations.map((entry) => (
                  <span
                    key={entry.id}
                    className="rounded-full border border-gray-300 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    {entry.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="min-w-36 rounded-xl border border-gray-200 p-4 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-claude/10 text-claude">
                <Award size={18} />
              </span>
              <div>
                <p className="whitespace-nowrap text-xs text-gray-500">
                  Trainer Level
                </p>
                <p className="whitespace-nowrap font-bold text-gray-900 dark:text-zinc-100">
                  {trainer.level === "SENIOR" ? "Senior" : "Junior"}
                </p>
              </div>
            </div>
          </div>
          <div className="min-w-36 rounded-xl border border-gray-200 p-4 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-claude/10 text-claude">
                <ShieldCheck size={18} />
              </span>
              <div>
                <p className="whitespace-nowrap text-xs text-gray-500">
                  Trainer Stage
                </p>
                <p className="whitespace-nowrap font-bold text-gray-900 dark:text-zinc-100">
                  {stageValueText[trainer.stage]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {trainer.referrer && (
        <section className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
          <h3 className="font-bold text-gray-900 dark:text-zinc-100">
            Professional Information
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoTile
              icon={UserPlus}
              label="Referred by"
              value={trainer.referrer.full_name}
            />
          </div>
        </section>
      )}

      <section className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold text-gray-900 dark:text-zinc-100">Notes</h3>
          {!editingNotes && (
            <AppButton variant="ghost" size="sm" onClick={openNotesEditor}>
              <Plus size={13} />
              {trainer.notes ? "Edit" : "Add Note"}
            </AppButton>
          )}
        </div>
        {editingNotes ? (
          <div className="mt-3 flex flex-col gap-2">
            <AppTextArea
              textAreaId="trainer-notes"
              value={notesDraft}
              onChange={(event) => setNotesDraft(event.target.value)}
              placeholder="Add private notes about this trainer..."
              rows={5}
            />
            <div className="flex justify-end gap-2">
              <AppButton
                variant="ghost"
                size="sm"
                onClick={() => setEditingNotes(false)}
              >
                Cancel
              </AppButton>
              <AppButton
                size="sm"
                onClick={saveNotes}
                disabled={updateTrainer.isPending}
              >
                Save
              </AppButton>
            </div>
            {updateTrainer.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
                {updateTrainer.error.message}
              </p>
            )}
          </div>
        ) : trainer.notes ? (
          <p className="mt-3 whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-600 dark:bg-zinc-800/60 dark:text-zinc-300">
            {trainer.notes}
          </p>
        ) : (
          <p className="mt-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-400 dark:bg-zinc-800/60">
            Add private notes about this trainer...
          </p>
        )}
      </section>

      <PathwaySection
        title="Screening Pathway"
        href={`/trainers/${trainerId}/screening`}
        accent="claude"
        steps={trainer.screening_steps.map((entry) => ({
          key: entry.step,
          title: screeningStepTitles[entry.step as ScreeningStepKey],
          tone:
            entry.status === "PASSED"
              ? "passed"
              : entry.status === "FAILED"
                ? "failed"
                : "neutral",
          label: screeningStatusConfig[entry.status].label,
          labelVariant: screeningStatusConfig[entry.status].variant,
        }))}
      />

      <PathwaySection
        title="Certification Pathway"
        href={`/trainers/${trainerId}/certification`}
        steps={trainer.certification_steps.map((entry) => ({
          key: entry.step,
          title: certificationStepTitles[entry.step as CertificationStepKey],
          tone:
            entry.status === "PASSED"
              ? "passed"
              : entry.status === "FAILED"
                ? "failed"
                : entry.status === "IN_PROGRESS"
                  ? "active"
                  : "neutral",
          label: certificationStatusConfig[entry.status].label,
          labelVariant: certificationStatusConfig[entry.status].variant,
        }))}
      />

    </div>
  );
}
