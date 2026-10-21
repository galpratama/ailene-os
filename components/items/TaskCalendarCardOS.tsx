"use client";

import AppButton from "@/components/buttons/AppButton";
import TaskAssigneeAvatarOS from "@/components/elements/TaskAssigneeAvatarOS";
import TaskStatusLabel from "@/components/labels/TaskStatusLabel";
import type { TaskCalendarSegment } from "@/lib/task-calendar";
import type { KeyboardEvent, PointerEvent } from "react";

export default function TaskCalendarCardOS({
  segment,
  disabled,
  onOpen,
  onResizeStart,
  onResizeKey,
}: {
  segment: TaskCalendarSegment;
  disabled: boolean;
  onOpen: () => void;
  onResizeStart: (event: PointerEvent<HTMLButtonElement>, edge: "start" | "end") => void;
  onResizeKey: (event: KeyboardEvent<HTMLButtonElement>, edge: "start" | "end") => void;
}) {
  const { task, startsHere, endsHere } = segment;
  return (
    <div
      data-task-calendar-card={task.id}
      className={`group relative mx-1.5 min-w-0 rounded-lg border border-line bg-card-bg ${disabled ? "opacity-60" : "hover:border-claude/60"}`}
      style={{ gridColumn: `${segment.column + 1} / span ${segment.span}`, gridRow: segment.lane + 1 }}
    >
      <AppButton
        type="button"
        variant="bare"
        size="bare"
        disabled={disabled}
        className="h-full w-full min-w-0 flex-col items-stretch justify-center gap-1 px-2 text-left"
        onClick={onOpen}
        title={task.name}
      >
        <span className="truncate text-xs font-semibold text-gray-900 dark:text-zinc-100">{task.name}</span>
        <span className="flex min-w-0 items-center justify-between gap-1">
          <TaskAssigneeAvatarOS name={task.assignee_name} avatar={task.assignee_avatar} />
          <span className="min-w-0"><TaskStatusLabel status={task.status} className="max-w-full" /></span>
        </span>
      </AppButton>
      {(["start", "end"] as const).map((edge) => {
        if (edge === "start" ? !startsHere : !endsHere) return null;
        return (
          <AppButton
            key={edge}
            type="button"
            variant="bare"
            size="bare"
            disabled={disabled}
            aria-label={`Resize ${edge} date: ${task.name}`}
            title={`Drag to change ${edge} date, or use left/right arrow keys`}
            className={`absolute inset-y-0 w-2 touch-none cursor-ew-resize! items-center justify-center opacity-0 hover:bg-claude/15 group-hover:opacity-100 focus-visible:opacity-100 ${edge === "start" ? "left-0 rounded-l-lg" : "right-0 rounded-r-lg"}`}
            onPointerDown={(event) => onResizeStart(event, edge)}
            onKeyDown={(event) => onResizeKey(event, edge)}
            onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}
          >
            <span aria-hidden="true" className="h-5 w-0.5 rounded-full bg-gray-400 dark:bg-zinc-500" />
          </AppButton>
        );
      })}
    </div>
  );
}
