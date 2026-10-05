"use client";

import type { ListPipelinesOptions, PipelineData, PipelineStage } from "@/apis/sales";
import AppButton from "@/components/buttons/AppButton";
import LeadKanbanCardOS from "@/components/items/LeadKanbanCardOS";
import StageLabel from "@/components/labels/StageLabel";
import { requireApiData } from "@/lib/api-result";
import { listPipelines, updatePipeline } from "@/lib/actions";
import { isStageCompatibleWithLeadSource } from "@/lib/sales";
import { showErrorToast } from "@/lib/toast";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const COLUMN_PAGE_SIZE = 20;

// Any `stage` here is overridden per column.
type BoardFilters = Omit<ListPipelinesOptions, "page" | "page_size">;
// A card dropped on another column shows there until the refetch confirms the move.
type MovedLeads = Partial<Record<number, { lead: PipelineData; stage: PipelineStage }>>;

interface ColumnProps {
  stage: PipelineStage;
  filters: BoardFilters;
  moved: MovedLeads;
  isOver: boolean;
  draggedId: number | null;
  onDragOverColumn: () => void;
  onDragLeaveColumn: () => void;
  onDropColumn: () => void;
  onDragLead: (lead: PipelineData | null) => void;
  onOpenLead: (lead: PipelineData) => void;
  onAddLead: (stage: PipelineStage) => void;
}

