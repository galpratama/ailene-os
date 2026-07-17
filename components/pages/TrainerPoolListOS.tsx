"use client";

import ViewModeToggleOS, {
  type ViewModeOS,
} from "@/components/buttons/ViewModeToggleOS";
import AppInput from "@/components/fields/AppInput";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import CreateTrainerFormOS from "@/components/forms/CreateTrainerFormOS";
import ProgressBar from "@/components/labels/ProgressBar";
import TrainerLevelLabel from "@/components/labels/TrainerLevelLabel";
import TrainerStageLabel from "@/components/labels/TrainerStageLabel";
import AppPaginationOS from "@/components/navigations/AppPaginationOS";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import { usePersistedViewMode } from "@/hooks/usePersistedViewMode";
import { setSessionToken, trpc } from "@/trpc/client";
import type {
  TrainerLevelEnum,
  TrainerStageEnum,
} from "@prisma/client";
import {
  BadgeCheck,
  CircleUserRound,
  Crown,
  LayoutGrid,
  Plus,
  Search,
  ShieldCheck,
  Table2,
  UserRoundSearch,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const viewModeOptions = [
  { value: "cards" as const, label: "Cards", icon: LayoutGrid },
  { value: "table" as const, label: "Table", icon: Table2 },
];

const stageOptions: AppSelectOption[] = [
  { value: "", label: "All stages" },
  { value: "CANDIDATE", label: "Candidate" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "NOT_QUALIFIED", label: "Not qualified" },
  { value: "ELIGIBLE", label: "Eligible" },
  { value: "NOT_ELIGIBLE", label: "Not eligible" },
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

  const router = useRouter();
  const [viewMode, setViewMode] = usePersistedViewMode<ViewModeOS>(
    "trainers_view_mode",
    ["cards", "table"],
    "cards"
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<
    string | undefined
  >();
  const [stage, setStage] = useState<TrainerStageEnum | "">("");
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
        stage: stage || undefined,
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
        setStage((current) => (current === "CANDIDATE" ? "" : "CANDIDATE"));
        setPage(1);
      },
      isActive: stage === "CANDIDATE",
    },
    {
      label: "Qualified",
      value: data?.summary.qualified ?? 0,
      icon: ShieldCheck,
      apply: () => {
        setStage((current) => (current === "QUALIFIED" ? "" : "QUALIFIED"));
        setPage(1);
      },
      isActive: stage === "QUALIFIED",
    },
    {
      label: "Certified pool",
      value: data?.summary.eligible ?? 0,
      icon: BadgeCheck,
      apply: () => {
        setStage((current) => (current === "ELIGIBLE" ? "" : "ELIGIBLE"));
        setPage(1);
      },
      isActive: stage === "ELIGIBLE",
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

      <div className="flex flex-wrap items-center gap-3">
        <AppInput
          inputId="trainer-search"
          icon={<Search size={14} />}
          placeholder="Search name or email..."
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className="max-w-full sm:max-w-sm"
        />
        <div className="w-full max-w-45">
          <AppSelect
            selectId="trainer-stage-filter"
            placeholder="All stages"
            value={stage}
            onChange={(value) => {
              setStage((value as TrainerStageEnum) ?? "");
              setPage(1);
            }}
            options={stageOptions}
          />
        </div>
        <div className="w-full max-w-45">
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
        <ViewModeToggleOS
          value={viewMode}
          onChange={setViewMode}
          options={viewModeOptions}
          className="ml-auto"
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
      {data && !isLoading && !isError && viewMode === "cards" && (
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
                    <TrainerStageLabel stage={trainer.stage} />
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

      {data && !isLoading && !isError && viewMode === "table" && (
        <div className="overflow-hidden rounded-xl border border-gray-300 bg-card-bg dark:border-zinc-700">
          <div className="overflow-x-auto">
            <table className="w-full min-w-210 text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-800">
                  <th className="px-5 py-3">Trainer</th>
                  <th className="px-5 py-3">Stage</th>
                  <th className="px-5 py-3">Level</th>
                  <th className="px-5 py-3">Specializations</th>
                  <th className="px-5 py-3">Screen</th>
                  <th className="px-5 py-3">Certify</th>
                </tr>
              </thead>
              <tbody>
                {data.list.map((trainer) => (
                  <tr
                    key={trainer.id}
                    onClick={() => router.push(`/trainers/${trainer.id}`)}
                    className="cursor-pointer border-b border-gray-200 last:border-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        {trainer.avatar ? (
                          <Image
                            src={trainer.avatar}
                            alt={trainer.full_name}
                            width={32}
                            height={32}
                            className="size-8 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-claude text-white">
                            <CircleUserRound size={18} fill="currentColor" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900 dark:text-zinc-100">
                            {trainer.full_name}
                          </p>
                          <p className="truncate text-xs text-gray-400">
                            {trainer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <TrainerStageLabel stage={trainer.stage} />
                    </td>
                    <td className="px-5 py-3.5">
                      <TrainerLevelLabel level={trainer.level} />
                    </td>
                    <td className="px-5 py-3.5 max-w-52 truncate text-gray-600 dark:text-zinc-300">
                      {trainer.specializations
                        .map((entry) => entry.name)
                        .join(", ") || "No specialization set"}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
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
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
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
        </div>
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
