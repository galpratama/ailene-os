"use client";

import AppButton from "@/components/buttons/AppButton";
import ViewModeToggleOS, {
  type ViewModeOS,
} from "@/components/buttons/ViewModeToggleOS";
import AppInput from "@/components/fields/AppInput";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import CreateActionFormOS from "@/components/forms/CreateActionFormOS";
import EditActionFormOS from "@/components/forms/EditActionFormOS";
import ActionStatusLabel from "@/components/labels/ActionStatusLabel";
import PriorityLabel from "@/components/labels/PriorityLabel";
import { usePersistedViewMode } from "@/hooks/usePersistedViewMode";
import { setSessionToken, trpc } from "@/trpc/client";
import type { B2BActionStatusEnum } from "@prisma/client";
import {
  Building2,
  CalendarClock,
  Kanban,
  LayoutGrid,
  Plus,
  Search,
  Table2,
} from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const columns: { value: B2BActionStatusEnum; label: string; dot: string }[] = [
  { value: "TO_DO", label: "To Do", dot: "bg-gray-400" },
  { value: "IN_PROGRESS", label: "In Progress", dot: "bg-biru" },
  { value: "REVIEW", label: "Review", dot: "bg-kuning" },
  { value: "DONE", label: "Done", dot: "bg-hijau" },
];

const viewModeOptions = [
  { value: "kanban" as const, label: "Kanban", icon: Kanban },
  { value: "cards" as const, label: "Cards", icon: LayoutGrid },
  { value: "table" as const, label: "Table", icon: Table2 },
];

