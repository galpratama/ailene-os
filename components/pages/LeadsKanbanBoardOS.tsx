"use client";

import type {
  ListPipelinesOptions,
  PipelineBoardColumn,
  PipelineBoardCursor,
  PipelineBoardFilters,
  PipelineData,
  PipelineStage,
} from "@/apis/sales";
import AppButton from "@/components/buttons/AppButton";
import LeadKanbanCardOS from "@/components/items/LeadKanbanCardOS";
import StageLabel from "@/components/labels/StageLabel";
import { requireApiData } from "@/lib/api-result";
import { getPipelineBoard, updatePipeline } from "@/lib/actions";
import { isStageCompatibleWithLeadSource } from "@/lib/sales";
import { showErrorToast } from "@/lib/toast";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const COLUMN_PAGE_SIZE = 20;

type ColumnData = InfiniteData<PipelineBoardColumn, PipelineBoardCursor | null>;

// Columns sit outside ["sales", "pipelines"], so a lead edit refreshes the board in one call instead of one per column.
const columnKey = (stage: PipelineStage, filters: PipelineBoardFilters) =>
  ["sales", "pipeline-board-column", stage, filters] as const;

// The board filters by the listed stages, so `phase` and `stage` are dropped before it is called.
type BoardFilters = Omit<ListPipelinesOptions, "page" | "page_size">;
// A card dropped on another column shows there until the refetch confirms the move.
type MovedLeads = Partial<Record<number, { lead: PipelineData; stage: PipelineStage }>>;

interface ColumnProps {
  stage: PipelineStage;
  filters: PipelineBoardFilters;
  boardReady: boolean;
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

// The board seeds each column's first chunk; only a column scrolled to its end asks for more, past its last card.
function LeadsKanbanColumn({
  stage,
  filters,
  boardReady,
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
  const leadsQuery = useInfiniteQuery<
    PipelineBoardColumn,
    Error,
    ColumnData,
    ReturnType<typeof columnKey>,
    PipelineBoardCursor | null
  >({
    queryKey: columnKey(stage, filters),
    queryFn: async ({ pageParam }) => {
      const board = requireApiData(
        await getPipelineBoard({ ...filters, stages: [stage], per_stage: COLUMN_PAGE_SIZE, after: pageParam ?? undefined })
      );
      return board.stages[0];
    },
    initialPageParam: null,
    getNextPageParam: (last) => {
      const card = last.list.at(-1);
      return last.has_more && card ? { updated_at: card.updated_at, id: card.id } : undefined;
    },
    enabled: boardReady,
    // The board refreshes the seeded first chunk; a column refetches on its own only after a card moves in or out.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
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
  const total = (leadsQuery.data?.pages[0]?.total ?? 0) - movedOutCount + movedIn.length;

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
            {leadsQuery.isPending ? "…" : total}
          </span>
        </div>
        <AppButton type="button" variant="secondary" size="iconSm" aria-label="Add lead to this stage" onClick={() => onAddLead(stage)}>
          <Plus size={15} />
        </AppButton>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-1">
        {leadsQuery.isPending && <p className="py-6 text-center text-xs text-gray-400">Loading leads...</p>}
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

        {!leadsQuery.isPending && !leadsQuery.isError && leads.length === 0 && (
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
  const boardFilters: PipelineBoardFilters = {
    keyword: filters.keyword,
    lead_source: filters.lead_source,
    lead_channel: filters.lead_channel,
    sales_owner_id: filters.sales_owner_id,
    created_from: filters.created_from,
    created_to: filters.created_to,
  };
  // One call for every column; each column's first chunk is written straight into that column's cache.
  const boardQuery = useQuery({
    queryKey: ["sales", "pipelines", "board", stages, boardFilters],
    queryFn: async () => {
      const board = requireApiData(await getPipelineBoard({ ...boardFilters, stages, per_stage: COLUMN_PAGE_SIZE }));
      for (const column of board.stages) {
        queryClient.setQueryData<ColumnData>(columnKey(column.stage, boardFilters), { pages: [column], pageParams: [null] });
      }
      return board;
    },
    refetchOnWindowFocus: false,
  });
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
    onSuccess: async (_data, { lead, stage }) => {
      // Only the two touched columns refetch; the board and the other lead views just go stale until shown again.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sales", "pipelines"], refetchType: "none" }),
        ...[lead.stage, stage].map((touched) =>
          queryClient.invalidateQueries({ queryKey: ["sales", "pipeline-board-column", touched] })
        ),
      ]);
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

  if (boardQuery.isError) {
    return <p className="py-8 text-center text-sm text-red-500">{boardQuery.error.message}</p>;
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {stages.map((stage) => (
        <LeadsKanbanColumn
          key={stage}
          stage={stage}
          filters={boardFilters}
          boardReady={boardQuery.isSuccess}
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
