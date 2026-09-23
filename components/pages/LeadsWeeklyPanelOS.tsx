"use client";

import type { ListPipelinesOptions, PipelineData } from "@/apis/sales";
import AppSelect, { type AppSelectOption } from "@/components/fields/AppSelect";
import StageLabel from "@/components/labels/StageLabel";
import { requireApiData } from "@/lib/api-result";
import { formatDayRange } from "@/lib/date-range";
import { listPipelines, listPipelineWeeks } from "@/lib/actions";
import { useQuery } from "@tanstack/react-query";
import { Building2, ChevronRight } from "lucide-react";
import { useState } from "react";

// Past a quarter this stops reading as outreach cadence, so the list ends there.
const windowOptions: AppSelectOption[] = [
  { value: "4", label: "Last 4 weeks" },
  { value: "8", label: "Last 8 weeks" },
  { value: "12", label: "Last 12 weeks" },
  { value: "26", label: "Last 26 weeks" },
];

function isCurrentWeek(weekStart: string, weekEnd: string) {
  const today = new Date().toLocaleDateString("en-CA");
  return today >= weekStart && today <= weekEnd;
}

// Its own component so the query runs only for weeks the user actually opens.
function WeekLeads({ filters, weekStart, weekEnd, onOpenLead }: {
  filters: ListPipelinesOptions;
  weekStart: string;
  weekEnd: string;
  onOpenLead: (lead: PipelineData) => void;
}) {
  const weekFilters = { ...filters, created_from: weekStart, created_to: weekEnd, page: 1, page_size: 100 };
  const leadsQuery = useQuery({
    queryKey: ["sales", "pipelines", weekFilters],
    queryFn: async () => requireApiData(await listPipelines(weekFilters)),
  });

  if (leadsQuery.isLoading) return <p className="px-5 py-4 text-sm text-gray-400">Loading leads...</p>;
  if (leadsQuery.isError) return <p className="px-5 py-4 text-sm text-red-500">{leadsQuery.error.message}</p>;

  const leads = leadsQuery.data?.list ?? [];
  if (leads.length === 0) return <p className="px-5 py-4 text-sm text-gray-400">No leads created this week.</p>;

  return (
    <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
      {leads.map((lead) => (
        <li key={lead.id}>
          <button
            type="button"
            onClick={() => onOpenLead(lead)}
            className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-800/50"
          >
            <Building2 size={14} className="shrink-0 text-gray-400" />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
              {lead.company_name}
            </span>
            <span className="hidden w-20 shrink-0 text-xs capitalize text-gray-500 sm:block">
              {lead.lead_source ?? "—"}
            </span>
            <StageLabel stage={lead.stage} />
            <span className="hidden w-36 shrink-0 truncate text-xs text-gray-700 dark:text-zinc-300 lg:block">
              {lead.sales_owner_name}
            </span>
          </button>
        </li>
      ))}
      {leadsQuery.data && leadsQuery.data.metapaging.total_data > leads.length && (
        <li className="px-5 py-3 text-xs text-amber-600">
          Showing the first {leads.length} of {leadsQuery.data.metapaging.total_data} leads in this week.
        </li>
      )}
    </ul>
  );
}

// Counts come from the aggregate endpoint, so a week is right across pages.
export default function LeadsWeeklyPanelOS({ filters, onOpenLead }: {
  filters: ListPipelinesOptions;
  onOpenLead: (lead: PipelineData) => void;
}) {
  const [weeks, setWeeks] = useState("12");
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null);

  // A created range already bounds the window, so `weeks` only applies without one.
  const hasDateRange = !!filters.created_from || !!filters.created_to;
  const weekFilters = { ...filters, weeks: hasDateRange ? undefined : Number(weeks) };
  const weeksQuery = useQuery({
    queryKey: ["sales", "pipeline-weeks", weekFilters],
    queryFn: async () => requireApiData(await listPipelineWeeks(weekFilters)),
  });

  const list = weeksQuery.data?.list ?? [];
  const peak = Math.max(1, ...list.map((week) => week.total_leads));
  const total = list.reduce((sum, week) => sum + week.total_leads, 0);
  const outbound = list.reduce((sum, week) => sum + week.outbound_leads, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-full max-w-48">
          <AppSelect
            selectId="leads-weekly-window"
            placeholder="Last 12 weeks"
            value={weeks}
            options={windowOptions}
            disabled={hasDateRange}
            onChange={(value) => setWeeks((value as string) ?? "12")}
          />
        </div>
        {hasDateRange && (
          <p className="text-xs text-gray-500">Weeks follow the created-date filter above.</p>
        )}
        <p className="ml-auto text-xs text-gray-500">
          <span className="font-bold text-gray-900 dark:text-zinc-100">{total}</span> leads ·{" "}
          <span className="font-bold text-gray-900 dark:text-zinc-100">{outbound}</span> outbound
        </p>
      </div>

      {weeksQuery.isLoading && <p className="py-8 text-center text-sm text-gray-400">Loading weekly totals...</p>}
      {weeksQuery.isError && <p className="py-8 text-center text-sm text-red-500">{weeksQuery.error.message}</p>}

      {weeksQuery.data && (
        <div className="overflow-hidden rounded-xl border border-gray-300 bg-card-bg dark:border-zinc-700">
          <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-gray-200 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-800">
            <span>Week</span>
            <span className="grid grid-cols-3 gap-4 text-right">
              <span className="w-14">Total</span>
              <span className="w-14">Inbound</span>
              <span className="w-14">Outbound</span>
            </span>
          </div>
          {list.map((week) => {
            const isExpanded = expandedWeek === week.week_start;
            return (
              <div key={week.week_start} className="border-b border-gray-200 last:border-0 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setExpandedWeek(isExpanded ? null : week.week_start)}
                  aria-expanded={isExpanded}
                  className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-5 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <ChevronRight
                      size={14}
                      className={`shrink-0 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">
                        {formatDayRange(week.week_start, week.week_end)}
                        {isCurrentWeek(week.week_start, week.week_end) && (
                          <span className="ml-2 rounded-full bg-claude/10 px-2 py-0.5 text-[11px] font-bold text-claude">
                            This week
                          </span>
                        )}
                      </span>
                      <span className="mt-1.5 block h-1.5 w-full max-w-72 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
                        <span
                          className="block h-full rounded-full bg-claude"
                          style={{ width: `${(week.total_leads / peak) * 100}%` }}
                        />
                      </span>
                    </span>
                  </span>
                  <span className="grid grid-cols-3 gap-4 text-right text-sm">
                    <span className="w-14 font-bold text-gray-900 dark:text-zinc-100">{week.total_leads}</span>
                    <span className="w-14 text-gray-600 dark:text-zinc-300">{week.inbound_leads}</span>
                    <span className="w-14 font-semibold text-gray-900 dark:text-zinc-100">{week.outbound_leads}</span>
                  </span>
                </button>
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-dashboard-bg dark:border-zinc-800">
                    <WeekLeads
                      filters={filters}
                      weekStart={week.week_start}
                      weekEnd={week.week_end}
                      onOpenLead={onOpenLead}
                    />
                  </div>
                )}
              </div>
            );
          })}
          {list.length === 0 && <p className="py-10 text-center text-sm text-gray-400">No weeks in this range.</p>}
        </div>
      )}
    </div>
  );
}
