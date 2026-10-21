import type { TaskData, TaskStatus, UpdateTaskPayload } from "@/apis/tasks";

// The API replaces all editable columns even when only a status or date changes.
export function taskUpdatePayload(
  task: TaskData,
  changes: Partial<Pick<UpdateTaskPayload, "status" | "start_date" | "end_date">>
): UpdateTaskPayload {
  return {
    id: task.id,
    name: task.name,
    summary: task.summary,
    status: task.status,
    priority: task.priority,
    start_date: task.start_date,
    end_date: task.end_date,
    assignee_id: task.assignee_id,
    ...changes,
  };
}

// Done and archived tasks are finished, so their due dates never read as late.
export function isTaskClosed(status: TaskStatus) {
  return status === "done" || status === "archived";
}

export function initialsOf(name: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

// Today as a local YYYY-MM-DD, the value a date input holds.
export function todayDateKey() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// Dates are plain YYYY-MM-DD, so parse them as local calendar days rather than UTC midnight.
export function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// The API rejects a start after the end, so forms flag it under the end date first.
export function dateOrderError(start: string, end: string) {
  return start && end && start > end
    ? "End date must not be before the start date."
    : undefined;
}

export function endDateLabel(end: string | null, status: TaskStatus) {
  if (!end) return null;
  const isClosed = isTaskClosed(status);
  const target = parseDateKey(end);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / 86_400_000
  );

  if (diffDays < 0 && !isClosed)
    return { text: `${Math.abs(diffDays)}d late`, late: true };
  if (diffDays === 0 && !isClosed) return { text: "Today", late: false };
  return {
    text: target.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    late: false,
  };
}
