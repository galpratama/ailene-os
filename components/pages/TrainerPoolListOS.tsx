"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import CreateTrainerFormOS from "@/components/forms/CreateTrainerFormOS";
import ProgressBar from "@/components/labels/ProgressBar";
import TrainerLevelLabel from "@/components/labels/TrainerLevelLabel";
import TrainerStatusLabel from "@/components/labels/TrainerStatusLabel";
import { useHeaderAction } from "@/contexts/HeaderActionContext";
import { setSessionToken, trpc } from "@/trpc/client";
import type {
  TrainerLevelEnum,
  TrainerStatusEnum,
} from "@prisma/client";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Crown,
  Plus,
  Search,
  Sparkles,
  UserRoundSearch,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const statusOptions: AppSelectOption[] = [
  { value: "", label: "All statuses" },
  { value: "CANDIDATE", label: "Candidate" },
  { value: "CERTIFIED", label: "Certified" },
  { value: "ACTIVE", label: "Active" },
  { value: "REMEDIAL", label: "Remedial" },
  { value: "INACTIVE", label: "Inactive" },
];
const levelOptions: AppSelectOption[] = [
  { value: "", label: "All levels" },
  { value: "APPRENTICE", label: "Apprentice" },
  { value: "CERTIFIED", label: "Certified Trainer" },
  { value: "SENIOR", label: "Senior / Specialist" },
  { value: "LEAD", label: "Lead Trainer" },
];

