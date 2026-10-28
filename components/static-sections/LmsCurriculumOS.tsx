"use client";

import type {
  LmsChapter,
  LmsContentKind,
  LmsGroupEntry,
  LmsSchedule,
} from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import LmsChapterFormOS from "@/components/forms/LmsChapterFormOS";
import LmsContentFormOS from "@/components/forms/LmsContentFormOS";
import LmsScheduleFormOS from "@/components/forms/LmsScheduleFormOS";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import LmsCurriculumNavOS, {
  type LmsCurriculumView,
} from "@/components/navigations/LmsCurriculumNavOS";
import LmsSessionOverviewOS from "@/components/static-sections/LmsSessionOverviewOS";
import {
  deleteLmsChapter,
  deleteLmsContent,
  deleteLmsSchedule,
  getLmsCurriculum,
} from "@/lib/actions";
import { requireApiData, requireApiSuccess } from "@/lib/api-result";
import { showErrorToast } from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Loader2, Plus, RefreshCw } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

type Deletion =
  | { type: "chapter"; chapterId: number; name: string }
  | { type: "content"; chapterId: number; kind: LmsContentKind; name: string }
  | { type: "schedule"; chapterId: number; sessionId: number; name: string };

export default function LmsCurriculumOS({
  projectId,
  sessionToken,
  groups,
  onDirtyChange,
  initialChapterId = null,
}: {
  projectId: string;
  sessionToken: string;
  groups: LmsGroupEntry[];
  onDirtyChange: (dirty: boolean) => void;
  initialChapterId?: number | null;
}) {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["lms-curriculum", projectId],
    queryFn: async () => requireApiData(await getLmsCurriculum(projectId)),
    enabled: !!sessionToken,
    refetchOnWindowFocus: false,
  });
  const [selectedId, setSelectedId] = useState<number | null>(initialChapterId);
  const [view, setView] = useState<LmsCurriculumView>("overview");
  const [keyword, setKeyword] = useState("");
  const [chapterSheet, setChapterSheet] = useState<{
    chapter: LmsChapter | null;
  } | null>(null);
  const [scheduleSheet, setScheduleSheet] = useState<{
    chapterId: number;
    schedule: LmsSchedule | null;
  } | null>(null);
  const [deleting, setDeleting] = useState<Deletion | null>(null);
  const [revision, setRevision] = useState(0);
  const [contentDirty, setContentDirty] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<{
    run: () => void;
  } | null>(null);
  const markDirty = useCallback(
    (dirty: boolean) => {
      setContentDirty(dirty);
      onDirtyChange(dirty);
    },
    [onDirtyChange],
  );
  function navigate(run: () => void) {
    if (contentDirty)
      setPendingNavigation({
        run: () => {
          setRevision((value) => value + 1);
          run();
        },
      });
    else run();
  }
  const chapters = query.data?.chapters ?? [];
  const selected =
    chapters.find((chapter) => chapter.id === selectedId) ?? chapters[0];
  async function refresh() {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["lms-curriculum", projectId] }),
      client.invalidateQueries({ queryKey: ["lms-chapter-sessions", projectId] }),
    ]);
    setRevision((value) => value + 1);
  }
  const deletion = useMutation({
    mutationFn: async (target: Deletion) => {
      const ref = { project_id: projectId, chapter_id: target.chapterId };
      const result =
        target.type === "chapter"
          ? await deleteLmsChapter(ref)
          : target.type === "content"
            ? await deleteLmsContent({ ...ref, kind: target.kind })
            : await deleteLmsSchedule({ ...ref, session_id: target.sessionId });
      requireApiSuccess(result);
    },
    onSuccess: async (_, target) => {
      setDeleting(null);
      if (target.type === "chapter") {
        setSelectedId(null);
        setView("overview");
      }
      toast.success("Deleted successfully.");
      await refresh();
    },
    onError: (error) => showErrorToast(error),
  });
  return (
    <section className="flex min-w-0 flex-col gap-4 text-gray-900 dark:text-zinc-100">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Project content</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Build sessions, add learning content, and manage when participants
            can access it.
          </p>
        </div>
        <AppButton
          onClick={() => navigate(() => setChapterSheet({ chapter: null }))}
          disabled={!query.data?.levels.length}
        >
          <Plus size={15} />
          New session
        </AppButton>
      </div>
      {query.isPending ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-line py-16 text-sm text-gray-500 dark:text-zinc-400">
          <Loader2 size={16} className="animate-spin" />
          Loading sessions...
        </div>
      ) : query.isError ? (
        <div className="rounded-xl border border-line bg-card-bg p-8 text-center">
          <p className="text-sm text-merah">{query.error.message}</p>
          <AppButton
            variant="outline"
            className="mt-4"
            onClick={() => query.refetch()}
          >
            <RefreshCw size={14} />
            Try again
          </AppButton>
        </div>
      ) : !chapters.length ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-line bg-card-bg px-6 py-16 text-center">
          <span className="mb-5 flex size-14 items-center justify-center rounded-2xl border border-line bg-gray-50 text-gray-400 dark:bg-zinc-800">
            <BookOpen size={25} />
          </span>
          <h3 className="text-lg font-semibold">
            Start with your first session
          </h3>
          <p className="mt-2 max-w-96 text-sm text-gray-500 dark:text-zinc-400">
            Each session brings together pre-test, material, video, quiz, and
            post-test in one place.
          </p>
          <AppButton
            className="mt-6"
            onClick={() => navigate(() => setChapterSheet({ chapter: null }))}
            disabled={!query.data?.levels.length}
          >
            <Plus size={14} />
            Create session
          </AppButton>
          {!query.data?.levels.length && (
            <p className="mt-3 text-xs text-merah">
              Learning levels must be configured before creating a session.
            </p>
          )}
        </div>
      ) : (
        <div className="flex min-w-0 flex-col items-stretch overflow-clip rounded-xl border border-line bg-card-bg lg:flex-row">
          <LmsCurriculumNavOS
            chapters={chapters}
            levels={query.data?.levels ?? []}
            selectedId={selected?.id}
            view={view}
            keyword={keyword}
            onSearch={setKeyword}
            onSelect={(id, nextView) =>
              navigate(() => {
                setSelectedId(id);
                setView(nextView);
              })
            }
          />
          <div className="min-w-0 flex-1">
            {selected &&
              (view === "overview" ? (
                <LmsSessionOverviewOS
                  chapter={selected}
                  groups={groups}
                  levelName={
                    query.data?.levels.find(
                      (level) => level.id === selected.level_id,
                    )?.name ?? "Learning content"
                  }
                  onContent={setView}
                  onEdit={() => setChapterSheet({ chapter: selected })}
                  onDelete={() =>
                    setDeleting({
                      type: "chapter",
                      chapterId: selected.id,
                      name: selected.name,
                    })
                  }
                  onSchedule={(schedule) =>
                    setScheduleSheet({ chapterId: selected.id, schedule })
                  }
                  onDeleteSchedule={(schedule) =>
                    setDeleting({
                      type: "schedule",
                      chapterId: selected.id,
                      sessionId: schedule.id,
                      name: "this schedule",
                    })
                  }
                />
              ) : (
                <LmsContentFormOS
                  key={`${selected.id}-${view}-${revision}`}
                  projectId={projectId}
                  chapterId={selected.id}
                  kind={view}
                  content={selected.contents.find(
                    (content) => content.kind === view,
                  )}
                  onSaved={refresh}
                  onDirtyChange={markDirty}
                  onDelete={() =>
                    setDeleting({
                      type: "content",
                      chapterId: selected.id,
                      kind: view,
                      name:
                        selected.contents.find(
                          (content) => content.kind === view,
                        )?.title ?? view,
                    })
                  }
                />
              ))}
          </div>
        </div>
      )}
      {chapterSheet && (
        <LmsChapterFormOS
          projectId={projectId}
          chapter={chapterSheet.chapter}
          levels={query.data?.levels ?? []}
          onClose={() => setChapterSheet(null)}
          onSaved={async (id) => {
            await refresh();
            setSelectedId(id);
            setView("overview");
            setKeyword("");
            setChapterSheet(null);
            toast.success("Session saved.");
          }}
        />
      )}
      {scheduleSheet && (
        <LmsScheduleFormOS
          projectId={projectId}
          chapterId={scheduleSheet.chapterId}
          groups={groups}
          schedule={scheduleSheet.schedule}
          onClose={() => setScheduleSheet(null)}
          onSaved={async () => {
            await refresh();
            toast.success("Schedule saved.");
          }}
        />
      )}
      <AlertConfirmationOS
        isOpen={!!deleting}
        onClose={() => !deletion.isPending && setDeleting(null)}
        onConfirm={() => deleting && deletion.mutate(deleting)}
        title={
          deleting?.type === "chapter"
            ? "Delete session"
            : deleting?.type === "schedule"
              ? "Delete schedule"
              : "Delete content"
        }
        message={`Delete ${deleting?.name ?? "this item"}? ${deleting?.type === "chapter" ? "Its learning content and schedules will also be deleted. " : ""}This cannot be undone. Items with participant progress or survey responses cannot be deleted.`}
        confirmLabel="Delete"
        destructive
        isPending={deletion.isPending}
      />
      <AlertConfirmationOS
        isOpen={!!pendingNavigation}
        onClose={() => setPendingNavigation(null)}
        onConfirm={() => {
          pendingNavigation?.run();
          setPendingNavigation(null);
        }}
        title="Discard unsaved changes?"
        message="Your changes have not been saved. Discard them and continue to the selected menu?"
        confirmLabel="Discard changes"
        destructive
      />
    </section>
  );
}
