"use client";

import AppButton from "@/components/buttons/AppButton";
import EditTaskFormOS from "@/components/forms/EditTaskFormOS";
import { editStatusOptions } from "@/components/forms/CreateTaskFormOS";
import TaskStatusLabel from "@/components/labels/TaskStatusLabel";
import PriorityLabel from "@/components/labels/PriorityLabel";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import type { TaskData, TaskStatus } from "@/apis/tasks";
import { getTaskDetails, updateTask } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { initialsOf, isTaskClosed, parseDateKey } from "@/lib/tasks";
import { showErrorToast } from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarClock,
  CalendarPlus,
  History,
  Pencil,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

function formatDay(value: string) {
  return parseDateKey(value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatEnd(end: string | null, isDone: boolean) {
  if (!end) return { text: "No end date", note: null, late: false };
  const target = parseDateKey(end);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  const text = formatDay(end);

  if (isDone) return { text, note: null, late: false };
  if (diffDays < 0) return { text, note: `${Math.abs(diffDays)}d late`, late: true };
  if (diffDays === 0) return { text, note: "Today", late: false };
  return { text, note: `in ${diffDays}d`, late: false };
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof CalendarClock;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Icon size={15} className="mt-0.5 shrink-0 text-gray-400 dark:text-zinc-500" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 dark:text-zinc-400">{label}</p>
        <div className="mt-0.5 text-sm font-medium text-gray-900 dark:text-zinc-100">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function TaskDetailOS({
  sessionToken,
  taskId,
}: {
  sessionToken: string;
  taskId: number;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: task, isLoading, isError } = useQuery({
    queryKey: ["tasks", "details", taskId],
    queryFn: async () => requireApiData(await getTaskDetails(taskId)),
    enabled: !!sessionToken,
  });

  // The update endpoint replaces every editable field, so the unchanged ones are sent back as-is.
  const statusMutation = useMutation({
    mutationFn: async ({ task, status }: { task: TaskData; status: TaskStatus }) =>
      requireApiData(
        await updateTask({
          id: task.id,
          name: task.name,
          summary: task.summary,
          status,
          priority: task.priority,
          start_date: task.start_date,
          end_date: task.end_date,
          assignee_id: task.assignee_id,
        })
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (cause) =>
      showErrorToast(cause instanceof Error ? cause.message : "Failed to update status."),
  });

  if (isLoading) {
    return (
      <p className="px-8 py-12 text-center text-sm text-gray-400">Loading task...</p>
    );
  }
  if (isError || !task) {
    return (
      <p className="px-8 py-12 text-center text-sm text-red-500">
        Task not found or you do not have access.
      </p>
    );
  }

  const due = formatEnd(task.end_date, isTaskClosed(task.status));
  const pendingStatus = statusMutation.isPending ? statusMutation.variables?.status : null;
  const shownStatus = pendingStatus ?? task.status;

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <PageHeaderOS title="Task Details">
        <AppButton variant="secondary" size="sm" href="/tasks">
          <ArrowLeft size={13} />
          Back
        </AppButton>
        <AppButton variant="primary" size="sm" onClick={() => setIsEditing(true)}>
          <Pencil size={13} />
          Edit
        </AppButton>
      </PageHeaderOS>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="flex flex-col gap-5 rounded-xl border border-line bg-card-bg p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <TaskStatusLabel status={shownStatus} />
              <PriorityLabel priority={task.priority} />
            </div>
            <h3 className="mt-3 text-xl font-bold text-gray-900 dark:text-zinc-100">
              {task.name}
            </h3>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
              Summary
            </p>
            {task.summary ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-zinc-300">
                {task.summary}
              </p>
            ) : (
              <p className="mt-2 rounded-lg bg-gray-50 p-4 text-sm text-gray-400 dark:bg-zinc-800/60 dark:text-zinc-500">
                No summary yet.
              </p>
            )}
          </div>

          <div className="border-t border-line-soft pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
              Status
            </p>
            <div className="mt-2 inline-flex flex-wrap gap-1 rounded-lg border border-line p-1">
              {editStatusOptions.map((option) => {
                const value = option.value as TaskStatus;
                const isActive = shownStatus === value;
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={statusMutation.isPending}
                    onClick={() => {
                      if (value !== task.status) statusMutation.mutate({ task, status: value });
                    }}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-wait ${
                      isActive
                        ? "bg-lime-bright text-forest-deep"
                        : "text-gray-500 hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-line bg-card-bg px-5 py-2 divide-y divide-line-soft self-start">
          <DetailRow icon={CalendarPlus} label="Start date">
            {task.start_date ? formatDay(task.start_date) : "No start date"}
          </DetailRow>
          <DetailRow icon={CalendarClock} label="End date">
            <span className={due.late ? "text-red-500" : undefined}>{due.text}</span>
            {due.note && (
              <span
                className={`ml-2 text-xs font-normal ${
                  due.late ? "text-red-500" : "text-gray-400 dark:text-zinc-500"
                }`}
              >
                {due.note}
              </span>
            )}
          </DetailRow>
          <DetailRow icon={UserRound} label="Assignee">
            <span className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-[10px] font-semibold text-gray-500 dark:bg-zinc-700 dark:text-zinc-300">
                {task.assignee_avatar ? (
                  <Image
                    src={task.assignee_avatar}
                    alt={task.assignee_name ?? ""}
                    width={24}
                    height={24}
                    className="size-full object-cover"
                  />
                ) : (
                  initialsOf(task.assignee_name)
                )}
              </span>
              <span className="truncate">{task.assignee_name ?? "Unassigned"}</span>
            </span>
          </DetailRow>
          <DetailRow icon={CalendarPlus} label="Created">
            {formatTimestamp(task.created_at)}
          </DetailRow>
          <DetailRow icon={History} label="Last updated">
            {formatTimestamp(task.updated_at)}
          </DetailRow>
        </section>
      </div>

      <EditTaskFormOS
        taskId={taskId}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onDeleted={() => router.replace("/tasks")}
        hideFullPageLink
      />
    </div>
  );
}
