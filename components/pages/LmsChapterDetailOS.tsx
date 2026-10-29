"use client";

import type { LmsChapterEntry, LmsProjectEntry } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import InfoTooltipOS from "@/components/elements/InfoTooltipOS";
import LmsChapterFormOS from "@/components/forms/LmsChapterFormOS";
import LmsSessionMethodLabel from "@/components/labels/LmsSessionMethodLabel";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import LmsChapterContentOS from "@/components/static-sections/LmsChapterContentOS";
import LmsChapterFeedbackOS from "@/components/static-sections/LmsChapterFeedbackOS";
import LmsChapterMembersOS from "@/components/static-sections/LmsChapterMembersOS";
import LmsChapterStatsOS from "@/components/static-sections/LmsChapterStatsOS";
import {
  deleteLmsChapter,
  getLmsChapterAnalytics,
  listLmsChapterContents,
  listLmsChapterSessions,
  listLmsLevels,
  updateLmsSchedule,
} from "@/lib/actions";
import { requireApiData, requireApiSuccess } from "@/lib/api-result";
import { showErrorToast } from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, Clock3, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

function sessionDate(value: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", {
    ...options,
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

export default function LmsChapterDetailOS({
  projectId,
  sessionToken,
  project,
  chapter,
  loadError,
}: {
  projectId: string;
  sessionToken: string;
  project: LmsProjectEntry | null;
  chapter: LmsChapterEntry | null;
  loadError: string | null;
}) {
  const client = useQueryClient();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const chapterId = chapter?.id ?? 0;
  const enabled = !!sessionToken && !!chapter;
  const sessionsQuery = useQuery({
    queryKey: ["lms-chapter-sessions", projectId],
    queryFn: async () =>
      requireApiData(await listLmsChapterSessions(projectId)),
    enabled,
  });
  const analyticsQuery = useQuery({
    queryKey: ["lms-chapter-analytics", projectId, chapterId],
    queryFn: async () =>
      requireApiData(
        await getLmsChapterAnalytics({
          project_id: projectId,
          chapter_id: chapterId,
        }),
      ),
    enabled,
  });
  const levelsQuery = useQuery({
    queryKey: ["lms-levels"],
    queryFn: async () => requireApiData(await listLmsLevels()),
    enabled,
    staleTime: Infinity,
  });
  const contentsQuery = useQuery({
    queryKey: ["lms-chapter-contents", chapterId],
    queryFn: async () =>
      requireApiData(await listLmsChapterContents(chapterId)),
    enabled,
    refetchOnWindowFocus: false,
  });

  const chapters = sessionsQuery.data ?? [];
  const levels = levelsQuery.data ?? [];
  const levelNumber = levels.find(
    (level) => level.id === chapter?.level_id,
  )?.level_number;
  const sessions = [
    ...(chapters.find((item) => item.id === chapterId)?.sessions ?? []),
  ].sort(
    (a, b) =>
      new Date(a.session_date).getTime() - new Date(b.session_date).getTime(),
  );
  const firstSession = sessions[0];
  const analytics = analyticsQuery.data;
  const feedbackLockState =
    sessions.length === 0
      ? "open"
      : sessions.every((session) => session.is_survey_locked)
        ? "locked"
        : sessions.some((session) => session.is_survey_locked)
          ? "mixed"
          : "open";
  const feedbackLock = useMutation({
    mutationFn: async (locked: boolean) => {
      await Promise.all(
        sessions
          .filter((session) => session.is_survey_locked !== locked)
          .map((session) =>
            updateLmsSchedule({
              project_id: projectId,
              chapter_id: chapterId,
              session_id: session.id,
              only_group_id: session.only_group_id,
              session_date: session.session_date,
              duration_minutes: session.duration_minutes,
              location_name: session.location_name,
              location_url: session.location_url,
              method: session.method,
              trainer_id: session.trainer_id,
              status: session.status,
              is_locked: session.is_locked,
              is_survey_locked: locked,
            }).then(requireApiData),
          ),
      );
    },
    onSuccess: async (_, locked) => {
      toast.success(locked ? "Feedback locked." : "Feedback opened.");
    },
    onSettled: async () => {
      await client.invalidateQueries({
        queryKey: ["lms-chapter-sessions", projectId],
      });
    },
    onError: (error) =>
      showErrorToast(error, "Failed to update the feedback lock."),
  });

  async function refresh() {
    await Promise.all([
      client.invalidateQueries({
        queryKey: ["lms-chapter-contents", chapterId],
      }),
      client.invalidateQueries({
        queryKey: ["lms-chapter-analytics", projectId, chapterId],
      }),
      client.invalidateQueries({
        queryKey: ["lms-chapter-sessions", projectId],
      }),
    ]);
  }

  async function removeChapter() {
    setIsDeleting(true);
    try {
      requireApiSuccess(
        await deleteLmsChapter({
          project_id: projectId,
          chapter_id: chapterId,
        }),
      );
      toast.success("Chapter deleted.");
      await client.invalidateQueries({
        queryKey: ["lms-chapter-sessions", projectId],
      });
      router.replace(`/lms/${projectId}`);
    } catch (error) {
      showErrorToast(error, "Failed to delete chapter.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <div>
        <AppButton variant="secondary" size="sm" href={`/lms/${projectId}`}>
          <ArrowLeft size={14} /> {project?.name ?? "Project overview"}
        </AppButton>
      </div>

      {loadError && (
        <p
          role="alert"
          className="rounded-xl border border-merah/30 bg-merah-t px-4 py-3 text-xs text-merah"
        >
          {loadError}
        </p>
      )}

      {chapter && (
        <>
          <header className="rounded-2xl bg-zinc-900 p-6 text-white dark:bg-zinc-800 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-lime-bright px-2.5 py-0.5 text-xs font-semibold text-forest-deep">
                  {levelNumber === undefined
                    ? chapter.level_name
                    : `Level ${levelNumber}`}
                </span>
                {chapter.status !== "active" && (
                  <span className="rounded-full border border-white/20 px-2.5 py-0.5 text-xs text-white/70">
                    Inactive
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <AppButton
                  variant="white"
                  size="sm"
                  disabled={!levels.length}
                  onClick={() => setEditing(true)}
                >
                  <Pencil size={13} /> Edit chapter
                </AppButton>
                <AppButton
                  variant="bare"
                  size="iconSm"
                  className="rounded-lg text-white/60 hover:bg-white/10 hover:text-white"
                  title="Delete chapter"
                  aria-label="Delete chapter"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 size={14} />
                </AppButton>
              </div>
            </div>

            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-2xl leading-tight sm:text-3xl">
                    {chapter.name}
                  </h1>
                  {chapter.description && (
                    <InfoTooltipOS
                      label={chapter.name}
                      explanation={chapter.description}
                      tone="onDark"
                    />
                  )}
                </div>
                {firstSession && (
                  <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/70">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      {sessionDate(firstSession.session_date, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1.5 tabular-nums">
                      <Clock3 size={14} />
                      {sessionDate(firstSession.session_date, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      WIB
                    </span>
                    <LmsSessionMethodLabel method={firstSession.method} />
                    {sessions.length > 1 && (
                      <span className="text-white/50">
                        +{sessions.length - 1} more sessions
                      </span>
                    )}
                  </p>
                )}
              </div>
              <dl className="flex gap-8 sm:gap-10">
                {[
                  {
                    label: "Participants",
                    value: analytics ? String(analytics.member_count) : "—",
                  },
                  {
                    label: "Avg. post-test",
                    value:
                      analytics?.post_test.average_score?.toFixed(1) ?? "—",
                  },
                  {
                    label: "Feedback",
                    value: analytics?.survey.average?.toFixed(1) ?? "—",
                  },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dd className="font-heading text-3xl tabular-nums">
                      {stat.value}
                    </dd>
                    <dt className="mt-1 text-xs text-white/55">{stat.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </header>

          {analyticsQuery.isError ? (
            <div className="rounded-2xl border border-line bg-card-bg px-4 py-10 text-center sm:px-5">
              <p className="text-xs text-merah">
                {analyticsQuery.error.message}
              </p>
              <AppButton
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => analyticsQuery.refetch()}
              >
                Try again
              </AppButton>
            </div>
          ) : (
            analytics && <LmsChapterStatsOS analytics={analytics} />
          )}

          <LmsChapterContentOS
            projectId={projectId}
            chapterId={chapter.id}
            contents={contentsQuery.data ?? []}
            analytics={analytics}
            isPending={contentsQuery.isPending}
            error={contentsQuery.error}
            onRetry={() => contentsQuery.refetch()}
            onChanged={refresh}
          />

          {analyticsQuery.data && (
            <>
              <LmsChapterFeedbackOS
                responses={analyticsQuery.data.survey.responses}
                lockState={feedbackLockState}
                canUpdateLock={sessions.length > 0}
                isUpdatingLock={feedbackLock.isPending}
                onLockChange={(locked) => feedbackLock.mutate(locked)}
              />
              <LmsChapterMembersOS analytics={analyticsQuery.data} />
            </>
          )}

          {editing && (
            <LmsChapterFormOS
              projectId={projectId}
              chapter={chapter}
              levels={levels}
              onClose={() => setEditing(false)}
              onSaved={async () => {
                toast.success("Chapter saved.");
                setEditing(false);
                await client.invalidateQueries({
                  queryKey: ["lms-chapter-sessions", projectId],
                });
                router.refresh();
              }}
            />
          )}
          <AlertConfirmationOS
            isOpen={confirmDelete}
            onClose={() => setConfirmDelete(false)}
            onConfirm={removeChapter}
            title="Delete chapter?"
            message={`Delete "${chapter.name}"? Chapters that still have sessions, content, or learner history cannot be deleted; remove those first.`}
            confirmLabel="Delete"
            destructive
            isPending={isDeleting}
          />
        </>
      )}
    </div>
  );
}
