"use client";

import type { TaskData } from "@/apis/tasks";
import AppButton from "@/components/buttons/AppButton";
import TaskCalendarCardOS from "@/components/items/TaskCalendarCardOS";
import {
  addCalendarDays,
  resizeTaskDateRange,
  shiftCalendarMonth,
  taskCalendarDays,
  taskCalendarPreviewSegments,
  taskCalendarSegments,
  taskDateRange,
  type TaskDateRange,
} from "@/lib/task-calendar";
import { todayDateKey } from "@/lib/tasks";
import { showErrorToast } from "@/lib/toast";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

type RangePreview = TaskDateRange & { taskId: number; layoutTasks?: TaskData[] };
type ResizeGesture = {
  task: TaskData;
  tasks: TaskData[];
  edge: "start" | "end";
  original: TaskDateRange;
  preview: TaskDateRange;
  pointerId: number;
  weeks: { start: string; left: number; top: number; bottom: number; width: number }[];
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TaskCalendarOS({
  tasks,
  isLoading,
  onOpen,
  onResize,
}: {
  tasks: TaskData[];
  isLoading: boolean;
  onOpen: (id: number) => void;
  onResize: (task: TaskData, range: TaskDateRange) => Promise<void>;
}) {
  const [month, setMonth] = useState(() => todayDateKey().slice(0, 7));
  const [preview, setPreview] = useState<RangePreview | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const gestureRef = useRef<ResizeGesture | null>(null);
  const savingRef = useRef(false);
  const today = todayDateKey();
  const days = taskCalendarDays(month);
  const weeks = Array.from({ length: days.length / 7 }, (_, i) => days.slice(i * 7, i * 7 + 7));
  const shownTasks = tasks.map((task) => task.id === preview?.taskId
    ? { ...task, start_date: preview.start, end_date: preview.end }
    : task);
  const layoutTasks = preview?.layoutTasks ?? tasks;
  const monthLabel = new Date(`${month}-01T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long", year: "numeric", timeZone: "UTC",
  });

  async function saveRange(task: TaskData, range: TaskDateRange) {
    if (savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    setPreview({ taskId: task.id, ...range });
    try {
      await onResize(task, range);
    } catch (error) {
      showErrorToast(error, "Failed to update task dates.");
    } finally {
      savingRef.current = false;
      setIsSaving(false);
      setPreview(null);
    }
  }

  function startResize(event: PointerEvent<HTMLButtonElement>, task: TaskData, edge: "start" | "end") {
    if (event.button !== 0 || savingRef.current || gestureRef.current) return;
    const original = taskDateRange(task);
    const calendar = calendarRef.current;
    if (!original || !calendar) return;
    event.preventDefault();
    event.stopPropagation();
    const rects = Array.from(calendar.querySelectorAll<HTMLElement>("[data-calendar-week]")).map((row) => {
      const rect = row.getBoundingClientRect();
      return { start: row.dataset.calendarWeek!, left: rect.left, top: rect.top, bottom: rect.bottom, width: rect.width };
    });
    gestureRef.current = { task, tasks, edge, original, preview: original, pointerId: event.pointerId, weeks: rects };
    setPreview({ taskId: task.id, ...original, layoutTasks: tasks });
    calendar.focus({ preventScroll: true });
    calendar.setPointerCapture(event.pointerId);
  }

  function moveResize(event: PointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const week = gesture.weeks.find((row) => event.clientY < row.bottom) ?? gesture.weeks[gesture.weeks.length - 1];
    if (!week) return;
    const column = Math.max(0, Math.min(6, Math.floor((event.clientX - week.left) / (week.width / 7))));
    const range = resizeTaskDateRange(gesture.original, gesture.edge, addCalendarDays(week.start, column));
    gesture.preview = range;
    setPreview({ taskId: gesture.task.id, ...range, layoutTasks: gesture.tasks });
  }

  function endResize(event: PointerEvent<HTMLDivElement>, cancel: boolean) {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    gestureRef.current = null;
    if (calendarRef.current?.hasPointerCapture(event.pointerId)) calendarRef.current.releasePointerCapture(event.pointerId);
    if (!cancel && (gesture.original.start !== gesture.preview.start || gesture.original.end !== gesture.preview.end)) {
      void saveRange(gesture.task, gesture.preview);
    } else {
      setPreview(null);
    }
  }

  function resizeWithKey(event: KeyboardEvent<HTMLButtonElement>, task: TaskData, edge: "start" | "end") {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    event.stopPropagation();
    const original = taskDateRange(task);
    if (!original || savingRef.current || event.repeat) return;
    const range = resizeTaskDateRange(original, edge, addCalendarDays(original[edge], event.key === "ArrowLeft" ? -1 : 1));
    if (range.start !== original.start || range.end !== original.end) void saveRange(task, range);
  }

  function cancelResize() {
    const gesture = gestureRef.current;
    if (!gesture) return;
    gestureRef.current = null;
    if (calendarRef.current?.hasPointerCapture(gesture.pointerId)) calendarRef.current.releasePointerCapture(gesture.pointerId);
    setPreview(null);
  }

  return (
    <section aria-label="Task calendar" className="relative min-w-0 shrink-0 overflow-hidden rounded-xl border border-line bg-card-bg">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{monthLabel}</h3>
        <div className="flex items-center gap-2">
          {(isLoading || isSaving) && <Loader2 size={14} className="animate-spin text-gray-400" aria-label={isSaving ? "Saving dates" : "Loading tasks"} />}
          <AppButton type="button" variant="outline" size="icon" aria-label="Previous month" disabled={!!preview} onClick={() => setMonth(shiftCalendarMonth(month, -1))}><ChevronLeft size={15} /></AppButton>
          <AppButton type="button" variant="outline" size="sm" disabled={!!preview} onClick={() => setMonth(today.slice(0, 7))}>Today</AppButton>
          <AppButton type="button" variant="outline" size="icon" aria-label="Next month" disabled={!!preview} onClick={() => setMonth(shiftCalendarMonth(month, 1))}><ChevronRight size={15} /></AppButton>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div
          ref={calendarRef}
          tabIndex={-1}
          className={`min-w-280 outline-none ${preview && !isSaving ? "select-none cursor-ew-resize" : ""}`}
          onPointerMove={moveResize}
          onPointerUp={(event) => endResize(event, false)}
          onPointerCancel={(event) => endResize(event, true)}
          onLostPointerCapture={cancelResize}
          onKeyDown={(event) => { if (event.key === "Escape") cancelResize(); }}
          onScrollCapture={cancelResize}
        >
          <div className="grid grid-cols-7 border-b border-line-soft">
            {WEEKDAYS.map((day) => <div key={day} className="py-2 text-center text-xs font-medium text-gray-400 dark:text-zinc-500">{day}</div>)}
          </div>
          {weeks.map((week) => {
            const segments = preview?.layoutTasks
              ? taskCalendarPreviewSegments(layoutTasks, week[0], preview)
              : taskCalendarSegments(shownTasks, week[0]);
            const originalSegments = taskCalendarSegments(layoutTasks, week[0]);
            // Reserve one extra lane so row geometry stays still during a resize.
            const lanes = Math.max(1, ...originalSegments.map((segment) => segment.lane + 1));
            const height = Math.max(164, 40 + (lanes + 1) * 70);
            return (
              <div key={week[0]} data-calendar-week={week[0]} className="relative border-b border-line-soft last:border-b-0" style={{ height }}>
                <div className="absolute inset-0 grid grid-cols-7">
                  {week.map((day, index) => (
                    <div key={day} className={`min-w-0 border-r border-line-soft px-2 py-1.5 last:border-r-0 ${day.slice(0, 7) !== month || index === 0 || index === 6 ? "bg-dashboard-bg/50" : ""}`}>
                      <time dateTime={day} className={`ml-auto flex size-6 items-center justify-center rounded-full text-xs ${day === today ? "bg-claude font-semibold text-white" : "text-gray-500 dark:text-zinc-400"}`} aria-current={day === today ? "date" : undefined}>{Number(day.slice(-2))}</time>
                    </div>
                  ))}
                </div>
                <div className="relative grid grid-cols-7 gap-y-1.5 pt-10" style={{ gridAutoRows: 64 }}>
                  {segments.map((segment) => (
                    <TaskCalendarCardOS
                      key={segment.task.id}
                      segment={segment}
                      disabled={isSaving}
                      onOpen={() => { if (!gestureRef.current) onOpen(segment.task.id); }}
                      onResizeStart={(event, edge) => startResize(event, segment.task, edge)}
                      onResizeKey={(event, edge) => resizeWithKey(event, segment.task, edge)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {preview ? `${isSaving ? "Saving" : "Preview"}: ${preview.start} → ${preview.end}` : ""}
      </p>
    </section>
  );
}
