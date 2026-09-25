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
import type { ActionData, ActionStatus } from "@/apis/actions";
import { useSession } from "@/contexts/SessionContext";
import { useActionList } from "@/hooks/useActionList";
import { usePersistedViewMode } from "@/hooks/usePersistedViewMode";
import { useUserList } from "@/hooks/useUserList";
import { updateAction } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  Kanban,
  LayoutGrid,
  Plus,
  Search,
  Table2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const columns: { value: ActionStatus; label: string; dot: string }[] = [
  { value: "to_do", label: "To Do", dot: "bg-lime-bright" },
  { value: "in_progress", label: "In Progress", dot: "bg-lime-bright" },
  { value: "review", label: "Review", dot: "bg-lime-bright" },
  { value: "done", label: "Done", dot: "bg-lime-bright" },
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

// due is a plain YYYY-MM-DD, so parse it as a local calendar day rather than UTC midnight.
function dueLabel(due: string | null, isDone: boolean) {
  if (!due) return null;
  const [year, month, day] = due.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (diffDays < 0 && !isDone) return { text: `${Math.abs(diffDays)}d late`, late: true };
  if (diffDays === 0 && !isDone) return { text: "Today", late: false };
  return { text: target.toLocaleDateString("en-US", { month: "short", day: "numeric" }), late: false };
}

export default function TasksPageOS({ sessionToken }: { sessionToken: string }) {
  const queryClient = useQueryClient();

  const sessionUser = useSession();
  const isOwnScoped = sessionUser?.data_scope === "OWN";

  const [viewMode, setViewMode] = usePersistedViewMode<ViewModeOS>(
    "tasks_view_mode",
    ["kanban", "cards", "table"],
    "kanban"
  );

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<
    string | undefined
  >(undefined);
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [createStatus, setCreateStatus] = useState<ActionStatus | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedKeyword(keyword.trim() || undefined);
    }, 350);
    return () => clearTimeout(timeout);
  }, [keyword]);

  const { data, isLoading, isError } = useActionList(
    {
      keyword: debouncedKeyword,
      assignee_id: assigneeFilter || undefined,
    },
    !!sessionToken
  );

  const userList = useUserList(!isOwnScoped);
  const assigneeOptions: AppSelectOption[] = [
    { value: "", label: "All PICs" },
    ...(userList.map((u) => ({ value: u.id, label: u.full_name })) ?? []),
  ];

  // Optimistic local overrides so a drag feels instant while the mutation is in flight.
  const [movedStatuses, setMovedStatuses] = useState<
    Partial<Record<number, ActionStatus>>
  >({});

  const board = useMemo(
    () =>
      data?.map((action) => {
        const status = movedStatuses[action.id];
        return status ? { ...action, status } : action;
      }) ?? [],
    [data, movedStatuses]
  );

  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<ActionStatus | null>(null);
  const [editingActionId, setEditingActionId] = useState<number | null>(null);

  // The update endpoint replaces every editable field, so the unchanged ones are sent back as-is.
  const moveTo = async (action: ActionData, status: ActionStatus) => {
    if (action.status === status) return;
    const prevStatus = action.status;
    setMovedStatuses((prev) => ({ ...prev, [action.id]: status }));
    try {
      requireApiData(
        await updateAction({
          id: action.id,
          name: action.name,
          summary: action.summary,
          status,
          priority: action.priority,
          due_date: action.due_date,
          assignee_id: action.assignee_id,
        })
      );
      await queryClient.invalidateQueries({ queryKey: ["actions"] });
    } catch {
      setMovedStatuses((prev) => ({ ...prev, [action.id]: prevStatus }));
    }
  };

  const handleDrop = (status: ActionStatus) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOverStatus(null);
    const dragged = board.find((b) => b.id === draggedId);
    setDraggedId(null);
    if (dragged) void moveTo(dragged, status);
  };

  return (
    <div className="px-4 py-6 flex flex-col gap-5 h-full sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Tasks</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
            Every action you can see, in one board
          </p>
        </div>
        <AppButton size="sm" onClick={() => setCreateStatus("to_do")}>
          <Plus size={14} />
          Create New Task
        </AppButton>
      </div>

      <div className="flex flex-nowrap items-center gap-3">
        <div className="w-70 shrink-0">
          <AppInput
            inputId="tasks-search"
            icon={<Search size={14} />}
            placeholder="Search tasks..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </div>
        {!isOwnScoped && (
          <div className="w-56 shrink-0">
            <AppSelect
              selectId="tasks-assignee-filter"
              placeholder="All PICs"
              value={assigneeFilter}
              options={assigneeOptions}
              onChange={(value) => setAssigneeFilter((value as string) ?? "")}
            />
          </div>
        )}
        <ViewModeToggleOS
          value={viewMode}
          onChange={setViewMode}
          options={viewModeOptions}
          className="ml-auto shrink-0"
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
                  <span className="flex size-5 items-center justify-center rounded-full bg-lime-bright text-[11px] font-bold text-forest-deep">
                    {isLoading ? "" : items.length}
                  </span>
                </div>

                <div className="flex flex-1 min-h-0 flex-col gap-2 overflow-y-auto">
                  {items.map((action) => {
                    const due = dueLabel(action.due_date, action.status === "done");
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
            const due = dueLabel(action.due_date, action.status === "done");
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
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Priority</th>
                  <th className="px-5 py-3">Due</th>
                  <th className="px-5 py-3">Assignee</th>
                </tr>
              </thead>
              <tbody>
                {board.map((action) => {
                  const due = dueLabel(action.due_date, action.status === "done");
                  return (
                    <tr
                      key={action.id}
                      onClick={() => setEditingActionId(action.id)}
                      className="cursor-pointer border-b border-gray-200 last:border-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                    >
                      <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-zinc-100">
                        {action.name}
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
        actionId={editingActionId}
        isOpen={editingActionId !== null}
        onClose={() => setEditingActionId(null)}
      />

      <CreateActionFormOS
        isOpen={createStatus !== null}
        defaultStatus={createStatus ?? "to_do"}
        onClose={() => setCreateStatus(null)}
      />
    </div>
  );
}