export default function TrainerPoolListOS({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  useHeaderAction({
    label: "Add Candidate",
    icon: Plus,
    onClick: () => setIsCreateOpen(true),
  });
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<
    string | undefined
  >();
  const [status, setStatus] = useState<TrainerStatusEnum | "">("");
  const [level, setLevel] = useState<TrainerLevelEnum | "">("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedKeyword(keyword.trim() || undefined);
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [keyword]);

  const { data, isLoading, isError } =
    trpc.list.trainerPool.trainers.useQuery(
      {
        page,
        page_size: 20,
        keyword: debouncedKeyword,
        status: status || undefined,
        level: level || undefined,
      },
      { enabled: !!sessionToken }
    );
  const summaryCards: {
    label: string;
    value: number;
    icon: typeof UserRoundSearch;
    apply?: () => void;
    isActive?: boolean;
  }[] = [
    {
      label: "Candidate funnel",
      value: data?.summary.candidates ?? 0,
      icon: UserRoundSearch,
      apply: () => {
        setStatus((current) => (current === "CANDIDATE" ? "" : "CANDIDATE"));
        setPage(1);
      },
      isActive: status === "CANDIDATE",
    },
    {
      label: "Certified pool",
      value: data?.summary.certified ?? 0,
      icon: BadgeCheck,
    },
    {
      label: "Active monthly",
      value: data?.summary.active ?? 0,
      icon: Sparkles,
      apply: () => {
        setStatus((current) => (current === "ACTIVE" ? "" : "ACTIVE"));
        setPage(1);
      },
      isActive: status === "ACTIVE",
    },
    {
      label: "Lead specialist",
      value: data?.summary.leads ?? 0,
      icon: Crown,
      apply: () => {
        setLevel((current) => (current === "LEAD" ? "" : "LEAD"));
        setPage(1);
      },
      isActive: level === "LEAD",
    },
  ];
  const totalPage = data?.metapaging.total_page ?? 1;

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
          Trainer Pool
        </h2>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
          Recruit, certify, assign, and maintain trainer quality in one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const cardClassName = `rounded-xl border p-5 text-left transition-colors ${
            card.isActive
              ? "border-claude bg-claude/5"
              : "border-gray-300 bg-card-bg"
          } ${card.apply ? "cursor-pointer hover:border-claude/60" : ""}`;
          const cardContent = (
            <>
              <card.icon size={17} className="text-claude" />
              <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-zinc-100">
                {card.value}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">
                {card.label}
              </p>
            </>
          );
          return card.apply ? (
            <button
              key={card.label}
              type="button"
              onClick={card.apply}
              className={cardClassName}
            >
              {cardContent}
            </button>
          ) : (
            <div key={card.label} className={cardClassName}>
              {cardContent}
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_180px]">
        <AppInput
          inputId="trainer-search"
          icon={<Search size={14} />}
          placeholder="Search name or email..."
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <AppSelect
          selectId="trainer-status-filter"
          placeholder="All statuses"
          value={status}
          onChange={(value) => {
            setStatus((value as TrainerStatusEnum) ?? "");
            setPage(1);
          }}
          options={statusOptions}
        />
        <AppSelect
          selectId="trainer-level-filter"
          placeholder="All levels"
          value={level}
          onChange={(value) => {
            setLevel((value as TrainerLevelEnum) ?? "");
            setPage(1);
          }}
          options={levelOptions}
        />
      </div>

      {isLoading && (
        <p className="py-8 text-center text-sm text-gray-400">
          Loading trainers...
        </p>
      )}
      {isError && (
        <p className="py-8 text-center text-sm text-red-500">
          Failed to load trainer pool.
        </p>
      )}
      {data && !isLoading && !isError && (
        <div className="overflow-x-auto rounded-xl border border-gray-300 bg-card-bg">
          <table className="w-full min-w-230 text-sm">
            <thead>
              <tr className="border-b border-gray-300 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-5 py-3">Trainer</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Level</th>
                <th className="px-5 py-3">Specialization</th>
                <th className="px-5 py-3">Progress</th>
                <th className="px-5 py-3">Rating</th>
              </tr>
            </thead>
            <tbody>
              {data.list.map((trainer) => (
                <tr
                  key={trainer.id}
                  className="border-b border-gray-200 last:border-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/trainers/${trainer.id}`}
                      className="font-semibold text-gray-900 hover:text-claude dark:text-zinc-100"
                    >
                      {trainer.full_name}
                      <span className="mt-0.5 block text-xs font-normal text-gray-500">
                        {trainer.email}
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">
                    <TrainerStatusLabel status={trainer.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <TrainerLevelLabel level={trainer.level} />
                  </td>
                  <td className="max-w-70 px-5 py-3.5 text-gray-600 dark:text-zinc-300">
                    {trainer.specializations.map((entry) => entry.name).join(", ") ||
                      "—"}
                  </td>
                  <td className="min-w-32 px-5 py-3.5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-14 shrink-0 text-[11px] text-gray-400">
                          Screen
                        </span>
                        <ProgressBar
                          value={trainer.screening_progress.passed}
                          total={trainer.screening_progress.total}
                          variant={
                            trainer.screening_progress.passed ===
                            trainer.screening_progress.total
                              ? "hijau"
                              : "claude"
                          }
                        />
                        <span className="w-7 shrink-0 text-right text-[11px] font-semibold text-gray-500">
                          {trainer.screening_progress.passed}/
                          {trainer.screening_progress.total}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-14 shrink-0 text-[11px] text-gray-400">
                          Certify
                        </span>
                        <ProgressBar
                          value={trainer.certification_progress.passed}
                          total={trainer.certification_progress.total}
                          variant={
                            trainer.certification_progress.passed ===
                            trainer.certification_progress.total
                              ? "hijau"
                              : "claude"
                          }
                        />
                        <span className="w-7 shrink-0 text-right text-[11px] font-semibold text-gray-500">
                          {trainer.certification_progress.passed}/
                          {trainer.certification_progress.total}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-gray-700 dark:text-zinc-200">
                    {trainer.average_rating?.toFixed(1) ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.list.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">
              No trainers match these filters.
            </p>
          )}
        </div>
      )}

      {totalPage > 1 && (
        <div className="flex items-center justify-center gap-3">
          <AppButton
            variant="outline"
            size="iconSm"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            <ChevronLeft size={14} />
          </AppButton>
          <span className="text-xs text-gray-500">
            Page {page} of {totalPage}
          </span>
          <AppButton
            variant="outline"
            size="iconSm"
            disabled={page >= totalPage}
            onClick={() => setPage((current) => current + 1)}
          >
            <ChevronRight size={14} />
          </AppButton>
        </div>
      )}

      <CreateTrainerFormOS
        sessionToken={sessionToken}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
