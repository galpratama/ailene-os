"use client";

import AppButton from "@/components/buttons/AppButton";
import ViewModeToggleOS, {
  type ViewModeOS,
} from "@/components/buttons/ViewModeToggleOS";
import TaskAssigneeAvatarOS from "@/components/elements/TaskAssigneeAvatarOS";
import AppFilterMenu, { AppFilterChips } from "@/components/fields/AppFilterMenu";
import AppInput from "@/components/fields/AppInput";
import CreateTaskFormOS from "@/components/forms/CreateTaskFormOS";
import EditTaskFormOS from "@/components/forms/EditTaskFormOS";
import PriorityLabel from "@/components/labels/PriorityLabel";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import TaskTableOS from "@/components/static-sections/TaskTableOS";
import TaskCalendarOS from "@/components/static-sections/TaskCalendarOS";
import type { TaskData, TaskStatus } from "@/apis/tasks";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { useTaskList } from "@/hooks/useTaskList";
import { usePersistedViewMode } from "@/hooks/usePersistedViewMode";
import { getTaskDetails, updateTask } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { endDateLabel, taskUpdatePayload } from "@/lib/tasks";
import type { TaskDateRange } from "@/lib/task-calendar";
import { showErrorToast } from "@/lib/toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CalendarClock,
  Kanban,
  Plus,
  Search,
  Table2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

// Archived tasks stay visible in the table and calendar, outside the active kanban.
const columns: { value: TaskStatus; label: string; dot: string }[] = [
  { value: "to_do", label: "To Do", dot: "bg-lime-bright" },
  { value: "backlog", label: "Backlog", dot: "bg-lime-bright" },
  { value: "in_progress", label: "In Progress", dot: "bg-lime-bright" },
  { value: "review", label: "Review", dot: "bg-lime-bright" },
  { value: "done", label: "Done", dot: "bg-lime-bright" },
];

const viewModeOptions = [
  { value: "kanban" as const, label: "Kanban", icon: Kanban },
  { value: "calendar" as const, label: "Calendar", icon: CalendarDays },
  { value: "table" as const, label: "Table", icon: Table2 },
];

