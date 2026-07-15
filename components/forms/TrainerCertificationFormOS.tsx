"use client";

import AppButton from "@/components/buttons/AppButton";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import Label, { type LabelVariant } from "@/components/labels/Label";
import ProgressBar from "@/components/labels/ProgressBar";
import TrainerLevelLabel from "@/components/labels/TrainerLevelLabel";
import TrainerStageLabel from "@/components/labels/TrainerStageLabel";
import { trpc } from "@/trpc/client";
import type {
  TrainerCertificationStatusEnum,
  TrainerLevelEnum,
  TrainerStageEnum,
} from "@prisma/client";
import {
  Award,
  BookOpen,
  Check,
  CircleUserRound,
  Clock,
  FileText,
  HelpCircle,
  Presentation,
  Users,
  Video,
} from "lucide-react";
import Image from "next/image";

// Mirrors CERTIFICATION_STEP_KEYS in trpc/routers/trainer-pool/trainer-pool.shared.ts
type CertificationStepKey =
  | "ORIENTATION"
  | "MATERIAL_MASTERY"
  | "SHADOWING"
  | "CO_TRAINING"
  | "SOLO_OBSERVED_DELIVERY"
  | "CERTIFICATION_DECISION";

const statusOptions: AppSelectOption[] = [
  { value: "NOT_STARTED", label: "Belum mulai" },
  { value: "IN_PROGRESS", label: "Sedang berlangsung" },
  { value: "PASSED", label: "Lulus" },
  { value: "FAILED", label: "Tidak lulus" },
];

const statusLabelConfig: Record<
  TrainerCertificationStatusEnum,
  { label: string; variant: LabelVariant }
> = {
  NOT_STARTED: { label: "Belum mulai", variant: "gray" },
  IN_PROGRESS: { label: "Sedang berlangsung", variant: "kuning" },
  PASSED: { label: "Lulus", variant: "hijau" },
  FAILED: { label: "Tidak lulus", variant: "merah" },
};

type StepMeta = {
  icon: typeof Award;
  title: string;
  description: string;
  checklistTitle: string;
  checklist: string[];
  estimate?: string;
};

// Copy is addressed to the admin/evaluator assessing the candidate, not to
// the trainer being assessed.
const stepMeta: Record<CertificationStepKey, StepMeta> = {
  ORIENTATION: {
    icon: FileText,
    title: "Orientasi",
    description:
      "Pastikan kandidat sudah memahami standar, nilai, dan alur sertifikasi trainer sebelum lanjut ke tahap berikutnya.",
    checklistTitle: "Yang perlu diverifikasi",
    checklist: [
      "Kandidat sudah menonton video orientasi",
      "Kandidat sudah membaca Trainer Handbook",
      "Kandidat sudah menyetujui kode etik",
    ],
    estimate: "30 menit",
  },
  MATERIAL_MASTERY: {
    icon: BookOpen,
    title: "Penguasaan materi",
    description:
      "Nilai pemahaman kandidat terhadap materi inti dan capaian pembelajaran.",
    checklistTitle: "Yang perlu diverifikasi",
    checklist: [
      "Kandidat sudah mempelajari materi dan sumber belajar",
      "Kandidat sudah menyelesaikan quiz pemahaman",
      "Skor quiz kandidat minimal 80%",
    ],
    estimate: "1-2 jam",
  },
  SHADOWING: {
    icon: Presentation,
    title: "Shadowing",
    description:
      "Amati kandidat saat mengikuti sesi pelatihan langsung untuk menilai kesiapannya.",
    checklistTitle: "Yang perlu diverifikasi",
    checklist: [
      "Kandidat sudah mengikuti sesi pelatihan langsung/rekaman",
      "Kandidat sudah mengisi lembar observasi",
      "Kandidat sudah menyerahkan refleksi dan catatan penting",
    ],
  },
  CO_TRAINING: {
    icon: Users,
    title: "Co-training",
    description:
      "Nilai kemampuan kandidat saat memfasilitasi sesi bersama trainer bersertifikat.",
    checklistTitle: "Yang perlu diverifikasi",
    checklist: [
      "Kandidat sudah menjadwalkan sesi co-training",
      "Kandidat memimpin sebagian segmen sesi",
      "Kandidat menerima feedback dari lead trainer",
    ],
  },
  SOLO_OBSERVED_DELIVERY: {
    icon: Video,
    title: "Solo observed delivery",
    description:
      "Evaluasi kandidat saat membawakan sesi secara mandiri di bawah pengawasan.",
    checklistTitle: "Yang perlu diverifikasi",
    checklist: [
      "Kandidat sudah menyiapkan rencana sesi",
      "Kandidat membawakan sesi secara mandiri",
      "Kandidat menerima feedback dan skor dari observer",
    ],
  },
  CERTIFICATION_DECISION: {
    icon: Award,
    title: "Keputusan sertifikasi",
    description:
      "Tinjau seluruh hasil penilaian untuk memutuskan status sertifikasi kandidat.",
    checklistTitle: "Yang terjadi di tahap ini",
    checklist: [
      "Komite sertifikasi meninjau seluruh hasil kandidat",
      "Kandidat akan diberi tahu soal keputusan akhir",
      "Jika disetujui, kandidat masuk ke pool trainer bersertifikat",
    ],
  },
};

type Step = {
  step: CertificationStepKey;
  status: TrainerCertificationStatusEnum;
  recommended_sessions: number;
};