// Each column pages through its own stage, so a busy stage never crowds the others out.
function LeadsKanbanColumn({
  stage,
  filters,
  moved,
  isOver,
  draggedId,
  onDragOverColumn,
  onDragLeaveColumn,
  onDropColumn,
  onDragLead,
  onOpenLead,
  onAddLead,
}: ColumnProps) {
  const columnFilters = { ...filters, stage };
  const leadsQuery = useInfiniteQuery({
    queryKey: ["sales", "pipelines", "kanban", columnFilters],
    queryFn: async ({ pageParam }) =>
      requireApiData(await listPipelines({ ...columnFilters, page: pageParam, page_size: COLUMN_PAGE_SIZE })),
    initialPageParam: 1,
    getNextPageParam: ({ metapaging }) =>
      metapaging.current_page < metapaging.total_page ? metapaging.current_page + 1 : undefined,
  });
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = leadsQuery;

  // A move bumps updated_at, so pages can shift under the cursor; drop the repeats.
  const ownLeads = useMemo(() => {
    const seen = new Set<number>();
    return (leadsQuery.data?.pages ?? [])
      .flatMap((page) => page.list)
      .filter((lead) => !seen.has(lead.id) && seen.add(lead.id));
  }, [leadsQuery.data]);

  const ownIds = new Set(ownLeads.map((lead) => lead.id));
  const movedIn = Object.values(moved).filter(
    (entry): entry is NonNullable<typeof entry> => !!entry && entry.stage === stage && !ownIds.has(entry.lead.id)
  );
  const movedOutCount = ownLeads.filter((lead) => moved[lead.id] && moved[lead.id]?.stage !== stage).length;
  const leads = [
    ...movedIn.map((entry) => ({ ...entry.lead, stage })),
    ...ownLeads.filter((lead) => !moved[lead.id] || moved[lead.id]?.stage === stage),
  ];
  const total = (leadsQuery.data?.pages[0]?.metapaging.total_data ?? 0) - movedOutCount + movedIn.length;

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isFetchingNextPage) void fetchNextPage();
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        onDragOverColumn();
      }}
      onDragLeave={(event) => {
        if (event.currentTarget === event.target) onDragLeaveColumn();
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDropColumn();
      }}
      className={`flex max-h-[calc(100dvh-9rem)] min-h-120 w-72 shrink-0 flex-col gap-3 rounded-2xl p-1 transition-colors ${
        isOver ? "bg-claude/5 ring-1 ring-claude" : ""
      }`}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 rounded-xl border border-line bg-card-bg py-1.5 pr-1.5 pl-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <StageLabel stage={stage} withIcon={false} />
          <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">
            {leadsQuery.isLoading ? "…" : total}
          </span>
        </div>
        <AppButton type="button" variant="ghost" size="iconSm" aria-label="Add lead to this stage" onClick={() => onAddLead(stage)}>
          <Plus size={15} />
        </AppButton>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-1">
        {leadsQuery.isLoading && <p className="py-6 text-center text-xs text-gray-400">Loading leads...</p>}
        {leadsQuery.isError && <p className="py-6 text-center text-xs text-red-500">{leadsQuery.error.message}</p>}

        {leads.map((lead) => (
          <LeadKanbanCardOS
            key={lead.id}
            lead={lead}
            isDragging={draggedId === lead.id}
            onOpen={() => onOpenLead(lead)}
            onDragStart={() => onDragLead(lead)}
            onDragEnd={() => onDragLead(null)}
          />
        ))}

        {!leadsQuery.isLoading && !leadsQuery.isError && leads.length === 0 && (
          <p className="rounded-xl border border-dashed border-line py-6 text-center text-xs text-gray-400">No leads</p>
        )}

        <div ref={sentinelRef} className="shrink-0">
          {isFetchingNextPage && (
            <p className="flex items-center justify-center gap-1.5 py-2 text-xs text-gray-400">
              <Loader2 size={12} className="animate-spin" />
              Loading more...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LeadsKanbanBoardOS({
  stages,
  filters,
  onOpenLead,
  onAddLead,
}: {
  stages: PipelineStage[];
  filters: BoardFilters;
  onOpenLead: (lead: PipelineData) => void;
  onAddLead: (stage: PipelineStage) => void;
}) {
  const queryClient = useQueryClient();
  const [draggedLead, setDraggedLead] = useState<PipelineData | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);
  const [moved, setMoved] = useState<MovedLeads>({});

  function forget(id: number) {
    setMoved((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  const updateStage = useMutation({
    mutationFn: async ({ lead, stage }: { lead: PipelineData; stage: PipelineStage }) =>
      requireApiData(
        await updatePipeline({
          id: lead.id,
          company_id: lead.company_id,
          sales_owner_id: lead.sales_owner_id,
          stage,
          estimated_value: Number(lead.estimated_value),
          expected_close_date: lead.expected_close_date,
        })
      ),
    onSuccess: async (_data, { lead }) => {
      await queryClient.invalidateQueries({ queryKey: ["sales", "pipelines"] });
      forget(lead.id);
    },
    onError: (cause, { lead }) => {
      forget(lead.id);
      showErrorToast(cause instanceof Error ? cause.message : "Failed to move this lead.");
    },
  });

  function moveTo(lead: PipelineData, stage: PipelineStage) {
    const currentStage = moved[lead.id]?.stage ?? lead.stage;
    if (currentStage === stage) return;
    if (!lead.lead_source) {
      showErrorToast("Set this company's lead source before moving its pipeline.");
      return;
    }
    if (!isStageCompatibleWithLeadSource(stage, lead.lead_source)) {
      showErrorToast(
        stage === "triaging" ? "Triaging requires an inbound lead source." : "Attempting requires an outbound lead source."
      );
      return;
    }
    setMoved((current) => ({ ...current, [lead.id]: { lead, stage } }));
    updateStage.mutate({ lead, stage });
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {stages.map((stage) => (
        <LeadsKanbanColumn
          key={stage}
          stage={stage}
          filters={filters}
          moved={moved}
          isOver={dragOverStage === stage}
          draggedId={draggedLead?.id ?? null}
          onDragOverColumn={() => setDragOverStage(stage)}
          onDragLeaveColumn={() => setDragOverStage(null)}
          onDropColumn={() => {
            setDragOverStage(null);
            if (draggedLead) moveTo(draggedLead, stage);
            setDraggedLead(null);
          }}
          onDragLead={setDraggedLead}
          onOpenLead={onOpenLead}
          onAddLead={onAddLead}
        />
      ))}
    </div>
  );
}
