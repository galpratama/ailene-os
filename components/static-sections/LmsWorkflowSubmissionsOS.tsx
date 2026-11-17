"use client";

import type { LmsWorkflowStatus } from "@/apis/lms-workflows";
import AppButton from "@/components/buttons/AppButton";
import TaskAssigneeAvatarOS from "@/components/elements/TaskAssigneeAvatarOS";
import LmsWorkflowStatusLabel from "@/components/labels/LmsWorkflowStatusLabel";
import LmsWorkflowDetailModalOS from "@/components/modals/LmsWorkflowDetailModalOS";
import { getLmsWorkflowDetails, listLmsWorkflowSubmissions } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AlertTriangle, ChevronLeft, ChevronRight, Clock3, ListChecks, Loader2, Search, Workflow } from "lucide-react";
import { useEffect, useState } from "react";

type StatusFilter = "all" | LmsWorkflowStatus;

const statusFilters: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "submitted", label: "Needs review" },
  { id: "reviewed", label: "Reviewed" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export default function LmsWorkflowSubmissionsOS({
  projectId,
  sessionToken,
}: {
  projectId: string;
  sessionToken: string;
}) {
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedKeyword(keyword.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [keyword]);

  const list = useQuery({
    queryKey: ["lms-workflow-submissions", projectId, status, debouncedKeyword, page],
    queryFn: async () => requireApiData(await listLmsWorkflowSubmissions({
      project_id: projectId,
      ...(status === "all" ? {} : { status }),
      ...(debouncedKeyword ? { keyword: debouncedKeyword } : {}),
      page,
      page_size: 12,
    })),
    enabled: !!sessionToken,
    placeholderData: keepPreviousData,
  });

  const details = useQuery({
    queryKey: ["lms-workflow-submission", projectId, selectedId],
    queryFn: async () => requireApiData(await getLmsWorkflowDetails({ project_id: projectId, workflow_id: selectedId! })),
    enabled: !!sessionToken && selectedId !== null,
  });

  const data = list.data;
  const items = data?.list ?? [];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-card-bg p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 dark:text-zinc-100">
              <Workflow size={18} /> Workflow submissions
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">Review workflow maps submitted by learners in this project.</p>
          </div>
          {data && (
            <span className="rounded-full border border-line px-2.5 py-1 text-xs font-semibold tabular-nums text-gray-600 dark:text-zinc-300">
              {data.metapaging.total_data} submitted
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center gap-2 rounded-lg border border-line bg-gray-50 px-3 dark:bg-zinc-800 sm:max-w-sm">
            <Search size={15} className="shrink-0 text-gray-400" />
            <input
              value={keyword}
              onChange={(event) => { setKeyword(event.target.value); setPage(1); }}
              placeholder="Search learner or workflow"
              aria-label="Search workflow submissions"
              className="h-9 min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-zinc-100"
            />
            {list.isFetching && <Loader2 size={14} className="animate-spin text-gray-400" />}
          </div>
          <div aria-label="Filter workflow status" className="flex w-fit rounded-lg border border-line bg-gray-50 p-1 dark:bg-zinc-800">
            {statusFilters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                aria-pressed={status === filter.id}
                onClick={() => { setStatus(filter.id); setPage(1); }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  status === filter.id
                    ? "bg-white text-gray-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100"
                    : "text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {list.isLoading && (
        <div className="flex min-h-52 items-center justify-center gap-2 rounded-2xl border border-line bg-card-bg text-sm text-gray-500 dark:text-zinc-400">
          <Loader2 size={18} className="animate-spin" /> Loading submissions…
        </div>
      )}

      {list.isError && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-merah/30 bg-merah-t p-4 text-sm text-merah">
          <span>Failed to load workflow submissions.</span>
          <AppButton variant="outline" size="sm" onClick={() => list.refetch()}>Try again</AppButton>
        </div>
      )}

      {!list.isLoading && !list.isError && items.length === 0 && (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-card-bg px-6 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-500"><Workflow size={20} /></span>
          <h3 className="mt-3 text-sm font-bold text-gray-900 dark:text-zinc-100">No submitted workflows</h3>
          <p className="mt-1 max-w-sm text-xs text-gray-500 dark:text-zinc-400">
            {debouncedKeyword || status !== "all" ? "No workflows match the current search and status filter." : "Learner workflows will appear here after they are submitted."}
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div className="grid gap-3 lg:grid-cols-2">
          {items.map((workflow) => (
            <AppButton
              key={workflow.id}
              variant="row"
              size="bare"
              onClick={() => setSelectedId(workflow.id)}
              className="flex w-full flex-col items-stretch rounded-2xl border border-line bg-card-bg p-4 text-left sm:p-5"
            >
              <div className="flex items-start gap-3">
                <TaskAssigneeAvatarOS
                  name={workflow.learner.full_name}
                  avatar={workflow.learner.avatar}
                  colorKey={workflow.learner.access_id}
                  size="base"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">{workflow.learner.full_name}</p>
                    <LmsWorkflowStatusLabel status={workflow.status} />
                  </div>
                  <p className="truncate text-xs text-gray-500 dark:text-zinc-400">{workflow.learner.group.name} · {workflow.learner.job_title}</p>
                </div>
              </div>
              <h3 className="mt-4 line-clamp-2 text-base font-bold text-gray-900 dark:text-zinc-100">{workflow.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-zinc-400">{workflow.problem}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line-soft pt-3 text-xs text-gray-500 dark:text-zinc-400">
                <span className="flex items-center gap-1"><ListChecks size={13} /> {workflow.summary.step_count} steps</span>
                <span className="flex items-center gap-1 tabular-nums"><Clock3 size={13} /> {workflow.summary.total_minutes} min</span>
                {workflow.summary.pain_count > 0 && <span className="flex items-center gap-1 text-merah"><AlertTriangle size={13} /> {workflow.summary.pain_count} pain {workflow.summary.pain_count === 1 ? "point" : "points"}</span>}
                <span className="ml-auto">{formatDate(workflow.submitted_at)} WIB</span>
              </div>
            </AppButton>
          ))}
        </div>
      )}

      {data && data.metapaging.total_page > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500 dark:text-zinc-400">Page {data.metapaging.current_page} of {data.metapaging.total_page}</p>
          <div className="flex gap-2">
            <AppButton variant="outline" size="iconSm" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={15} /></AppButton>
            <AppButton variant="outline" size="iconSm" aria-label="Next page" disabled={page >= data.metapaging.total_page} onClick={() => setPage((value) => value + 1)}><ChevronRight size={15} /></AppButton>
          </div>
        </div>
      )}

      {selectedId !== null && (
        <LmsWorkflowDetailModalOS
          workflow={details.data ?? null}
          isLoading={details.isLoading}
          error={details.isError ? "Failed to load workflow detail." : null}
          onRetry={() => details.refetch()}
          onClose={() => setSelectedId(null)}
        />
      )}
    </section>
  );
}
