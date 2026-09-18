"use client";

import type { LeadChannel, LeadSource, PipelineData, PipelinePhase, PipelineStage } from "@/apis/sales";
import ViewModeToggleOS, { type ViewModeOS } from "@/components/buttons/ViewModeToggleOS";
import AppInput from "@/components/fields/AppInput";
import AppSelect, { type AppSelectOption } from "@/components/fields/AppSelect";
import CreateLeadFormOS from "@/components/forms/CreateLeadFormOS";
import EditLeadFormOS from "@/components/forms/EditLeadFormOS";
import StageLabel from "@/components/labels/StageLabel";
import AppPaginationOS from "@/components/navigations/AppPaginationOS";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import { useSession } from "@/contexts/SessionContext";
import { usePersistedViewMode } from "@/hooks/usePersistedViewMode";
import { useUserList } from "@/hooks/useUserList";
import { requireApiData } from "@/lib/api-result";
import { listPipelines, updatePipeline } from "@/lib/actions";
import { getRupiahCurrency } from "@/lib/currency";
import { isStageCompatibleWithLeadSource, PIPELINE_STAGE_DOTS, PIPELINE_STAGE_LABELS, PIPELINE_STAGES_BY_PHASE } from "@/lib/sales";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Kanban, LayoutGrid, Plus, Search, Table2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const viewModeOptions = [
  { value: "kanban" as const, label: "Kanban", icon: Kanban },
  { value: "cards" as const, label: "Cards", icon: LayoutGrid },
  { value: "table" as const, label: "Table", icon: Table2 },
];

const leadSourceLabels: Record<LeadSource, string> = {
  inbound: "Inbound",
  outbound: "Outbound",
};

function leadSourceLabel(source: LeadSource | null) {
  return source ? leadSourceLabels[source] : "—";
}

const leadChannelOptions: AppSelectOption[] = [
  { value: "", label: "All Channels" },
  { value: "referral", label: "Referral" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "thread", label: "Thread" },
  { value: "instagram", label: "Instagram" },
];

