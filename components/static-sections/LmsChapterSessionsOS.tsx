"use client";

import type {
  LmsChapterSessionsEntry,
  LmsGroupEntry,
  LmsSchedule,
} from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import TaskAssigneeAvatarOS from "@/components/elements/TaskAssigneeAvatarOS";
import LmsScheduleFormOS from "@/components/forms/LmsScheduleFormOS";
import LmsContentStatusLabel from "@/components/labels/LmsContentStatusLabel";
import { getLmsCurriculum, listLmsChapterSessions } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  LockKeyhole,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// A null schedule creates a session; with a null chapter the form can also create the chapter.
type SessionSheet = { chapterId: number | null; schedule: LmsSchedule | null };

// Hardcoded until sessions return their trainer's profile.
const PLACEHOLDER_COACH = {
  name: "Galih Pratama",
  avatar: "/biz/photos/trainer-galih.webp",
};

function datePart(value: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", {
    ...options,
    timeZone: "Asia/Jakarta",
  }).format(value);
}

function CoachChip({ className }: { className?: string }) {
  return (
    <div className={`items-center gap-2.5 ${className ?? ""}`}>
      <TaskAssigneeAvatarOS
        name={PLACEHOLDER_COACH.name}
        avatar={PLACEHOLDER_COACH.avatar}
        size="base"
      />
      <div className="min-w-0 leading-tight">
        <p className="truncate text-xs font-medium text-gray-800 dark:text-zinc-200">
          {PLACEHOLDER_COACH.name}
        </p>
        <p className="text-[11px] text-gray-500 dark:text-zinc-400">Coach</p>
      </div>
    </div>
  );
}