function initialsOf(name: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function dueLabel(due: string | Date | null, isDone: boolean) {
  if (!due) return null;
  const target = new Date(due);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (diffDays < 0 && !isDone) return { text: `${Math.abs(diffDays)}d late`, late: true };
  if (diffDays === 0 && !isDone) return { text: "Today", late: false };
  return { text: target.toLocaleDateString("en-US", { month: "short", day: "numeric" }), late: false };
}

export default function TasksPageOS({ sessionToken }: { sessionToken: string }) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const utils = trpc.useUtils();

  const [viewMode, setViewMode] = usePersistedViewMode<ViewModeOS>(
    "tasks_view_mode",
    ["kanban", "cards", "table"],
    "kanban"
  );

  // Deep-linked from a project's "View Detail Task" button as
  // /tasks?pipeline_id=<id> — pre-selects that pipeline in the filter.
  const searchParams = useSearchParams();
  const linkedPipelineId = searchParams.get("pipeline_id");

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<
    string | undefined
  >(undefined);
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [pipelineFilter, setPipelineFilter] = useState<number | null>(
    linkedPipelineId ? Number(linkedPipelineId) : null
  );
  const [createStatus, setCreateStatus] = useState<B2BActionStatusEnum | null>(
    null
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedKeyword(keyword.trim() || undefined);
    }, 350);
    return () => clearTimeout(timeout);
  }, [keyword]);

  const { data, isLoading, isError } = trpc.list.b2b.allActions.useQuery(
    {
      page_size: 500,
      keyword: debouncedKeyword,
      assignee_id: assigneeFilter || undefined,
      pipeline_id: pipelineFilter ?? undefined,
    },
    { enabled: !!sessionToken }
  );

  const { data: userData } = trpc.list.users.useQuery(
    { page: 1, page_size: 200 },
    { enabled: !!sessionToken }
  );
  const assigneeOptions: AppSelectOption[] = [
    { value: "", label: "All PICs" },
    ...(userData?.list.map((u) => ({ value: u.id, label: u.full_name })) ?? []),
  ];

  const { data: pipelineData } = trpc.list.b2b.pipelines.useQuery(
    { page: 1, page_size: 200 },
    { enabled: !!sessionToken }
  );
  const pipelineOptions: AppSelectOption[] = [
    { value: null, label: "All Pipelines" },
    ...(pipelineData?.list.map((p) => ({
      value: p.id,
      label: `${p.company_name} - ${p.name}`,
    })) ?? []),
  ];

  const updateAction = trpc.update.b2b.action.useMutation();

  // Optimistic local overrides so a drag feels instant while the mutation is in flight.
  const [movedStatuses, setMovedStatuses] = useState<
    Partial<Record<number, B2BActionStatusEnum>>
  >({});

  const board = useMemo(
    () =>
      data?.list.map((action) => {
        const status = movedStatuses[action.id];
        return status ? { ...action, status } : action;
      }) ?? [],
    [data?.list, movedStatuses]
  );

  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<B2BActionStatusEnum | null>(null);
  const [editingActionId, setEditingActionId] = useState<number | null>(null);

  const moveTo = (id: number, status: B2BActionStatusEnum) => {
    const current = board.find((b) => b.id === id);
    if (!current || current.status === status) return;
    const prevStatus = current.status;
    setMovedStatuses((prev) => ({ ...prev, [id]: status }));
    updateAction.mutate(
      { id, status },
      {
        onError: () => {
          setMovedStatuses((prev) => ({ ...prev, [id]: prevStatus }));
        },
        onSuccess: () => utils.list.b2b.allActions.invalidate(),
      }
    );
  };

  const handleDrop = (status: B2BActionStatusEnum) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverStatus(null);
    const id = draggedId;
    setDraggedId(null);
    if (id != null) moveTo(id, status);
  };

  return (
    <div className="px-4 py-6 flex flex-col gap-5 h-full sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Tasks</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
            Every action across every client, in one board
          </p>
        </div>
        <AppButton size="sm" onClick={() => setCreateStatus("TO_DO")}>
          <Plus size={14} />
          Create New Task
        </AppButton>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <AppInput
          inputId="tasks-search"
          icon={<Search size={14} />}
          placeholder="Search tasks..."
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className="max-w-70"
        />
        <div className="w-full max-w-56">
          <AppSelect
            selectId="tasks-assignee-filter"
            placeholder="All PICs"
            value={assigneeFilter}
            options={assigneeOptions}
            onChange={(value) => setAssigneeFilter((value as string) ?? "")}
          />
        </div>
        <div className="w-full max-w-70">
          <AppSelect
            selectId="tasks-pipeline-filter"
            placeholder="All Pipelines"
            value={pipelineFilter}
            options={pipelineOptions}
            onChange={(value) => setPipelineFilter(value as number | null)}
          />
        </div>
        <ViewModeToggleOS
          value={viewMode}
          onChange={setViewMode}
          options={viewModeOptions}
          className="ml-auto"
        />
      </div>

      {isError && (
        <p className="text-sm text-red-500 py-8 text-center">
          Failed to load tasks. You may not have access to this data.
        </p>
      )}

      {!isError && viewMode === "kanban" && (
        <div className="flex flex-1 gap-4 min-h-0 overflow-x-auto pb-1 lg:grid lg:grid-cols-4 lg:overflow-visible">
          {columns.map((col) => {
            const items = board.filter((b) => b.status === col.value);
            const isOver = dragOverStatus === col.value;
            return (
              <div
                key={col.value}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverStatus(col.value);
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget === e.target) setDragOverStatus(null);
                }}
                onDrop={handleDrop(col.value)}
                className={`flex w-70 shrink-0 flex-col h-full min-h-0 gap-2 rounded-xl border p-3 transition-colors lg:w-auto lg:min-w-0 ${
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
                    {isLoading ? "" : items.length}
                  </span>
                </div>

                <div className="flex flex-1 min-h-0 flex-col gap-2 overflow-y-auto">
                  {items.map((action) => {
                    const due = dueLabel(action.due_date, action.status === "DONE");
                    return (
                      <div
                        key={action.id}
                        draggable
                        onDragStart={() => setDraggedId(action.id)}
                        onDragEnd={() => setDraggedId(null)}
                        onClick={() => setEditingActionId(action.id)}
                        className={`rounded-lg border border-dashboard-border bg-card-bg p-3 flex flex-col gap-2 cursor-grab active:cursor-grabbing transition-opacity hover:border-claude/40 ${
                          draggedId === action.id ? "opacity-50" : ""
                        }`}
                      >
                        <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100 line-clamp-3">
                          {action.name}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 dark:text-zinc-500">
                          <Building2 size={11} />
                          {action.company_name}
                        </span>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <PriorityLabel priority={action.priority} />
                            {due && (
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                                  due.late ? "text-red-500" : "text-gray-400 dark:text-zinc-500"
                                }`}
                              >
                                <CalendarClock size={11} />
                                {due.text}
                              </span>
                            )}
                          </div>
                          <div className="flex size-5.5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-700 text-[10px] font-semibold text-gray-500 dark:text-zinc-300">
                            {action.assignee_avatar ? (
                              <Image
                                src={action.assignee_avatar}
                                alt={action.assignee_name ?? ""}
                                width={22}
                                height={22}
                                className="size-full object-cover"
                              />
                            ) : (
                              initialsOf(action.assignee_name)
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {!isLoading && items.length === 0 && (
                    <p className="text-xs text-gray-400 dark:text-zinc-500 text-center py-6">No tasks</p>
                  )}
                </div>

                <AppButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 w-full justify-start hover:bg-white dark:hover:bg-zinc-800"
                  onClick={() => setCreateStatus(col.value)}
                >
                  <Plus size={13} />
                  Add task
                </AppButton>
              </div>
            );
          })}
        </div>
      )}

      {!isError && viewMode === "cards" && (
        <div className="grid shrink-0 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {board.map((action) => {
            const due = dueLabel(action.due_date, action.status === "DONE");
            return (
              <div
                key={action.id}
                role="button"
                tabIndex={0}
                onClick={() => setEditingActionId(action.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setEditingActionId(action.id);
                  }
                }}
                className="flex cursor-pointer flex-col gap-3 rounded-xl border border-gray-300 bg-card-bg p-5 text-left transition-colors hover:border-claude/60 dark:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900 dark:text-zinc-100 line-clamp-2">
                    {action.name}
                  </p>
                  <ActionStatusLabel status={action.status} />
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 dark:text-zinc-500">
                  <Building2 size={12} />
                  {action.company_name}
                </span>
                <div className="mt-1 flex items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <PriorityLabel priority={action.priority} />
                    {due && (
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                          due.late ? "text-red-500" : "text-gray-400 dark:text-zinc-500"
                        }`}
                      >
                        <CalendarClock size={11} />
                        {due.text}
                      </span>
                    )}
                  </div>
                  <div className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-700 text-[10px] font-semibold text-gray-500 dark:text-zinc-300">
                    {action.assignee_avatar ? (
                      <Image
                        src={action.assignee_avatar}
                        alt={action.assignee_name ?? ""}
                        width={24}
                        height={24}
                        className="size-full object-cover"
                      />
                    ) : (
                      initialsOf(action.assignee_name)
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {!isLoading && board.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-10 sm:col-span-2 xl:col-span-3">
              No tasks found.
            </p>
          )}
        </div>
      )}

      {!isError && viewMode === "table" && (
        <div className="shrink-0 overflow-hidden rounded-xl border border-gray-300 bg-card-bg dark:border-zinc-700">
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-800">
                  <th className="px-5 py-3">Task</th>
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Due</th>
                  <th className="px-5 py-3">Assignee</th>
                </tr>
              </thead>
              <tbody>
                {board.map((action) => {
                  const due = dueLabel(action.due_date, action.status === "DONE");
                  return (
                    <tr
                      key={action.id}
                      onClick={() => setEditingActionId(action.id)}
                      className="cursor-pointer border-b border-gray-200 last:border-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                    >
                      <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-zinc-100">
                        {action.name}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">
                        <span className="inline-flex items-center gap-1">
                          <Building2 size={12} className="text-gray-400" />
                          {action.company_name}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <ActionStatusLabel status={action.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <PriorityLabel priority={action.priority} />
                      </td>
                      <td className="px-5 py-3.5">
                        {due ? (
                          <span
                            className={`inline-flex items-center gap-1 ${
                              due.late ? "text-red-500" : "text-gray-500 dark:text-zinc-400"
                            }`}
                          >
                            <CalendarClock size={12} />
                            {due.text}
                          </span>
                        ) : (
                          <span className="text-gray-300 dark:text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex size-5.5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-700 text-[10px] font-semibold text-gray-500 dark:text-zinc-300">
                            {action.assignee_avatar ? (
                              <Image
                                src={action.assignee_avatar}
                                alt={action.assignee_name ?? ""}
                                width={22}
                                height={22}
                                className="size-full object-cover"
                              />
                            ) : (
                              initialsOf(action.assignee_name)
                            )}
                          </div>
                          <span className="truncate text-xs text-gray-700 dark:text-zinc-300">
                            {action.assignee_name ?? "Unassigned"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!isLoading && board.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-10">
                No tasks found.
              </p>
            )}
          </div>
        </div>
      )}

      <EditActionFormOS
        sessionToken={sessionToken}
        actionId={editingActionId}
        isOpen={editingActionId !== null}
        onClose={() => setEditingActionId(null)}
      />

      <CreateActionFormOS
        sessionToken={sessionToken}
        isOpen={createStatus !== null}
        defaultStatus={createStatus ?? "TO_DO"}
        onClose={() => setCreateStatus(null)}
      />
    </div>
  );
}
