import type { TaskData } from "@/apis/tasks";

export type TaskDateRange = { start: string; end: string };
export type TaskCalendarSegment = {
  task: TaskData;
  column: number;
  span: number;
  lane: number;
  startsHere: boolean;
  endsHere: boolean;
};

const DAY_MS = 86_400_000;

// Calendar arithmetic uses UTC date-only values so DST cannot shorten a day.
export function addCalendarDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function calendarDayDistance(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

export function taskDateRange(task: Pick<TaskData, "start_date" | "end_date">): TaskDateRange | null {
  const start = task.start_date ?? task.end_date;
  const end = task.end_date ?? task.start_date;
  return start && end ? { start, end } : null;
}

export function resizeTaskDateRange(range: TaskDateRange, edge: "start" | "end", date: string): TaskDateRange {
  return edge === "start"
    ? { start: date > range.end ? range.end : date, end: range.end }
    : { start: range.start, end: date < range.start ? range.start : date };
}

export function moveTaskDateRange(range: TaskDateRange, from: string, to: string): TaskDateRange {
  const days = calendarDayDistance(from, to);
  return { start: addCalendarDays(range.start, days), end: addCalendarDays(range.end, days) };
}

export function taskCalendarDays(month: string) {
  const first = `${month}-01`;
  const date = new Date(`${first}T00:00:00Z`);
  const start = addCalendarDays(first, -date.getUTCDay());
  const nextMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)).toISOString().slice(0, 10);
  const cells = Math.ceil((calendarDayDistance(start, nextMonth)) / 7) * 7;
  return Array.from({ length: cells }, (_, i) => addCalendarDays(start, i));
}

export function shiftCalendarMonth(month: string, offset: number) {
  const [year, index] = month.split("-").map(Number);
  return new Date(Date.UTC(year, index - 1 + offset, 1)).toISOString().slice(0, 7);
}

// Split ranges at week boundaries and put overlapping tasks into separate lanes.
export function taskCalendarSegments(tasks: TaskData[], weekStart: string): TaskCalendarSegment[] {
  const weekEnd = addCalendarDays(weekStart, 6);
  const entries = tasks.flatMap((task) => {
    const range = taskDateRange(task);
    if (!range || range.end < weekStart || range.start > weekEnd) return [];
    const start = range.start < weekStart ? weekStart : range.start;
    const end = range.end > weekEnd ? weekEnd : range.end;
    return [{ task, start, end, range }];
  }).sort((a, b) => a.start.localeCompare(b.start) || b.end.localeCompare(a.end) || a.task.id - b.task.id);

  const laneEnds: string[] = [];
  return entries.map(({ task, start, end, range }) => {
    let lane = laneEnds.findIndex((lastEnd) => lastEnd < start);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = end;
    return {
      task,
      column: calendarDayDistance(weekStart, start),
      span: calendarDayDistance(start, end) + 1,
      lane,
      startsHere: range.start === start,
      endsHere: range.end === end,
    };
  });
}

// Keep every existing lane fixed during a date gesture; repack only after the drop.
export function taskCalendarPreviewSegments(
  tasks: TaskData[],
  weekStart: string,
  preview: TaskDateRange & { taskId: number }
): TaskCalendarSegment[] {
  const baseline = taskCalendarSegments(tasks, weekStart);
  const task = tasks.find((entry) => entry.id === preview.taskId);
  if (!task) return baseline;
  const moved = taskCalendarSegments([{ ...task, start_date: preview.start, end_date: preview.end }], weekStart)[0];
  const others = baseline.filter((segment) => segment.task.id !== preview.taskId);
  if (!moved) return others;
  const preferredLane = baseline.find((segment) => segment.task.id === preview.taskId)?.lane ?? 0;
  const overlaps = (segment: TaskCalendarSegment) => segment.column < moved.column + moved.span
    && moved.column < segment.column + segment.span;
  // Use the reserved lane if moving across another card would cover it.
  moved.lane = others.some((segment) => segment.lane === preferredLane && overlaps(segment))
    ? Math.max(-1, ...baseline.map((segment) => segment.lane)) + 1
    : preferredLane;
  return [...others, moved];
}
