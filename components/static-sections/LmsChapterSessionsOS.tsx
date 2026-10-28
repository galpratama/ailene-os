"use client";

import type { LmsChapterSessionsEntry, LmsGroupEntry, LmsSchedule } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import LmsScheduleFormOS from "@/components/forms/LmsScheduleFormOS";
import LmsContentStatusLabel from "@/components/labels/LmsContentStatusLabel";
import { listLmsChapterSessions } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, CalendarDays, Clock3, LockKeyhole, MapPin, Pencil, Plus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type SessionSheet = { chapterId: number | null; schedule: LmsSchedule | null };

function scheduleDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function ChapterSchedule({
  schedule,
  groups,
  onEdit,
}: {
  schedule: LmsSchedule;
  groups: LmsGroupEntry[];
  onEdit: () => void;
}) {
  const groupName = schedule.only_group_id === null
    ? "All groups"
    : groups.find((group) => group.id === schedule.only_group_id)?.name ?? "Group unavailable";

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line-soft py-3 text-xs text-gray-500 dark:text-zinc-400 first:border-t-0 first:pt-0 last:pb-0">
      <span className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-zinc-200">
        <CalendarDays size={14} className="text-gray-400" />
        {scheduleDate(schedule.session_date)} WIB
      </span>
      <span className="flex items-center gap-1.5"><Users size={13} />{groupName}</span>
      <span className="flex items-center gap-1.5"><Clock3 size={13} />{schedule.duration_minutes} min</span>
      <span className="flex items-center gap-1.5"><MapPin size={13} />{schedule.location_name || (schedule.method === "online" ? "Online" : "In person")}</span>
      {schedule.is_locked && <span className="flex items-center gap-1.5"><LockKeyhole size={13} />Locked</span>}
      <LmsContentStatusLabel status={schedule.status} />
      <AppButton variant="secondary" size="iconSm" className="ml-auto" aria-label="Edit session" onClick={onEdit}>
        <Pencil size={13} />
      </AppButton>
    </div>
  );
}

function ChapterRow({
  chapter,
  groups,
  onOpen,
}: {
  chapter: LmsChapterSessionsEntry;
  groups: LmsGroupEntry[];
  onOpen: (sheet: SessionSheet) => void;
}) {
  const schedules = [...chapter.sessions].sort(
    (a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime(),
  );

  return (
    <article className="border-t border-line-soft px-5 py-5 first:border-t-0 sm:px-6">
      <div className="flex items-start gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-gray-50 text-claude dark:bg-zinc-800">
          <BookOpen size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-400 dark:text-zinc-500">{chapter.level_name}</p>
          <h3 className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-zinc-100">{chapter.name}</h3>
          {chapter.description && <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-zinc-400">{chapter.description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LmsContentStatusLabel status={chapter.status} />
          <AppButton variant="outline" size="sm" onClick={() => onOpen({ chapterId: chapter.id, schedule: null })}>
            <Plus size={13} /> Add session
          </AppButton>
        </div>
      </div>
      <div className="ml-14 mt-4 rounded-xl border border-line-soft bg-gray-50/60 px-4 py-3 dark:bg-zinc-800/30">
        {schedules.length ? (
          schedules.map((schedule) => (
            <ChapterSchedule
              key={schedule.id}
              schedule={schedule}
              groups={groups}
              onEdit={() => onOpen({ chapterId: chapter.id, schedule })}
            />
          ))
        ) : (
          <p className="text-xs text-gray-400 dark:text-zinc-500">No session yet.</p>
        )}
      </div>
    </article>
  );
}

export default function LmsChapterSessionsOS({
  projectId,
  sessionToken,
  groups,
}: {
  projectId: string;
  sessionToken: string;
  groups: LmsGroupEntry[];
}) {
  const client = useQueryClient();
  const [sheet, setSheet] = useState<SessionSheet | null>(null);
  const query = useQuery({
    queryKey: ["lms-chapter-sessions", projectId],
    queryFn: async () => requireApiData(await listLmsChapterSessions(projectId)),
    enabled: !!sessionToken,
  });
  const chapters = query.data ?? [];

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-card-bg">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">Chapter sessions</h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">Chapters and their schedules across all groups.</p>
        </div>
        <AppButton size="sm" disabled={!chapters.length} onClick={() => setSheet({ chapterId: null, schedule: null })}>
          <Plus size={13} /> Add session
        </AppButton>
      </div>
      {query.isPending ? (
        <p className="px-6 py-12 text-center text-sm text-gray-500 dark:text-zinc-400">Loading chapter sessions...</p>
      ) : query.isError ? (
        <div className="px-6 py-10 text-center">
          <p className="text-sm text-merah">{query.error.message}</p>
          <AppButton variant="outline" size="sm" className="mt-3" onClick={() => query.refetch()}>Try again</AppButton>
        </div>
      ) : chapters.length ? (
        chapters.map((chapter) => (
          <ChapterRow
            key={chapter.id}
            chapter={chapter}
            groups={groups}
            onOpen={setSheet}
          />
        ))
      ) : (
        <div className="px-6 py-12 text-center">
          <BookOpen size={24} className="mx-auto text-gray-400" />
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-zinc-200">No chapters yet</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">Add the first chapter to build the learning journey.</p>
        </div>
      )}
      {sheet && (
        <LmsScheduleFormOS
          projectId={projectId}
          chapterId={sheet.chapterId}
          chapters={chapters}
          groups={groups}
          schedule={sheet.schedule}
          onClose={() => setSheet(null)}
          onSaved={async () => {
            toast.success("Session saved.");
            await Promise.all([
              client.invalidateQueries({ queryKey: ["lms-chapter-sessions", projectId] }),
              client.invalidateQueries({ queryKey: ["lms-curriculum", projectId] }),
            ]);
          }}
        />
      )}
    </section>
  );
}
