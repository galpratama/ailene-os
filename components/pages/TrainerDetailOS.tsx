"use client";

import AppButton from "@/components/buttons/AppButton";
import AppTextArea from "@/components/fields/AppTextArea";
import Label, { type LabelVariant } from "@/components/labels/Label";
import TrainerStatusLabel from "@/components/labels/TrainerStatusLabel";
import type { CertificationStatus, ScreeningStatus, TrainerStage } from "@/apis/trainers";
import { getTrainerDetails, updateTrainer } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
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
import { useState } from "react";
import { showErrorToast } from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Mirrors CertificationStepKey in trpc/routers/trainer-pool/trainer-pool.shared.ts
type CertificationStepKey =
  | "orientation"
  | "material_mastery"
  | "shadowing"
  | "co_training"
  | "solo_observed_delivery"
  | "certification_decision";

const certificationStepTitles: Record<CertificationStepKey, string> = {
  orientation: "Orientation",
  material_mastery: "Material Mastery",
  shadowing: "Shadowing",
  co_training: "Co-training",
  solo_observed_delivery: "Solo Observed Delivery",
  certification_decision: "Certification Decision",
};

const certificationStatusConfig: Record<
  CertificationStatus,
  { label: string; variant: LabelVariant }
> = {
  not_started: { label: "Not started", variant: "gray" },
  in_progress: { label: "In progress", variant: "kuning" },
  passed: { label: "Completed", variant: "hijau" },
  failed: { label: "Failed", variant: "merah" },
};

// Mirrors ScreeningStepKey in trpc/routers/trainer-pool/trainer-pool.shared.ts
type ScreeningStepKey =
  | "application_review"
  | "interview"
  | "teaching_demo"
  | "practical_test"
  | "reference_check";

const screeningStepTitles: Record<ScreeningStepKey, string> = {
  application_review: "Application Review",
  interview: "Interview",
  teaching_demo: "Teaching Demo",
  practical_test: "Practical Test",
  reference_check: "Reference Check",
};

const screeningStatusConfig: Record<
  ScreeningStatus,
  { label: string; variant: LabelVariant }
> = {
  pending: { label: "Pending", variant: "gray" },
  passed: { label: "Passed", variant: "biru" },
  failed: { label: "Failed", variant: "merah" },
  skipped: { label: "Skipped", variant: "gray" },
};

const stageValueText: Record<TrainerStage, string> = {
  candidate: "Candidate",
  qualified: "Qualified",
  not_qualified: "Not qualified",
  eligible: "Eligible",
  not_eligible: "Not eligible",
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
  const queryClient = useQueryClient();
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState("");
  const { data: trainer, isLoading, isError } = useQuery({
    queryKey: ["trainers", "details", trainerId],
    queryFn: async () => requireApiData(await getTrainerDetails(trainerId)),
    enabled: !!sessionToken,
  });

  const updateTrainerMutation = useMutation({
    mutationFn: async (payload: Parameters<typeof updateTrainer>[0]) =>
      requireApiData(await updateTrainer(payload)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["trainers"] });
    },
    onError: (error) => showErrorToast(error),
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
    if (!trainer) return;
    updateTrainerMutation.mutate(
      {
        id: trainerId,
        phone: trainer.phone,
        source: trainer.source,
        level: trainer.level,
        status: trainer.status,
        ai_experience_years: trainer.ai_experience_years,
        referred_by: trainer.referred_by,
        notes: notesDraft.trim() || null,
        specialization_ids: trainer.specializations.map((specialization) => specialization.id),
      },
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
          {trainer.avatar ? (
            <Image
              src={trainer.avatar}
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
              {trainer.status === "inactive" && (
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
                {trainer.phone ?? "No WhatsApp"}
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
                  {trainer.level === "senior" ? "Senior" : "Junior"}
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

       {trainer.referred_by_name && (
        <section className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
          <h3 className="font-bold text-gray-900 dark:text-zinc-100">
            Professional Information
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoTile
              icon={UserPlus}
              label="Referred by"
               value={trainer.referred_by_name}
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
                disabled={updateTrainerMutation.isPending}
              >
                Save
              </AppButton>
            </div>
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
            entry.status === "passed"
              ? "passed"
              : entry.status === "failed"
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
            entry.status === "passed"
              ? "passed"
              : entry.status === "failed"
                ? "failed"
                : entry.status === "in_progress"
                  ? "active"
                  : "neutral",
          label: certificationStatusConfig[entry.status].label,
          labelVariant: certificationStatusConfig[entry.status].variant,
        }))}
      />

    </div>
  );
}
