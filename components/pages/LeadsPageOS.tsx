"use client";

import type { LeadChannel, LeadSource, PipelineData, PipelinePhase, PipelineStage } from "@/apis/sales";
import ViewModeToggleOS, { type ViewModeOS } from "@/components/buttons/ViewModeToggleOS";
import AppFilterMenu, { AppFilterChips, type FilterField, type FilterValues } from "@/components/fields/AppFilterMenu";
import AppInput from "@/components/fields/AppInput";
import { type AppSelectOption } from "@/components/fields/AppSelect";
import CreateLeadFormOS from "@/components/forms/CreateLeadFormOS";
import EditLeadFormOS from "@/components/forms/EditLeadFormOS";
import StageLabel from "@/components/labels/StageLabel";
import AppPaginationOS from "@/components/navigations/AppPaginationOS";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import LeadsKanbanBoardOS from "@/components/pages/LeadsKanbanBoardOS";
import LeadsWeeklyPanelOS from "@/components/pages/LeadsWeeklyPanelOS";
import { useSession } from "@/contexts/SessionContext";
import { usePersistedViewMode } from "@/hooks/usePersistedViewMode";
import { useUserList } from "@/hooks/useUserList";
import { requireApiData } from "@/lib/api-result";
import { listPipelines } from "@/lib/actions";
import { getRupiahCurrency } from "@/lib/currency";
import { PIPELINE_STAGE_LABELS, PIPELINE_STAGES_BY_PHASE } from "@/lib/sales";
import { userSelectOption } from "@/lib/user-select-option";
import { useQuery } from "@tanstack/react-query";
import { Building2, CalendarRange, Kanban, LayoutGrid, Plus, Search, Table2 } from "lucide-react";
import { useEffect, useState } from "react";

const viewModeOptions = [
  { value: "kanban" as const, label: "Kanban", icon: Kanban },
  { value: "cards" as const, label: "Cards", icon: LayoutGrid },
  { value: "table" as const, label: "Table", icon: Table2 },
  { value: "weekly" as const, label: "Weekly", icon: CalendarRange },
];

const leadSourceLabels: Record<LeadSource, string> = {
  inbound: "Inbound",
  outbound: "Outbound",
};

function leadSourceLabel(source: LeadSource | null) {
  return source ? leadSourceLabels[source] : "—";
}

