"use client";

import type { LmsChapterTask, LmsChapterTaskDetail, LmsContent, LmsProjectContentEntry, LmsProjectContentKind } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import FileTypeIconOS, { fileTypeFromUrl } from "@/components/elements/FileTypeIconOS";
import { lmsChapterLabel } from "@/components/fields/LmsChapterPickerOS";
import LmsChapterTaskFormOS from "@/components/forms/LmsChapterTaskFormOS";
import LmsMaterialFormOS from "@/components/forms/LmsMaterialFormOS";
import LmsVideoFormOS from "@/components/forms/LmsVideoFormOS";
import LmsContentStatusLabel from "@/components/labels/LmsContentStatusLabel";
import { getLmsChapterTask, listLmsChapterSessions, listLmsProjectContents, listLmsProjectTasks, listLmsTools } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { showErrorToast } from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IconTicTac } from "@tabler/icons-react";
import { Pencil, PlayCircle, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type TabKind = LmsProjectContentKind | "task";
type SelectedContent = { chapterId: number | null; content: LmsContent | null };
type SelectedTask = { chapterId: number | null; task: LmsChapterTaskDetail | null };

const headings: Record<TabKind, { title: string; singular: string }> = {
  material: { title: "Materials", singular: "material" },
  video: { title: "Videos", singular: "video" },
  test: { title: "Tests", singular: "test" },
  task: { title: "Tasks", singular: "task" },
};

function ContentPreview({ kind, content }: { kind: LmsProjectContentKind; content: LmsContent }) {
  if (kind === "material") {
    return <span className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-line bg-card-bg p-1"><FileTypeIconOS type={fileTypeFromUrl(content.file_url)} compact /></span>;
  }
  return (
    <span className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-line bg-card-bg text-claude dark:text-lime-bright">
      {kind === "video" ? <PlayCircle size={32} /> : <IconTicTac size={32} />}
    </span>
  );
}

function ContentCard({ entry, kind, onEdit }: { entry: LmsProjectContentEntry; kind: LmsProjectContentKind; onEdit: () => void }) {
  const content = entry.content;
  return (
    <li className="flex min-w-0 items-start gap-3 rounded-xl border border-line bg-gray-50 p-4 dark:bg-zinc-800/50">
      <ContentPreview kind={kind} content={content} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-zinc-100">{content.title}</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">{lmsChapterLabel(entry.chapter)}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
              {kind === "test" && <span>{content.kind === "pre_test" ? "Pre-test" : "Post-test"} · {content.questions.length} questions</span>}
              {kind === "material" && <span>{fileTypeFromUrl(content.file_url) === "TEXT" ? "Reading" : fileTypeFromUrl(content.file_url)}</span>}
              {kind === "video" && <span>{content.video_type === "recording" ? "Recording" : content.video_type === "short" ? "Short" : "Video"}</span>}
              {content.status === "inactive" && <LmsContentStatusLabel status={content.status} />}
            </div>
          </div>
          <AppButton variant="secondary" size="iconSm" title={`Edit ${content.title}`} aria-label={`Edit ${content.title}`} onClick={onEdit}><Pencil size={13} /></AppButton>
        </div>
      </div>
    </li>
  );
}

function TaskCard({ task, chapterSortOrder, onEdit, disabled }: { task: LmsChapterTask; chapterSortOrder?: number; onEdit: () => void; disabled: boolean }) {
  return (
    <li className="flex min-w-0 items-start gap-3 rounded-xl border border-line bg-gray-50 p-4 dark:bg-zinc-800/50">
      <Image src={task.tool.image_url} alt="" width={56} height={56} className="size-14 shrink-0 rounded-lg border border-line bg-card-bg object-contain" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-zinc-100">{task.name}</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">{lmsChapterLabel({ ...task.chapter, sort_order: chapterSortOrder })} · {task.tool.name}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
              <span>{task.step_count} steps</span>
              {task.status === "inactive" && <LmsContentStatusLabel status={task.status} />}
            </div>
          </div>
          <AppButton variant="secondary" size="iconSm" title={`Edit ${task.name}`} aria-label={`Edit ${task.name}`} disabled={disabled} onClick={onEdit}><Pencil size={13} /></AppButton>
        </div>
      </div>
    </li>
  );
}

export default function LmsProjectContentOS({ projectId, sessionToken, kind }: { projectId: string; sessionToken: string; kind: TabKind }) {
  const client = useQueryClient();
  const router = useRouter();
  const [selectedContent, setSelectedContent] = useState<SelectedContent | null>(null);
  const [selectedTask, setSelectedTask] = useState<SelectedTask | null>(null);
  const chapters = useQuery({
    queryKey: ["lms-chapter-sessions", projectId],
    queryFn: async () => requireApiData(await listLmsChapterSessions(projectId)),
    enabled: !!sessionToken,
  });
  const contents = useQuery({
    queryKey: ["lms-project-content", projectId, kind],
    queryFn: async () => kind === "task" ? requireApiData(await listLmsProjectTasks(projectId)) : requireApiData(await listLmsProjectContents(projectId, kind)),
    enabled: !!sessionToken,
  });
  const tools = useQuery({
    queryKey: ["lms-tools"],
    queryFn: async () => requireApiData(await listLmsTools()),
    enabled: !!sessionToken && kind === "task",
    staleTime: Infinity,
  });
  const taskDetails = useMutation({
    mutationFn: async (taskId: number) => requireApiData(await getLmsChapterTask(taskId)),
    onSuccess: (task) => setSelectedTask({ chapterId: task.chapter.id, task }),
    onError: (error) => showErrorToast(error, "Failed to load task."),
  });
  const chapterEntries = chapters.data ?? [];
  const chapterSortOrders = new Map(chapterEntries.map((chapter) => [chapter.id, chapter.sort_order]));
  const heading = headings[kind];
  const count = contents.data?.length ?? 0;
  const isLoading = chapters.isPending || contents.isPending;
  const error = chapters.error ?? contents.error ?? (kind === "task" ? tools.error : null);

  async function saved(chapterId: number, previousChapterId?: number) {
    const affectedChapters = [...new Set([chapterId, previousChapterId].filter((id): id is number => id !== undefined))];
    await Promise.all([
      client.invalidateQueries({ queryKey: ["lms-project-content", projectId] }),
      client.invalidateQueries({ queryKey: ["lms-chapter-sessions", projectId] }),
      ...affectedChapters.flatMap((id) => [
        client.invalidateQueries({ queryKey: ["lms-chapter-contents", id] }),
        client.invalidateQueries({ queryKey: ["lms-chapter-tasks", id] }),
        client.invalidateQueries({ queryKey: ["lms-chapter-task-submissions", projectId, id] }),
        client.invalidateQueries({ queryKey: ["lms-chapter-analytics", projectId, id] }),
      ]),
    ]);
  }
  function startCreate() {
    if (kind === "test") router.push(`/lms/${projectId}/tests/new`);
    else if (kind === "task") setSelectedTask({ chapterId: null, task: null });
    else setSelectedContent({ chapterId: null, content: null });
  }
  function editContent(entry: LmsProjectContentEntry) {
    if (kind === "test") router.push(`/lms/${projectId}/chapters/${entry.chapter.id}/tests/${entry.content.kind === "pre_test" ? "pre-test" : "post-test"}?from=project`);
    else setSelectedContent({ chapterId: entry.chapter.id, content: entry.content });
  }

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-line bg-card-bg">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">{heading.title}</h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">{count} {count === 1 ? heading.singular : heading.title.toLowerCase()} across this project</p>
          </div>
          <AppButton size="sm" onClick={startCreate} disabled={chapters.isPending || chapterEntries.length === 0 || (kind === "task" && (tools.isPending || !tools.data?.length))}><Plus size={14} /> Add {heading.singular}</AppButton>
        </div>
        {error ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-merah">{error.message}</p>
            <AppButton variant="outline" size="sm" className="mt-3" onClick={() => { void chapters.refetch(); void contents.refetch(); if (kind === "task") void tools.refetch(); }}>Try again</AppButton>
          </div>
        ) : isLoading ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500 dark:text-zinc-400">Loading {heading.title.toLowerCase()}...</p>
        ) : !chapterEntries.length ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500 dark:text-zinc-400">Create a session and chapter before adding {heading.title.toLowerCase()}.</p>
        ) : kind === "task" && !tools.data?.length ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500 dark:text-zinc-400">Create an LMS tool before adding tasks.</p>
        ) : !count ? (
          <p className="px-5 py-12 text-center text-sm text-gray-500 dark:text-zinc-400">No {heading.title.toLowerCase()} yet.</p>
        ) : (
          <ul className="grid gap-3 p-4 lg:grid-cols-2 sm:p-5">
            {kind === "task"
              ? (contents.data as LmsChapterTask[]).map((task) => <TaskCard key={task.id} task={task} chapterSortOrder={chapterSortOrders.get(task.chapter.id)} disabled={taskDetails.isPending} onEdit={() => taskDetails.mutate(task.id)} />)
              : (contents.data as LmsProjectContentEntry[]).map((entry) => <ContentCard key={`${entry.chapter.id}-${entry.content.kind}-${entry.content.id}`} entry={entry} kind={kind} onEdit={() => editContent(entry)} />)}
          </ul>
        )}
      </section>
      {kind === "material" && selectedContent && <LmsMaterialFormOS projectId={projectId} chapterId={selectedContent.chapterId} chapters={chapterEntries} material={selectedContent.content} onClose={() => setSelectedContent(null)} onSaved={saved} />}
      {kind === "video" && selectedContent && <LmsVideoFormOS projectId={projectId} chapterId={selectedContent.chapterId} chapters={chapterEntries} video={selectedContent.content} onClose={() => setSelectedContent(null)} onSaved={saved} />}
      {kind === "task" && selectedTask && <LmsChapterTaskFormOS projectId={projectId} chapterId={selectedTask.chapterId} chapters={chapterEntries} task={selectedTask.task} tools={tools.data ?? []} onClose={() => setSelectedTask(null)} onSaved={saved} />}
    </>
  );
}