function EndDateBadge({ task }: { task: TaskData }) {
  const due = endDateLabel(task.end_date, task.status);
  if (!due) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium ${
        due.late ? "text-red-500" : "text-gray-400 dark:text-zinc-500"
      }`}
    >
      <CalendarClock size={11} />
      {due.text}
    </span>
  );
}

export default function TasksPageOS({
  sessionToken,
}: {
  sessionToken: string;
}) {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = usePersistedViewMode<ViewModeOS>(
    "tasks_view_mode",
    ["kanban", "calendar", "table"],
    "kanban",
    { cards: "calendar" }
  );

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<string | undefined>(
    undefined
  );
  const filters = useTaskFilters({ includeArchived: viewMode !== "kanban" });
  const [createStatus, setCreateStatus] = useState<TaskStatus | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedKeyword(keyword.trim() || undefined);
    }, 350);
    return () => clearTimeout(timeout);
  }, [keyword]);

  const { data, isLoading, isError } = useTaskList(
    { ...filters.apiFilters, keyword: debouncedKeyword },
    !!sessionToken,
    viewMode !== "kanban"
  );

  // A status filter narrows the board to that one column.
  const statusFilter = filters.apiFilters.status;
  const shownColumns = statusFilter
    ? columns.filter((col) => col.value === statusFilter)
    : columns;

  function changeViewMode(next: ViewModeOS) {
    if (next === "kanban" && filters.values.status === "archived") {
      filters.setValues((current) => ({ ...current, status: "" }));
    }
    setViewMode(next);
  }

  // Optimistic local overrides so a drag feels instant while the mutation is in flight.
  const [movedStatuses, setMovedStatuses] = useState<
    Partial<Record<number, TaskStatus>>
  >({});

  const board = useMemo(
    () =>
      data?.map((task) => {
        const status = movedStatuses[task.id];
        return status ? { ...task, status } : task;
      }) ?? [],
    [data, movedStatuses]
  );

  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(
    null
  );
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  // The update endpoint replaces every editable field, so the unchanged ones are sent back as-is.
  const moveTo = async (task: TaskData, status: TaskStatus) => {
    if (task.status === status) return;
    setMovedStatuses((prev) => ({ ...prev, [task.id]: status }));
    try {
      requireApiData(
        await updateTask(taskUpdatePayload(task, { status }))
      );
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (error) {
      showErrorToast(error, "Failed to update task status.");
    } finally {
      setMovedStatuses((current) => {
        const next = { ...current };
        delete next[task.id];
        return next;
      });
    }
  };

  async function resizeDates(task: TaskData, range: TaskDateRange) {
    const current = requireApiData(await getTaskDetails(task.id));
    if (current.start_date !== task.start_date || current.end_date !== task.end_date) {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      throw new Error("Task dates changed while you were resizing. Please try again.");
    }
    requireApiData(await updateTask(taskUpdatePayload(current, { start_date: range.start, end_date: range.end })));
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }

  const handleDrop =
    (status: TaskStatus) => (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOverStatus(null);
      const dragged = board.find((b) => b.id === draggedId);
      setDraggedId(null);
      if (dragged) void moveTo(dragged, status);
    };

  return (
    <div className="min-w-0 px-4 py-6 flex flex-col gap-5 sm:px-8">
      <PageHeaderOS
        title="Tasks"
        description="Every task you can see, in one board"
        action={{
          label: "Create New Task",
          icon: Plus,
          onClick: () => setCreateStatus("to_do"),
        }}
      />

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <AppInput
            inputId="tasks-search"
            icon={<Search size={14} />}
            placeholder="Search tasks..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="max-w-full sm:max-w-70"
          />
          <AppFilterMenu
            menuId="tasks-filters"
            fields={filters.fields}
            values={filters.values}
            onChange={filters.setValues}
          />
          <ViewModeToggleOS
            value={viewMode}
            onChange={changeViewMode}
            options={viewModeOptions}
            className="ml-auto shrink-0"
          />
        </div>
        <AppFilterChips
          fields={filters.fields}
          values={filters.values}
          onChange={filters.setValues}
        />
      </div>

      {isError && (
        <p className="text-sm text-red-500 py-8 text-center">
          Failed to load tasks. You may not have access to this data.
        </p>
      )}

      {!isError && viewMode === "kanban" && (
        <div className="flex min-w-0 gap-4 overflow-x-auto pb-2" aria-label="Task kanban board">
          {shownColumns.map((col) => {
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
                className={`flex max-h-[calc(100dvh-15rem)] min-h-120 w-72 shrink-0 flex-col gap-2 rounded-xl border p-3 transition-colors ${
                  isOver
                    ? "border-claude bg-claude/5"
                    : "border-line bg-dashboard-bg"
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
                  {items.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => setDraggedId(task.id)}
                      onDragEnd={() => setDraggedId(null)}
                      onClick={() => setEditingTaskId(task.id)}
                      className={`rounded-lg border border-line bg-kanban-card-bg p-3 flex flex-col gap-2 cursor-grab active:cursor-grabbing transition-opacity hover:border-claude/40 ${
                        draggedId === task.id ? "opacity-50" : ""
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100 line-clamp-3">
                        {task.name}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <PriorityLabel priority={task.priority} />
                          <EndDateBadge task={task} />
                        </div>
                        <TaskAssigneeAvatarOS
                          name={task.assignee_name}
                          avatar={task.assignee_avatar}
                        />
                      </div>
                    </div>
                  ))}

                  {!isLoading && items.length === 0 && (
                    <p className="text-xs text-gray-400 dark:text-zinc-500 text-center py-6">
                      No tasks
                    </p>
                  )}
                </div>

                <AppButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="shrink-0 w-full justify-start"
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

      {!isError && viewMode === "calendar" && (
        <TaskCalendarOS tasks={board} isLoading={isLoading} onOpen={setEditingTaskId} onResize={resizeDates} />
      )}

      {!isError && viewMode === "table" && (
        <TaskTableOS
          tasks={board}
          isLoading={isLoading}
          onOpen={setEditingTaskId}
          showDoneAt={statusFilter === "archived"}
        />
      )}

      <EditTaskFormOS
        taskId={editingTaskId}
        isOpen={editingTaskId !== null}
        onClose={() => setEditingTaskId(null)}
      />

      <CreateTaskFormOS
        isOpen={createStatus !== null}
        defaultStatus={createStatus ?? "to_do"}
        onClose={() => setCreateStatus(null)}
      />
    </div>
  );
}