const leadSourceOptions: AppSelectOption[] = [
  { value: "", label: "All Sources" },
  ...(Object.keys(leadSourceLabels) as LeadSource[]).map((value) => ({ value, label: leadSourceLabels[value] })),
];

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
  const sessionUser = useSession();
  const isOwnScoped = sessionUser?.data_scope === "OWN";
  // Set while the create sheet is open; the kanban "+" seeds it with that column's stage.
  const [createStage, setCreateStage] = useState<PipelineStage | "default" | null>(null);
  const [editingPipelineId, setEditingPipelineId] = useState<number | null>(null);
  // Kanban and weekly leads are not in `pipelineList`, so they carry their own row.
  const [openedPipeline, setOpenedPipeline] = useState<PipelineData | null>(null);
  const [viewMode, setViewMode] = usePersistedViewMode<ViewModeOS>(
    `leads_${phase}_view_mode`,
    ["kanban", "cards", "table", "weekly"],
    "cards"
  );
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>();
  // Keyed by the API field each value is sent as, so the filter menu stays generic.
  const [filterValues, setFilterValues] = useState<FilterValues>({});
  const pageSize = 21;
  const isBoardView = viewMode === "kanban";
  const isWeeklyView = viewMode === "weekly";

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword.trim() || undefined);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Shared by every view; the weekly tally reuses it without the paging keys.
  const baseFilters = {
    phase,
    keyword: debouncedKeyword,
    stage: (filterValues.stage || undefined) as PipelineStage | undefined,
    lead_source: (filterValues.lead_source || undefined) as LeadSource | undefined,
    lead_channel: (filterValues.lead_channel || undefined) as LeadChannel | undefined,
    sales_owner_id: isOwnScoped ? undefined : filterValues.sales_owner_id || undefined,
    created_from: filterValues.created_from || undefined,
    created_to: filterValues.created_to || undefined,
  };

  const filters = { ...baseFilters, page, page_size: pageSize };

  // The kanban pages each column itself, so this paged list only feeds cards and table.
  const pipelineQuery = useQuery({
    queryKey: ["sales", "pipelines", filters],
    queryFn: async () => requireApiData(await listPipelines(filters)),
    enabled: !!sessionToken && !isWeeklyView && !isBoardView,
  });

  const pipelineList = pipelineQuery.data?.list;
  const editingPipeline = pipelineList?.find((entry) => entry.id === editingPipelineId) ?? openedPipeline;
  const totalPage = pipelineQuery.data?.metapaging.total_page ?? 1;

  // Only active people can be picked as an owner to filter by.
  const userList = useUserList(!isOwnScoped, "ACTIVE");
  const ownerOptions: AppSelectOption[] = [
    { value: "", label: "All Owners" },
    ...userList.map(userSelectOption),
  ];
  const phaseStages = PIPELINE_STAGES_BY_PHASE[phase];
  const stageOptions: AppSelectOption[] = [
    { value: "", label: "All Stages" },
    ...phaseStages.map((value) => ({ value, label: PIPELINE_STAGE_LABELS[value] })),
  ];
  const filterFields: FilterField[] = [
    { kind: "select", key: "stage", label: "Stage", placeholder: "All Stages", options: stageOptions },
    { kind: "select", key: "lead_source", label: "Source", placeholder: "All Sources", options: leadSourceOptions },
    { kind: "select", key: "lead_channel", label: "Channel", placeholder: "All Channels", options: leadChannelOptions },
    // An own-scoped user sees only their own leads, so the owner filter is moot.
    ...(isOwnScoped
      ? []
      : [{ kind: "select" as const, key: "sales_owner_id", label: "Owner", placeholder: "All Owners", options: ownerOptions }]),
    { kind: "date-range", key: "created", label: "Created", fromKey: "created_from", toKey: "created_to" },
  ];

  // Reset paging, or page 4 survives into a narrower result that has no page 4.
  function applyFilters(next: FilterValues) {
    setFilterValues(next);
    setPage(1);
  }

  const phaseLabel = phase.toUpperCase();

  return (
    <div className="px-4 py-6 flex flex-col gap-5 sm:px-8">
      <PageHeaderOS
        title={`${phaseLabel} Leads`}
        description={`Track and manage leads in the ${phaseLabel} sales phase.`}
        action={{ label: "Add Lead", icon: Plus, onClick: () => setCreateStage("default") }}
      />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <AppInput
            inputId={`${phase}-leads-search`}
            icon={<Search size={14} />}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search company..."
            className="max-w-full sm:max-w-sm"
          />
          <AppFilterMenu
            menuId={`${phase}-leads-filters`}
            fields={filterFields}
            values={filterValues}
            onChange={applyFilters}
          />
          <ViewModeToggleOS value={viewMode} onChange={setViewMode} options={viewModeOptions} className="ml-auto" />
        </div>
        <AppFilterChips fields={filterFields} values={filterValues} onChange={applyFilters} />
      </div>

      {pipelineQuery.isLoading && <p className="py-8 text-center text-sm text-gray-400">Loading leads...</p>}
      {pipelineQuery.isError && <p className="py-8 text-center text-sm text-red-500">{pipelineQuery.error.message}</p>}

      {isBoardView && (
        <LeadsKanbanBoardOS
          // A stage filter narrows the board to that one column.
          stages={baseFilters.stage ? [baseFilters.stage] : phaseStages}
          filters={baseFilters}
          onOpenLead={(lead) => {
            setOpenedPipeline(lead);
            setEditingPipelineId(lead.id);
          }}
          onAddLead={setCreateStage}
        />
      )}

      {pipelineList && viewMode === "table" && (
        <div className="overflow-hidden rounded-xl border border-line bg-card-bg">
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-sm">
              <thead>
                <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <th className="px-5 py-3">Company</th><th className="px-5 py-3">Source</th><th className="px-5 py-3">Stage</th><th className="px-5 py-3">Value</th><th className="px-5 py-3">Expected Close</th><th className="px-5 py-3">Owner</th>
                </tr>
              </thead>
              <tbody>
                {pipelineList.map((entry) => (
                  <tr key={entry.id} onClick={() => setEditingPipelineId(entry.id)} className="cursor-pointer border-b border-line-soft last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
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
            }} className="flex cursor-pointer flex-col gap-3 rounded-xl border border-line bg-card-bg p-5 text-left transition-colors hover:border-claude/60">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-line-soft bg-gray-50 dark:bg-zinc-800"><Building2 size={18} className="text-gray-400" /></div>
                <div className="min-w-0 flex-1"><h3 className="truncate font-bold text-gray-900 dark:text-zinc-100">{entry.company_name}</h3><p className="truncate text-xs text-gray-500">{leadSourceLabel(entry.lead_source)} lead</p></div>
              </div>
              <StageLabel stage={entry.stage} />
              <div className="mt-1 flex items-center justify-between gap-2 border-t border-line-soft pt-3">
                <span className="font-semibold text-gray-900 dark:text-zinc-100">{getRupiahCurrency(Number(entry.estimated_value))}</span>
                <span className="truncate text-xs text-gray-700 dark:text-zinc-300">{entry.sales_owner_name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {isWeeklyView && (
        <LeadsWeeklyPanelOS
          filters={baseFilters}
          onOpenLead={(lead) => {
            setOpenedPipeline(lead);
            setEditingPipelineId(lead.id);
          }}
        />
      )}

      {pipelineList?.length === 0 && <p className="py-10 text-center text-sm text-gray-400">No leads found.</p>}
      {!isBoardView && !isWeeklyView && (
        <AppPaginationOS currentPage={page} totalPages={totalPage} onPageChange={setPage} />
      )}
      <CreateLeadFormOS
        sessionToken={sessionToken}
        phase={phase}
        defaultStage={createStage === "default" ? undefined : (createStage ?? undefined)}
        isOpen={createStage !== null}
        onClose={() => setCreateStage(null)}
      />
      <EditLeadFormOS
        sessionToken={sessionToken}
        pipeline={editingPipeline}
        isOpen={editingPipelineId !== null}
        onClose={() => {
          setEditingPipelineId(null);
          setOpenedPipeline(null);
        }}
      />
    </div>
  );
}
