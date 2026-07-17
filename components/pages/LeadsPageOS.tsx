"use client";

import AppInput from "@/components/fields/AppInput";
import AppSelect, { type AppSelectOption } from "@/components/fields/AppSelect";
import CreateLeadFormOS from "@/components/forms/CreateLeadFormOS";
import EditLeadFormOS from "@/components/forms/EditLeadFormOS";
import ProbabilityStatusLabel from "@/components/labels/ProbabilityStatusLabel";
import StageLabel from "@/components/labels/StageLabel";
import AppPaginationOS from "@/components/navigations/AppPaginationOS";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import ViewModeToggleOS, {
  type ViewModeOS,
} from "@/components/buttons/ViewModeToggleOS";
import { usePersistedViewMode } from "@/hooks/usePersistedViewMode";
import { getRupiahCurrency, getShortRupiahCurrency } from "@/lib/currency";
import { setSessionToken, trpc } from "@/trpc/client";
import type { B2BStageEnum } from "@prisma/client";
import {
  Building2,
  Kanban,
  LayoutGrid,
  Plus,
  Search,
  Table2,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const scorecards = [
  { key: "pipeline_value" as const, label: "Pipeline Value" },
  { key: "weighted_value" as const, label: "Weighted Value" },
  { key: "closed_won_value" as const, label: "Closed Won" },
];

const stageOptions: AppSelectOption[] = [
  { value: "", label: "All Stages" },
  { value: "LEAD_IDENTIFIED", label: "Lead Identified" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "VERBAL_COMMIT", label: "Verbal Commit" },
  { value: "CLOSED_WON", label: "Closed Won" },
  { value: "CLOSED_LOST", label: "Closed Lost" },
  { value: "ON_HOLD", label: "On Hold" },
];

const viewModeOptions = [
  { value: "kanban" as const, label: "Kanban", icon: Kanban },
  { value: "cards" as const, label: "Cards", icon: LayoutGrid },
  { value: "table" as const, label: "Table", icon: Table2 },
];

// Kanban column order + accent dot, mirrored from StageLabel's color mapping.
const stageColumns: { value: B2BStageEnum; label: string; dot: string }[] = [
  { value: "LEAD_IDENTIFIED", label: "Lead Identified", dot: "bg-gray-400" },
  { value: "CONTACTED", label: "Contacted", dot: "bg-biru" },
  { value: "NEGOTIATION", label: "Negotiation", dot: "bg-pink" },
  { value: "VERBAL_COMMIT", label: "Verbal Commit", dot: "bg-kuning" },
  { value: "CLOSED_WON", label: "Closed Won", dot: "bg-hijau" },
  { value: "CLOSED_LOST", label: "Closed Lost", dot: "bg-merah" },
  { value: "ON_HOLD", label: "On Hold", dot: "bg-gray-400" },
];

export default function LeadsPageOS({ sessionToken }: { sessionToken: string }) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const utils = trpc.useUtils();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPipelineId, setEditingPipelineId] = useState<number | null>(null);

  const [viewMode, setViewMode] = usePersistedViewMode<ViewModeOS>(
    "leads_view_mode",
    ["kanban", "cards", "table"],
    "cards"
  );

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<string | undefined>();
  const [stageFilter, setStageFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const pageSize = 21;
  const isBoardView = viewMode === "kanban";

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword.trim() === "" ? undefined : keyword.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [keyword]);

  // Kanban needs every matching lead on screen at once (grouped by stage),
  // so it bypasses normal pagination the same way the Tasks board does.
  const { data, isLoading, isError } = trpc.list.b2b.pipelines.useQuery(
    {
      page: isBoardView ? 1 : page,
      page_size: isBoardView ? 500 : pageSize,
      keyword: debouncedKeyword,
      stage: (stageFilter || undefined) as B2BStageEnum | undefined,
      owner_id: ownerFilter || undefined,
    },
    { enabled: !!sessionToken }
  );

  const { data: userData } = trpc.list.users.useQuery(
    { page: 1, page_size: 200 },
    { enabled: !!sessionToken }
  );
  const ownerOptions: AppSelectOption[] = [
    { value: "", label: "All Owners" },
    ...(userData?.list.map((u) => ({
      value: u.id,
      label: u.full_name,
      image: u.avatar ?? undefined,
    })) ?? []),
  ];

  const pipelineList = data?.list;
  const totalPage = data?.metapaging.total_page ?? 1;

  const updatePipelineStage = trpc.update.b2b.pipeline.useMutation();

  // Optimistic local overrides so a Kanban drag feels instant while the
  // mutation is in flight — same pattern as the Tasks board.
  const [movedStages, setMovedStages] = useState<
    Partial<Record<number, B2BStageEnum>>
  >({});

  const board = useMemo(
    () =>
      pipelineList?.map((post) => {
        const stage = movedStages[post.id];
        return stage ? { ...post, stage } : post;
      }) ?? [],
    [pipelineList, movedStages]
  );

  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverStage, setDragOverStage] = useState<B2BStageEnum | null>(null);

  const moveTo = (id: number, stage: B2BStageEnum) => {
    const current = board.find((b) => b.id === id);
    if (!current || current.stage === stage) return;
    const prevStage = current.stage;
    setMovedStages((prev) => ({ ...prev, [id]: stage }));
    updatePipelineStage.mutate(
      { id, stage },
      {
        onError: () => {
          setMovedStages((prev) => ({ ...prev, [id]: prevStage }));
        },
        onSuccess: () => utils.list.b2b.pipelines.invalidate(),
      }
    );
  };

  const handleDrop =
    (stage: B2BStageEnum) => (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOverStage(null);
      const id = draggedId;
      setDraggedId(null);
      if (id != null) moveTo(id, stage);
    };

  return (
    <div className="px-4 py-6 flex flex-col gap-5 sm:px-8">
      <PageHeaderOS
        title="Leads"
        description="Track and manage every lead across the B2B sales pipeline"
        action={{
          label: "Add Lead",
          icon: Plus,
          onClick: () => setIsCreateOpen(true),
        }}
      />

      {/* Scorecards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {scorecards.map((sc) => (
          <div
            key={sc.key}
            className="bg-card-bg rounded-xl border border-dashboard-border p-5 flex flex-col gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-claude/10 flex items-center justify-center">
              <Wallet size={16} className="text-claude" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
                {getShortRupiahCurrency(data?.scorecards[sc.key] ?? 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{sc.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <AppInput
          inputId="leads-search"
          icon={<Search size={14} />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search company, PIC, or email..."
          className="max-w-full sm:max-w-sm"
        />
        <div className="w-full max-w-52">
          <AppSelect
            selectId="leads-stage-filter"
            placeholder="All Stages"
            value={stageFilter}
            options={stageOptions}
            onChange={(value) => {
              setStageFilter((value as string) ?? "");
              setPage(1);
            }}
          />
        </div>
        <div className="w-full max-w-56">
          <AppSelect
            selectId="leads-owner-filter"
            placeholder="All Owners"
            value={ownerFilter}
            options={ownerOptions}
            onChange={(value) => {
              setOwnerFilter((value as string) ?? "");
              setPage(1);
            }}
          />
        </div>
        <ViewModeToggleOS
          value={viewMode}
          onChange={setViewMode}
          options={viewModeOptions}
          className="ml-auto"
        />
      </div>

      {isLoading && <p className="text-sm text-gray-400 dark:text-zinc-500 py-8 text-center">Loading leads...</p>}
      {isError && (
        <p className="text-sm text-red-500 py-8 text-center">
          Failed to load leads. You may not have access to this data.
        </p>
      )}

      {pipelineList && !isLoading && !isError && viewMode === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-1">
          {stageColumns.map((col) => {
            const items = board.filter((b) => b.stage === col.value);
            const isOver = dragOverStage === col.value;
            return (
              <div
                key={col.value}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverStage(col.value);
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget === e.target) setDragOverStage(null);
                }}
                onDrop={handleDrop(col.value)}
                className={`flex w-70 shrink-0 flex-col max-h-128 gap-2 rounded-xl border p-3 transition-colors ${
                  isOver
                    ? "border-claude bg-claude/5"
                    : "border-dashboard-border bg-dashboard-bg"
                }`}
              >
                <div className="flex items-center justify-between px-1 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-zinc-300">
                      {col.label}
                    </span>
                  </div>
                  <span
                    className={`flex size-5 items-center justify-center rounded-full text-[11px] font-bold text-white ${col.dot}`}
                  >
                    {items.length}
                  </span>
                </div>

                <div className="flex flex-1 min-h-0 flex-col gap-2 overflow-y-auto">
                  {items.map((post) => (
                    <div
                      key={post.id}
                      draggable
                      onDragStart={() => setDraggedId(post.id)}
                      onDragEnd={() => setDraggedId(null)}
                      onClick={() => setEditingPipelineId(post.id)}
                      className={`rounded-lg border border-dashboard-border bg-card-bg p-3 flex flex-col gap-2 cursor-grab active:cursor-grabbing transition-opacity hover:border-claude/40 ${
                        draggedId === post.id ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800">
                          {post.company_image_url ? (
                            <Image
                              src={post.company_image_url}
                              alt={post.company_name}
                              width={28}
                              height={28}
                              className="size-full object-cover"
                            />
                          ) : (
                            <Building2 size={13} className="text-gray-400" />
                          )}
                        </div>
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
                          {post.company_name}
                        </p>
                      </div>
                      <p className="truncate text-xs text-gray-500 dark:text-zinc-400">
                        {post.name}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <ProbabilityStatusLabel status={post.probability_status} />
                        <span className="text-xs font-semibold text-gray-900 dark:text-zinc-100">
                          {getShortRupiahCurrency(Number(post.project_value))}
                        </span>
                      </div>
                    </div>
                  ))}

                  {items.length === 0 && (
                    <p className="text-xs text-gray-400 dark:text-zinc-500 text-center py-6">
                      No leads
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pipelineList && !isLoading && !isError && viewMode === "table" && (
        <div className="overflow-hidden rounded-xl border border-gray-300 bg-card-bg dark:border-zinc-700">
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-800">
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Program</th>
                  <th className="px-5 py-3">Stage</th>
                  <th className="px-5 py-3">Probability</th>
                  <th className="px-5 py-3">Value</th>
                  <th className="px-5 py-3">Owner</th>
                </tr>
              </thead>
              <tbody>
                {pipelineList.map((post) => (
                  <tr
                    key={post.id}
                    onClick={() => setEditingPipelineId(post.id)}
                    className="cursor-pointer border-b border-gray-200 last:border-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800">
                          {post.company_image_url ? (
                            <Image
                              src={post.company_image_url}
                              alt={post.company_name}
                              width={32}
                              height={32}
                              className="size-full object-cover"
                            />
                          ) : (
                            <Building2 size={14} className="text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-gray-900 dark:text-zinc-100">
                            {post.company_name}
                          </p>
                          <p className="truncate text-xs text-gray-400">
                            {post.industry_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">
                      {post.name}
                    </td>
                    <td className="px-5 py-3.5">
                      <StageLabel stage={post.stage} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <ProbabilityStatusLabel status={post.probability_status} />
                        <span className="text-xs text-gray-400">
                          {post.probability}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-zinc-100">
                      {getRupiahCurrency(Number(post.project_value))}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-700 shrink-0">
                          {post.owner_avatar && (
                            <Image
                              src={post.owner_avatar}
                              alt={post.owner_name}
                              width={20}
                              height={20}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <span className="truncate text-xs text-gray-700 dark:text-zinc-300">
                          {post.owner_name}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pipelineList.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-10">
                {debouncedKeyword
                  ? `No leads found for "${debouncedKeyword}"`
                  : "No leads yet."}
              </p>
            )}
          </div>
        </div>
      )}

      {pipelineList && !isLoading && !isError && viewMode === "cards" && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pipelineList.map((post) => (
            <div
              key={post.id}
              role="button"
              tabIndex={0}
              onClick={() => setEditingPipelineId(post.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEditingPipelineId(post.id);
                }
              }}
              className="flex cursor-pointer flex-col gap-3 rounded-xl border border-gray-300 bg-card-bg p-5 text-left transition-colors hover:border-claude/60 dark:border-zinc-700"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800">
                  {post.company_image_url ? (
                    <Image
                      src={post.company_image_url}
                      alt={post.company_name}
                      width={44}
                      height={44}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Building2 size={18} className="text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold text-gray-900 dark:text-zinc-100">
                    {post.company_name}
                  </h3>
                  <p className="truncate text-xs text-gray-500 dark:text-zinc-400">
                    {post.industry_name}
                  </p>
                </div>
              </div>

              <p className="truncate text-sm text-gray-600 dark:text-zinc-300">
                {post.name}
              </p>

              <div className="flex flex-wrap items-center gap-1.5">
                <StageLabel stage={post.stage} />
                <ProbabilityStatusLabel status={post.probability_status} />
              </div>

              <div className="mt-1 flex items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-zinc-800">
                <span className="font-semibold text-gray-900 dark:text-zinc-100">
                  {getRupiahCurrency(Number(post.project_value))}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-700 shrink-0">
                    {post.owner_avatar && (
                      <Image
                        src={post.owner_avatar}
                        alt={post.owner_name}
                        width={20}
                        height={20}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span className="truncate text-xs text-gray-700 dark:text-zinc-300">
                    {post.owner_name}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {pipelineList.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-10 sm:col-span-2 xl:col-span-3">
              {debouncedKeyword
                ? `No leads found for "${debouncedKeyword}"`
                : "No leads yet."}
            </p>
          )}
        </div>
      )}

      {!isBoardView && (
        <AppPaginationOS
          currentPage={page}
          totalPages={totalPage}
          onPageChange={setPage}
        />
      )}

      <CreateLeadFormOS
        sessionToken={sessionToken}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditLeadFormOS
        sessionToken={sessionToken}
        pipelineId={editingPipelineId}
        isOpen={editingPipelineId !== null}
        onClose={() => setEditingPipelineId(null)}
      />
    </div>
  );
}
