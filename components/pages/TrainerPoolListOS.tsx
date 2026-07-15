"use client";

import AppInput from "@/components/fields/AppInput";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import CreateTrainerFormOS from "@/components/forms/CreateTrainerFormOS";
import ProgressBar from "@/components/labels/ProgressBar";
import TrainerLevelLabel from "@/components/labels/TrainerLevelLabel";
import TrainerStatusLabel from "@/components/labels/TrainerStatusLabel";
import AppPaginationOS from "@/components/navigations/AppPaginationOS";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import { setSessionToken, trpc } from "@/trpc/client";
import type {
  TrainerLevelEnum,
  TrainerStatusEnum,
} from "@prisma/client";
import {
  BadgeCheck,
  CircleUserRound,
  Crown,
  Plus,
  Search,
  Sparkles,
  UserRoundSearch,
} from "lucide-react";
import Image from "next/image";
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
  { value: "JUNIOR", label: "Junior" },
  { value: "SENIOR", label: "Senior" },
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
      label: "Senior pool",
      value: data?.summary.senior ?? 0,
      icon: Crown,
      apply: () => {
        setLevel((current) => (current === "SENIOR" ? "" : "SENIOR"));
        setPage(1);
      },
      isActive: level === "SENIOR",
    },
  ];
  const totalPage = data?.metapaging.total_page ?? 1;

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <PageHeaderOS
        title="Trainer Pool"
        description="Recruit, certify, assign, and maintain trainer quality in one place."
        action={{
          label: "Add Candidate",
          icon: Plus,
          onClick: () => setIsCreateOpen(true),
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const cardClassName = `rounded-xl border p-5 text-left transition-colors ${
            card.isActive
              ? "border-claude bg-claude/5"
              : "border-gray-300 bg-card-bg dark:border-zinc-700"
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
        <>
          {data.list.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {data.list.map((trainer) => (
                <Link
                  key={trainer.id}
                  href={`/trainers/${trainer.id}`}
                  className="flex flex-col gap-4 rounded-xl border border-gray-300 bg-card-bg p-5 transition-colors hover:border-claude/60 dark:border-zinc-700"
                >
                  <div className="flex min-w-0 items-center gap-3">
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
                      <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-zinc-400">
                        {trainer.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <TrainerStatusLabel status={trainer.status} />
                    <TrainerLevelLabel level={trainer.level} />
                  </div>

                  <p className="text-xs text-gray-600 dark:text-zinc-300">
                    {trainer.specializations
                      .map((entry) => entry.name)
                      .join(", ") || "No specialization set"}
                  </p>

                  <div className="mt-auto flex flex-col gap-1.5 border-t border-gray-200 pt-3 dark:border-zinc-800">
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
                </Link>
              ))}
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-gray-400">
              No trainers match these filters.
            </p>
          )}
        </>
      )}

      <AppPaginationOS
        currentPage={page}
        totalPages={totalPage}
        onPageChange={setPage}
      />

      <CreateTrainerFormOS
        sessionToken={sessionToken}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
