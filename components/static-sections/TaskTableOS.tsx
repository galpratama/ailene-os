"use client";

import TaskAssigneeAvatarOS from "@/components/elements/TaskAssigneeAvatarOS";
import PriorityLabel from "@/components/labels/PriorityLabel";
import TaskStatusLabel from "@/components/labels/TaskStatusLabel";
import type { TaskData } from "@/apis/tasks";
import { endDateLabel } from "@/lib/tasks";
import { CalendarClock } from "lucide-react";

function formatDoneAt(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function TaskTableOS({
  tasks,
  isLoading,
  onOpen,
  showDoneAt = false,
}: {
  tasks: TaskData[];
  isLoading: boolean;
  onOpen: (taskId: number) => void;
  // The archive lists finished tasks, so it shows when each was done.
  showDoneAt?: boolean;
}) {
  return (
    <div className="shrink-0 overflow-hidden rounded-xl border border-line bg-card-bg">
      <div className="overflow-x-auto">
        <table className="w-full min-w-190 text-sm">
          <thead>
            <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
              <th className="px-5 py-3">Task</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Priority</th>
              <th className="px-5 py-3">End</th>
              <th className="px-5 py-3">PIC</th>
              {showDoneAt && <th className="px-5 py-3">Done</th>}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const due = endDateLabel(task.end_date, task.status);
              const doneAt = formatDoneAt(task.done_at);
              return (
                <tr
                  key={task.id}
                  onClick={() => onOpen(task.id)}
                  className="cursor-pointer border-b border-line-soft last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-zinc-100">
                    {task.name}
                  </td>
                  <td className="px-5 py-3.5">
                    <TaskStatusLabel status={task.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <PriorityLabel priority={task.priority} />
                  </td>
                  <td className="px-5 py-3.5">
                    {due ? (
                      <span
                        className={`inline-flex items-center gap-1 ${
                          due.late
                            ? "text-red-500"
                            : "text-gray-500 dark:text-zinc-400"
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
                      <TaskAssigneeAvatarOS
                        name={task.assignee_name}
                        avatar={task.assignee_avatar}
                      />
                      <span className="truncate text-xs text-gray-700 dark:text-zinc-300">
                        {task.assignee_name ?? "Unassigned"}
                      </span>
                    </div>
                  </td>
                  {showDoneAt && (
                    <td className="px-5 py-3.5 text-gray-500 dark:text-zinc-400">
                      {doneAt ?? (
                        <span className="text-gray-300 dark:text-zinc-600">—</span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {!isLoading && tasks.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-10">
            No tasks found.
          </p>
        )}
      </div>
    </div>
  );
}