export default function LeadsPageOS({
  sessionToken,
  phase,
}: {
  sessionToken: string;
  phase: PipelinePhase;
}) {
  const queryClient = useQueryClient();
  const sessionUser = useSession();
  const isOwnScoped = sessionUser?.data_scope === "OWN";
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPipelineId, setEditingPipelineId] = useState<number | null>(null);
  const [viewMode, setViewMode] = usePersistedViewMode<ViewModeOS>(
    `leads_${phase}_view_mode`,
    ["kanban", "cards", "table"],
    "cards"
  );
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>();
  const [stageFilter, setStageFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const [movedStages, setMovedStages] = useState<Partial<Record<number, PipelineStage>>>({});
  const [stageError, setStageError] = useState<string | null>(null);
  const pageSize = 21;
  const isBoardView = viewMode === "kanban";

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword.trim() || undefined);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  const filters = {
    phase,
    page: isBoardView ? 1 : page,
    page_size: isBoardView ? 100 : pageSize,
    keyword: debouncedKeyword,
    stage: (stageFilter || undefined) as PipelineStage | undefined,
    lead_channel: (channelFilter || undefined) as LeadChannel | undefined,
    sales_owner_id: isOwnScoped ? undefined : ownerFilter || undefined,
  };

  const pipelineQuery = useQuery({
    queryKey: ["sales", "pipelines", filters],
    queryFn: async () => requireApiData(await listPipelines(filters)),
    enabled: !!sessionToken,
  });

  const pipelineList = pipelineQuery.data?.list;
  // From the raw list, not `board`, so an optimistic drag never becomes the stage baseline the save compares against.
  const editingPipeline = pipelineList?.find((entry) => entry.id === editingPipelineId) ?? null;
  const totalPage = pipelineQuery.data?.metapaging.total_page ?? 1;
  const board = useMemo(
    () => pipelineList?.map((entry) => ({ ...entry, stage: movedStages[entry.id] ?? entry.stage })) ?? [],
    [pipelineList, movedStages]
  );

  const updateStage = useMutation({
    mutationFn: async ({ pipeline, stage }: { pipeline: PipelineData; stage: PipelineStage }) =>
      requireApiData(
        await updatePipeline({
          id: pipeline.id,
          company_id: pipeline.company_id,
          sales_owner_id: pipeline.sales_owner_id,
          stage,
          estimated_value: Number(pipeline.estimated_value),
          expected_close_date: pipeline.expected_close_date,
        })
      ),
    onSuccess: async (_data, { pipeline }) => {
      setStageError(null);
      await queryClient.invalidateQueries({ queryKey: ["sales", "pipelines"] });
      setMovedStages((current) => {
        const next = { ...current };
        delete next[pipeline.id];
        return next;
      });
    },
  });

  // Only active people can be picked as an owner to filter by.
  const userList = useUserList(!isOwnScoped, "ACTIVE");
  const ownerOptions: AppSelectOption[] = [
    { value: "", label: "All Owners" },
    ...userList.map((user) => ({ value: user.id, label: user.full_name })),
  ];
  const phaseStages = PIPELINE_STAGES_BY_PHASE[phase];
  const stageOptions: AppSelectOption[] = [
    { value: "", label: "All Stages" },
    ...phaseStages.map((value) => ({ value, label: PIPELINE_STAGE_LABELS[value] })),
  ];

  function moveTo(id: number, stage: PipelineStage) {
    const pipeline = board.find((entry) => entry.id === id);
    if (!pipeline || pipeline.stage === stage) return;
    if (!pipeline.lead_source) {
      setStageError("Set this company's lead source before moving its pipeline.");
      return;
    }
    if (!isStageCompatibleWithLeadSource(stage, pipeline.lead_source)) {
      setStageError(
        stage === "triaging"
          ? "Triaging requires an inbound lead source."
          : "Attempting requires an outbound lead source."
      );
      return;
    }
    setStageError(null);
    setMovedStages((current) => ({ ...current, [id]: stage }));
    updateStage.mutate(
      { pipeline, stage },
      {
        onError: (cause) => {
          setMovedStages((current) => {
            const next = { ...current };
            delete next[id];
            return next;
          });
          setStageError(cause instanceof Error ? cause.message : "Failed to move this lead.");
        },
      }
    );
  }

  const phaseLabel = phase.toUpperCase();

  return (
    <div className="px-4 py-6 flex flex-col gap-5 sm:px-8">
      <PageHeaderOS
        title={`${phaseLabel} Leads`}
        description={`Track and manage leads in the ${phaseLabel} sales phase.`}
        action={{ label: "Add Lead", icon: Plus, onClick: () => setIsCreateOpen(true) }}
      />

      <div className="flex flex-wrap items-center gap-3">
        <AppInput
          inputId={`${phase}-leads-search`}
          icon={<Search size={14} />}
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Search company..."
          className="max-w-full sm:max-w-sm"
        />
        <div className="w-full max-w-56">
          <AppSelect
            selectId={`${phase}-leads-stage-filter`}
            placeholder="All Stages"
            value={stageFilter}
            options={stageOptions}
            onChange={(value) => {
              setStageFilter((value as string) ?? "");
              setPage(1);
            }}
          />
        </div>
        <div className="w-full max-w-48">
          <AppSelect
            selectId={`${phase}-leads-channel-filter`}
            placeholder="All Channels"
            value={channelFilter}
            options={leadChannelOptions}
            onChange={(value) => {
              setChannelFilter((value as string) ?? "");
              setPage(1);
            }}
          />
        </div>
        {!isOwnScoped && (
          <div className="w-full max-w-56">
            <AppSelect
              selectId={`${phase}-leads-owner-filter`}
              placeholder="All Owners"
              value={ownerFilter}
              options={ownerOptions}
              onChange={(value) => {
                setOwnerFilter((value as string) ?? "");
                setPage(1);
              }}
            />
          </div>
        )}
        <ViewModeToggleOS value={viewMode} onChange={setViewMode} options={viewModeOptions} className="ml-auto" />
      </div>

      {pipelineQuery.isLoading && <p className="py-8 text-center text-sm text-gray-400">Loading leads...</p>}
      {pipelineQuery.isError && <p className="py-8 text-center text-sm text-red-500">{pipelineQuery.error.message}</p>}
      {stageError && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">{stageError}</p>}

      {pipelineList && isBoardView && (
        <>
          {pipelineList.length === 100 && <p className="text-xs text-amber-600">Kanban shows at most 100 matching leads.</p>}
          <div className="flex gap-4 overflow-x-auto pb-1">
            {phaseStages.map((stage) => {
              const items = board.filter((entry) => entry.stage === stage);
              const isOver = dragOverStage === stage;
              return (
                <div
                  key={stage}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOverStage(stage);
                  }}
                  onDragLeave={(event) => {
                    if (event.currentTarget === event.target) setDragOverStage(null);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragOverStage(null);
                    if (draggedId !== null) moveTo(draggedId, stage);
                    setDraggedId(null);
                  }}
                  className={`flex max-h-128 w-70 shrink-0 flex-col gap-2 rounded-xl border p-3 transition-colors ${
                    isOver ? "border-claude bg-claude/5" : "border-dashboard-border bg-dashboard-bg"
                  }`}
                >
                  <div className="flex shrink-0 items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full ${PIPELINE_STAGE_DOTS[stage]}`} />
                      <span className="text-xs font-bold uppercase tracking-wide text-gray-700 dark:text-zinc-300">
                        {PIPELINE_STAGE_LABELS[stage]}
                      </span>
                    </div>
                    <span className={`flex size-5 items-center justify-center rounded-full text-[11px] font-bold text-white ${PIPELINE_STAGE_DOTS[stage]}`}>
                      {items.length}
                    </span>
                  </div>
                  <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
                    {items.map((entry) => (
                      <div
                        key={entry.id}
                        draggable
                        onDragStart={() => setDraggedId(entry.id)}
                        onDragEnd={() => setDraggedId(null)}
                        onClick={() => setEditingPipelineId(entry.id)}
                        className={`flex cursor-grab flex-col gap-2 rounded-lg border border-dashboard-border bg-card-bg p-3 hover:border-claude/40 ${draggedId === entry.id ? "opacity-50" : ""}`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 size={14} className="shrink-0 text-gray-400" />
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">{entry.company_name}</p>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
                          <span>{leadSourceLabel(entry.lead_source)}</span>
                          <span className="font-semibold text-gray-900 dark:text-zinc-100">{getRupiahCurrency(Number(entry.estimated_value))}</span>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && <p className="py-6 text-center text-xs text-gray-400">No leads</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {pipelineList && viewMode === "table" && (
        <div className="overflow-hidden rounded-xl border border-gray-300 bg-card-bg dark:border-zinc-700">
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-800">
                  <th className="px-5 py-3">Company</th><th className="px-5 py-3">Source</th><th className="px-5 py-3">Stage</th><th className="px-5 py-3">Value</th><th className="px-5 py-3">Expected Close</th><th className="px-5 py-3">Owner</th>
                </tr>
              </thead>
              <tbody>
                {pipelineList.map((entry) => (
                  <tr key={entry.id} onClick={() => setEditingPipelineId(entry.id)} className="cursor-pointer border-b border-gray-200 last:border-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
                    <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-zinc-100">{entry.company_name}</td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">{leadSourceLabel(entry.lead_source)}</td>
                    <td className="px-5 py-3.5"><StageLabel stage={entry.stage} /></td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-zinc-100">{getRupiahCurrency(Number(entry.estimated_value))}</td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">{entry.expected_close_date ? new Date(entry.expected_close_date).toLocaleDateString("en-GB") : "—"}</td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">{entry.sales_owner_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pipelineList && viewMode === "cards" && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pipelineList.map((entry) => (
            <div key={entry.id} role="button" tabIndex={0} onClick={() => setEditingPipelineId(entry.id)} onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setEditingPipelineId(entry.id);
              }
            }} className="flex cursor-pointer flex-col gap-3 rounded-xl border border-gray-300 bg-card-bg p-5 text-left transition-colors hover:border-claude/60 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800"><Building2 size={18} className="text-gray-400" /></div>
                <div className="min-w-0 flex-1"><h3 className="truncate font-bold text-gray-900 dark:text-zinc-100">{entry.company_name}</h3><p className="truncate text-xs text-gray-500">{leadSourceLabel(entry.lead_source)} lead</p></div>
              </div>
              <StageLabel stage={entry.stage} />
              <div className="mt-1 flex items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-zinc-800">
                <span className="font-semibold text-gray-900 dark:text-zinc-100">{getRupiahCurrency(Number(entry.estimated_value))}</span>
                <span className="truncate text-xs text-gray-700 dark:text-zinc-300">{entry.sales_owner_name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {pipelineList?.length === 0 && <p className="py-10 text-center text-sm text-gray-400">No leads found.</p>}
      {!isBoardView && <AppPaginationOS currentPage={page} totalPages={totalPage} onPageChange={setPage} />}
      <CreateLeadFormOS sessionToken={sessionToken} phase={phase} isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <EditLeadFormOS sessionToken={sessionToken} pipeline={editingPipeline} isOpen={editingPipelineId !== null} onClose={() => setEditingPipelineId(null)} />
    </div>
  );
}