function SessionMenu({
  label,
  onUpdate,
}: {
  label: string;
  onUpdate: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div
      className="pointer-events-auto relative shrink-0 self-start"
      ref={containerRef}
    >
      <AppButton
        variant="secondary"
        size="iconSm"
        aria-label={`Open menu for ${label}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <MoreHorizontal size={15} />
      </AppButton>
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-line bg-card-bg p-1 shadow-md"
        >
          <AppButton
            variant="row"
            size="sm"
            role="menuitem"
            className="w-full text-gray-700 dark:text-zinc-200"
            onClick={() => {
              setIsOpen(false);
              onUpdate();
            }}
          >
            <Pencil size={13} /> Update session
          </AppButton>
        </div>
      )}
    </div>
  );
}

function ChapterSchedule({
  schedule,
  groups,
  onUpdate,
}: {
  schedule: LmsSchedule;
  groups: LmsGroupEntry[];
  onUpdate: () => void;
}) {
  const groupName =
    schedule.only_group_id === null
      ? "All groups"
      : (groups.find((group) => group.id === schedule.only_group_id)?.name ??
        "Group unavailable");
  const start = new Date(schedule.session_date);
  const end = new Date(start.getTime() + schedule.duration_minutes * 60_000);
  const time = (value: Date) =>
    datePart(value, { hour: "2-digit", minute: "2-digit" });
  const MethodIcon = schedule.method === "online" ? Video : MapPin;
  const location = schedule.location_name || "Location not set";

  return (
    <li className="flex items-center gap-4 rounded-xl border border-line bg-gray-50 p-4 dark:bg-zinc-800/50">
      <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border border-line bg-card-bg leading-none">
        <span className="text-[10px] font-semibold uppercase text-claude dark:text-lime-bright">
          {datePart(start, { month: "short" })}
        </span>
        <span className="font-heading text-lg leading-5 tabular-nums text-gray-900 dark:text-zinc-100">
          {datePart(start, { day: "numeric" })}
        </span>
        <span className="text-[10px] text-gray-500 dark:text-zinc-400">
          {datePart(start, { weekday: "short" })}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold tabular-nums text-gray-900 dark:text-zinc-100">
          {time(start)} – {time(end)}
          <span className="ml-1.5 font-normal text-gray-500 dark:text-zinc-400">
            WIB · {schedule.duration_minutes} min
          </span>
        </p>
        <p className="mt-0.5 truncate text-sm text-gray-600 dark:text-zinc-300">
          {groupName}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-gray-500 dark:text-zinc-400">
          <span className="flex min-w-0 items-center gap-1.5">
            <MethodIcon size={13} className="shrink-0" />
            {schedule.location_url ? (
              <a
                href={schedule.location_url}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto truncate hover:text-claude hover:underline"
              >
                {location}
              </a>
            ) : (
              <span className="truncate">{location}</span>
            )}
          </span>
          {schedule.is_locked && (
            <span className="flex items-center gap-1">
              <LockKeyhole size={12} /> Locked
            </span>
          )}
          {schedule.status !== "active" && (
            <LmsContentStatusLabel status={schedule.status} />
          )}
        </div>
        <CoachChip className="mt-2.5 flex sm:hidden" />
      </div>

      <CoachChip className="hidden w-40 shrink-0 sm:flex" />
      <SessionMenu label={`${groupName} session`} onUpdate={onUpdate} />
    </li>
  );
}

function ChapterRow({
  projectId,
  chapter,
  levelNumber,
  groups,
  onUpdate,
}: {
  projectId: string;
  chapter: LmsChapterSessionsEntry;
  levelNumber: number;
  groups: LmsGroupEntry[];
  onUpdate: (sheet: SessionSheet) => void;
}) {
  const schedules = [...chapter.sessions].sort(
    (a, b) =>
      new Date(a.session_date).getTime() - new Date(b.session_date).getTime(),
  );

  return (
    // The whole card links to the chapter; content sits above with pointer events off, except its own controls.
    <article className="group relative px-5 py-5 transition-colors hover:bg-gray-50/60 dark:hover:bg-zinc-800/20 sm:px-6">
      <Link
        href={`/lms/${projectId}/chapters/${chapter.id}`}
        aria-label={`Open chapter ${chapter.name}`}
        className="absolute inset-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-claude"
      />
      <div className="pointer-events-none relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Level {levelNumber}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold leading-snug text-gray-900 dark:text-zinc-100">
              {chapter.name}
            </h3>
            {chapter.status !== "active" && (
              <LmsContentStatusLabel status={chapter.status} />
            )}
          </div>
          {chapter.description && (
            <p className="mt-1 max-w-2xl truncate text-sm text-gray-500 dark:text-zinc-400">
              {chapter.description}
            </p>
          )}
        </div>
        <ChevronRight
          size={18}
          aria-hidden
          className="mt-3 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-600 dark:text-zinc-500 dark:group-hover:text-zinc-300"
        />
      </div>

      {schedules.length ? (
        <ul className="pointer-events-none relative mt-3 flex flex-col gap-2.5">
          {schedules.map((schedule) => (
            <ChapterSchedule
              key={schedule.id}
              schedule={schedule}
              groups={groups}
              onUpdate={() => onUpdate({ chapterId: chapter.id, schedule })}
            />
          ))}
        </ul>
      ) : (
        <p className="pointer-events-none relative mt-3 flex items-center gap-2 rounded-xl border border-dashed border-line px-4 py-3 text-xs text-gray-500 dark:text-zinc-400">
          <CalendarDays size={14} className="shrink-0" />
          No sessions scheduled yet.
        </p>
      )}
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
    queryFn: async () =>
      requireApiData(await listLmsChapterSessions(projectId)),
    enabled: !!sessionToken,
  });
  const curriculumQuery = useQuery({
    queryKey: ["lms-curriculum", projectId],
    queryFn: async () => requireApiData(await getLmsCurriculum(projectId)),
    enabled: !!sessionToken,
    refetchOnWindowFocus: false,
  });
  const chapters = query.data ?? [];
  const fallbackLevels = Array.from(
    new Map(
      chapters.map((chapter) => [
        chapter.level_id,
        { id: chapter.level_id, name: chapter.level_name },
      ]),
    ).values(),
  );
  const levels = curriculumQuery.data?.levels.length
    ? curriculumQuery.data.levels
    : fallbackLevels;
  const levelNumber = (levelId: number) =>
    levels.findIndex((level) => level.id === levelId) + 1;

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-card-bg">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-zinc-100">
            Chapter sessions
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">
            Chapters and their schedules across all groups.
          </p>
        </div>
        <AppButton
          size="sm"
          disabled={!levels.length}
          onClick={() => setSheet({ chapterId: null, schedule: null })}
        >
          <Plus size={13} /> Add session
        </AppButton>
      </div>
      {query.isPending ? (
        <p className="px-6 py-12 text-center text-sm text-gray-500 dark:text-zinc-400">
          Loading chapter sessions...
        </p>
      ) : query.isError ? (
        <div className="px-6 py-10 text-center">
          <p className="text-sm text-merah">{query.error.message}</p>
          <AppButton
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => query.refetch()}
          >
            Try again
          </AppButton>
        </div>
      ) : chapters.length ? (
        <div className="divide-y divide-line-soft">
          {chapters.map((chapter) => (
            <ChapterRow
              key={chapter.id}
              projectId={projectId}
              chapter={chapter}
              levelNumber={levelNumber(chapter.level_id)}
              groups={groups}
              onUpdate={setSheet}
            />
          ))}
        </div>
      ) : (
        <div className="px-6 py-12 text-center">
          <BookOpen size={24} className="mx-auto text-gray-400" />
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-zinc-200">
            No chapters yet
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
            Add the first chapter to build the learning journey.
          </p>
        </div>
      )}
      {sheet && (
        <LmsScheduleFormOS
          projectId={projectId}
          chapterId={sheet.chapterId}
          chapters={chapters}
          levels={levels}
          groups={groups}
          schedule={sheet.schedule}
          onClose={() => setSheet(null)}
          onSaved={async () => {
            toast.success("Session saved.");
            await Promise.all([
              client.invalidateQueries({
                queryKey: ["lms-chapter-sessions", projectId],
              }),
              client.invalidateQueries({
                queryKey: ["lms-curriculum", projectId],
              }),
            ]);
          }}
        />
      )}
    </section>
  );
}
