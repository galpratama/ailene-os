"use client";

import type { LmsChapterTaskDetail } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import InfoTooltipOS from "@/components/elements/InfoTooltipOS";
import LmsChapterTaskFormOS from "@/components/forms/LmsChapterTaskFormOS";
import Label from "@/components/labels/Label";
import LmsContentStatusLabel from "@/components/labels/LmsContentStatusLabel";
import {
  getLmsChapterTask,
  listAllLmsChapterTaskSubmissions,
  listLmsChapterTasks,
  listLmsTools,
} from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { showErrorToast } from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ListChecks, Loader2, Pencil, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function LmsChapterTasksOS({
  projectId,
  chapterId,
  sessionToken,
  memberCount,
  onChanged,
}: {
  projectId: string;
  chapterId: number;
  sessionToken: string;
  memberCount: number;
  onChanged: () => Promise<void>;
}) {
  const client = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<LmsChapterTaskDetail | null>(
    null,
  );
  const tasks = useQuery({
    queryKey: ["lms-chapter-tasks", chapterId],
    queryFn: async () => requireApiData(await listLmsChapterTasks(chapterId)),
    enabled: !!sessionToken,
  });
  const tools = useQuery({
    queryKey: ["lms-tools"],
    queryFn: async () => requireApiData(await listLmsTools()),
    enabled: !!sessionToken,
    staleTime: Infinity,
  });
  const submissions = useQuery({
    queryKey: ["lms-chapter-task-submissions", projectId, chapterId],
    queryFn: async () =>
      requireApiData(
        await listAllLmsChapterTaskSubmissions({
          project_id: projectId,
          chapter_id: chapterId,
        }),
      ),
    enabled: !!sessionToken,
  });
  const details = useMutation({
    mutationFn: async (taskId: number) =>
      requireApiData(await getLmsChapterTask(taskId)),
    onSuccess: (task) => {
      setEditingTask(task);
      setSheetOpen(true);
    },
    onError: (error) =>
      showErrorToast(error, "Failed to load the chapter task."),
  });

  async function saved() {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["lms-chapter-tasks", chapterId] }),
      client.invalidateQueries({
        queryKey: ["lms-chapter-task-submissions", projectId, chapterId],
      }),
      client.invalidateQueries({ queryKey: ["lms-curriculum", projectId] }),
      onChanged(),
    ]);
  }

  const entries = tasks.data ?? [];
  const toolEntries = tools.data ?? [];
  const submissionCounts = new Map<number, Set<string>>();
  for (const submission of submissions.data ?? []) {
    const accessIds = submissionCounts.get(submission.task.id) ?? new Set();
    accessIds.add(submission.student.access_id);
    submissionCounts.set(submission.task.id, accessIds);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-card-bg">
      <div className="flex items-center justify-between gap-3 border-b border-line-soft px-4 py-3 sm:px-5">
        <div>
          <h2 className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-zinc-100">
            Chapter tasks
            <InfoTooltipOS
              label="Chapter tasks"
              explanation="Practical steps learners complete and submit for review."
            />
          </h2>
        </div>
        <AppButton
          type="button"
          size="sm"
          disabled={tools.isPending || toolEntries.length === 0}
          title={
            toolEntries.length === 0 && !tools.isPending
              ? "Create a tool before adding a task"
              : "Add chapter task"
          }
          onClick={() => {
            setEditingTask(null);
            setSheetOpen(true);
          }}
        >
          <Plus size={13} /> Add task
        </AppButton>
      </div>

      {tasks.isPending ? (
        <p className="px-4 py-10 text-center text-xs text-gray-500 dark:text-zinc-400 sm:px-5">
          Loading chapter tasks...
        </p>
      ) : tasks.isError ? (
        <div className="px-4 py-8 text-center sm:px-5">
          <p className="text-xs text-merah">{tasks.error.message}</p>
          <AppButton
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => tasks.refetch()}
          >
            Try again
          </AppButton>
        </div>
      ) : entries.length === 0 ? (
        <div className="px-4 py-8 text-center sm:px-5">
          <ListChecks size={22} className="mx-auto text-gray-400" />
          <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400">
            No practical tasks yet.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3 p-4 sm:p-5">
          {entries.map((task) => {
            const submitted = submissionCounts.get(task.id)?.size ?? 0;
            const percentage =
              memberCount > 0
                ? Math.min(100, Math.round((submitted / memberCount) * 100))
                : 0;
            return (
              <li
                key={task.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-gray-50 p-3 dark:bg-zinc-800/50"
              >
                <Image
                  src={task.tool.image_url}
                  alt={`${task.tool.name} logo`}
                  width={56}
                  height={56}
                  className="size-14 shrink-0 rounded-lg border border-line bg-white object-contain p-1.5"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="text-sm font-semibold leading-snug text-gray-900 dark:text-zinc-100">
                      {task.name}
                    </h3>
                    <Label variant="gray">{task.tool.name}</Label>
                    {task.status !== "active" && (
                      <LmsContentStatusLabel status={task.status} />
                    )}
                  </div>
                  {task.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-zinc-400">
                      {task.description}
                    </p>
                  )}
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between gap-3 text-[11px] text-gray-500 dark:text-zinc-400">
                      <span>
                        {submissions.isPending
                          ? "Loading progress..."
                          : submissions.isError
                            ? "Progress unavailable"
                            : `${submitted} of ${memberCount} submitted`}
                      </span>
                      {submissions.isSuccess && (
                        <span className="font-semibold tabular-nums text-gray-700 dark:text-zinc-200">
                          {percentage}%
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-zinc-700">
                      <div
                        className="h-full rounded-full bg-claude transition-[width] dark:bg-lime-bright"
                        style={{
                          width: `${submissions.isSuccess ? percentage : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <AppButton
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={details.isPending}
                  onClick={() => details.mutate(task.id)}
                >
                  {details.isPending && details.variables === task.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Pencil size={13} />
                  )}
                  Edit
                </AppButton>
              </li>
            );
          })}
        </ul>
      )}

      {sheetOpen && (
        <LmsChapterTaskFormOS
          projectId={projectId}
          chapterId={chapterId}
          task={editingTask}
          tools={toolEntries}
          onClose={() => setSheetOpen(false)}
          onSaved={saved}
        />
      )}
    </section>
  );
}