export default function TrainerCertificationFormOS({
  trainerId,
  trainer,
  steps,
}: {
  trainerId: string;
  trainer: {
    full_name: string;
    avatar: string | null;
    ai_experience_years: number;
    stage: TrainerStageEnum;
    level: TrainerLevelEnum;
  };
  steps: Step[];
}) {
  const utils = trpc.useUtils();
  const mutation = trpc.update.trainerPool.certificationStep.useMutation({
    onSuccess: () => {
      utils.read.trainerPool.trainer.invalidate({ id: trainerId });
      utils.list.trainerPool.trainers.invalidate();
    },
  });

  function update(entry: Step, status: TrainerCertificationStatusEnum) {
    mutation.mutate({
      trainer_id: trainerId,
      step: entry.step,
      status,
    });
  }

  const passedCount = steps.filter((entry) => entry.status === "PASSED").length;
  const otherStepsPassed = steps
    .filter((entry) => entry.step !== "CERTIFICATION_DECISION")
    .every((entry) => entry.status === "PASSED");

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
        <div className="flex flex-wrap items-start justify-between gap-4">
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
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-zinc-100">
                Ringkasan sertifikasi
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Nilai kandidat di setiap tahap untuk menentukan kesiapannya
                menjadi trainer bersertifikat.
              </p>
            </div>
            <div className="w-full sm:w-40 sm:shrink-0">
              <p className="mb-1 text-right text-xs font-semibold text-gray-600 dark:text-zinc-300">
                {passedCount} dari {steps.length} selesai
              </p>
              <ProgressBar
                value={passedCount}
                total={steps.length}
                variant={passedCount === steps.length ? "hijau" : "claude"}
              />
            </div>
          </div>
        </div>
        {mutation.error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
            {mutation.error.message}
          </p>
        )}
      </section>

      <div className="flex flex-col">
        {steps.map((entry, index) => {
          const meta = stepMeta[entry.step];
          const StepIcon = meta.icon;
          const isDecision = entry.step === "CERTIFICATION_DECISION";
          const isLast = index === steps.length - 1;
          const decisionLocked = isDecision && !otherStepsPassed;

          return (
            <div key={entry.step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                    entry.status === "PASSED"
                      ? "border-hijau bg-hijau text-white"
                      : entry.status === "FAILED"
                        ? "border-merah bg-merah text-white"
                        : entry.status === "IN_PROGRESS"
                          ? "border-claude bg-claude/10 text-claude"
                          : "border-gray-300 bg-gray-50 text-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
                  }`}
                >
                  {entry.status === "PASSED" ? (
                    <Check size={16} />
                  ) : (
                    index + 1
                  )}
                </span>
                {!isLast && (
                  <div className="w-0.5 flex-1 bg-gray-200 dark:bg-zinc-800" />
                )}
              </div>

              <div
                className={`mb-5 flex-1 rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700 ${
                  decisionLocked ? "opacity-70" : ""
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-claude/10 text-claude">
                      <StepIcon size={20} />
                    </span>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-zinc-100">
                        {meta.title}
                      </h4>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {meta.description}
                      </p>
                    </div>
                  </div>
                  <Label variant={statusLabelConfig[entry.status].variant}>
                    {statusLabelConfig[entry.status].label}
                  </Label>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_190px]">
                  <div className="rounded-lg bg-biru-t px-4 py-3 dark:bg-blue-950/30">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#3a68b0] dark:text-blue-300">
                      {meta.checklistTitle}
                    </p>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {meta.checklist.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-xs text-gray-600 dark:text-zinc-300"
                        >
                          <Check
                            size={13}
                            className="mt-0.5 shrink-0 text-[#3a68b0] dark:text-blue-300"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-2">
                    {meta.estimate && (
                      <div className="rounded-lg border border-gray-200 p-3 dark:border-zinc-800">
                        <p className="text-xs text-gray-500">
                          Estimasi waktu
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-zinc-100">
                          <Clock size={13} className="text-gray-400" />
                          {meta.estimate}
                        </p>
                      </div>
                    )}
                    {entry.recommended_sessions > 0 && (
                      <div className="rounded-lg border border-gray-200 p-3 dark:border-zinc-800">
                        <p className="text-xs text-gray-500">
                          Rekomendasi sesi
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-zinc-100">
                          <Users size={13} className="text-gray-400" />
                          {entry.recommended_sessions} sesi
                        </p>
                      </div>
                    )}
                    {isDecision && (
                      <div className="rounded-lg border border-gray-200 p-3 dark:border-zinc-800">
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-zinc-100">
                          {decisionLocked
                            ? "Menunggu peninjauan"
                            : statusLabelConfig[entry.status].label}
                        </p>
                      </div>
                    )}
                    <AppSelect
                      selectId={`certification-${entry.step}`}
                      placeholder="Ubah status"
                      value={entry.status}
                      options={statusOptions}
                      disabled={decisionLocked}
                      onChange={(value) =>
                        update(entry, value as TrainerCertificationStatusEnum)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-claude/10 text-claude">
            <HelpCircle size={18} />
          </span>
          <div>
            <p className="font-semibold text-gray-900 dark:text-zinc-100">
              Butuh bantuan?
            </p>
            <p className="text-xs text-gray-500">
              Jika ada pertanyaan atau butuh bantuan selama proses penilaian
              sertifikasi, hubungi tim support trainer.
            </p>
          </div>
        </div>
        <AppButton
          variant="outline"
          size="sm"
          onClick={() =>
            window.open("mailto:support@ailene.id", "_blank")
          }
        >
          Hubungi support
        </AppButton>
      </section>
    </div>
  );
}
