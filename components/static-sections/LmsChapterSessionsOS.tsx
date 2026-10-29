"use client";

import type {
  LmsChapterSessionsEntry,
  LmsGroupEntry,
  LmsChapterSession,
  LmsSchedule,
} from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import TaskAssigneeAvatarOS from "@/components/elements/TaskAssigneeAvatarOS";
import LmsScheduleFormOS from "@/components/forms/LmsScheduleFormOS";
import Label from "@/components/labels/Label";
import LmsContentStatusLabel from "@/components/labels/LmsContentStatusLabel";
import LmsSessionMethodLabel from "@/components/labels/LmsSessionMethodLabel";
import { listLmsChapterSessions, listLmsLevels } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  CalendarDays,
  Clock3,
  FileText,
  LockKeyhole,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Star,
  Users,
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

type SessionTiming = "completed" | "live" | "upcoming";

function sessionTiming(start: Date, end: Date, now: number): SessionTiming {
  if (end.getTime() <= now) return "completed";
  return start.getTime() <= now ? "live" : "upcoming";
}

function datePart(value: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", {
    ...options,
    timeZone: "Asia/Jakarta",
  }).format(value);
}

function CoachChip() {
  return (
    <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-xs">
      <TaskAssigneeAvatarOS
        name={PLACEHOLDER_COACH.name}
        avatar={PLACEHOLDER_COACH.avatar}
        size="sm"
      />
      <span className="truncate font-medium text-gray-800 dark:text-zinc-200">
        {PLACEHOLDER_COACH.name}
      </span>
      <span className="shrink-0 text-gray-500 dark:text-zinc-400">· Coach</span>
    </p>
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

function SessionDateTile({ start, timing }: { start: Date; timing: SessionTiming }) {
  return (
    <div className="flex w-16 shrink-0 flex-col overflow-hidden rounded-lg border border-line bg-card-bg">
      <div
        className={`flex flex-col items-center leading-none ${
          timing === "upcoming" ? "py-2" : "pb-1.5 pt-1.5"
        }`}
      >
        <span className="text-[11px] font-semibold uppercase text-claude dark:text-lime-bright">
          {datePart(start, { month: "short" })}
        </span>
        <span className="font-heading text-xl leading-6 tabular-nums text-gray-900 dark:text-zinc-100">
          {datePart(start, { day: "numeric" })}
        </span>
        <span className="text-[11px] text-gray-500 dark:text-zinc-400">
          {datePart(start, { weekday: "short" })}
        </span>
      </div>
      {timing === "completed" && (
        <span className="bg-lime-bright py-0.5 text-center text-[11px] font-semibold uppercase tracking-wide text-forest-deep">
          Done
        </span>
      )}
      {timing === "live" && (
        <span className="flex items-center justify-center gap-1 bg-kuning py-0.5 text-[11px] font-semibold uppercase tracking-wide text-gray-900">
          <span className="size-1.5 animate-pulse rounded-full bg-current" />
          Live
        </span>
      )}
    </div>
  );
}

function SessionRating({ schedule }: { schedule: LmsChapterSession }) {
  // The deployed API may predate feedback fields, so treat a missing value like null.
  const rating = schedule.feedback_average ?? null;
  if (rating === null) return null;

  return (
    <p
      title={`Average of ${schedule.feedback_count} ${schedule.feedback_count === 1 ? "survey" : "surveys"}`}
      className="flex shrink-0 items-center gap-1 self-start rounded-full border border-line bg-card-bg px-2 py-0.5 text-xs text-gray-500 dark:text-zinc-400"
    >
      Rating:
      <Star size={13} className="fill-oranye text-oranye" />
      <span className="font-semibold tabular-nums text-gray-900 dark:text-zinc-100">
        {rating.toFixed(1)}
      </span>
    </p>
  );
}

function ChapterSchedule({
  schedule,
  groups,
  now,
  onUpdate,
}: {
  schedule: LmsChapterSession;
  groups: LmsGroupEntry[];
  now: number;
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

  return (
    <li className="flex items-start gap-3.5 rounded-xl border border-line bg-gray-50 p-3 dark:bg-zinc-800/50">
      <SessionDateTile start={start} timing={sessionTiming(start, end, now)} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[15px] font-semibold tabular-nums text-gray-900 dark:text-zinc-100">
            {time(start)} – {time(end)}
            <span className="ml-1.5 text-sm font-normal text-gray-500 dark:text-zinc-400">
              WIB
            </span>
          </p>
          <Label variant="gray" className="tabular-nums">
            <Clock3 size={12} /> {schedule.duration_minutes} min
          </Label>
          {schedule.is_locked && (
            <span
              role="img"
              aria-label="Locked"
              title="Locked for participants"
              className="flex size-5 items-center justify-center rounded-full bg-merah text-white"
            >
              <LockKeyhole size={11} strokeWidth={2.5} />
            </span>
          )}
          {schedule.status !== "active" && (
            <LmsContentStatusLabel status={schedule.status} />
          )}
        </div>
        <CoachChip />
        <div className="my-2.5 border-t border-dashed border-line" />
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <LmsSessionMethodLabel method={schedule.method} />
          <span className="flex min-w-0 max-w-48 items-center gap-1.5 text-xs text-gray-600 dark:text-zinc-300">
            <Users size={13} className="shrink-0" />
            <span className="truncate">{groupName}</span>
          </span>
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-gray-600 dark:text-zinc-300">
            <MethodIcon size={13} className="shrink-0" />
            {schedule.location_url ? (
              <a
                href={schedule.location_url}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto truncate hover:text-claude hover:underline"
              >
                {schedule.location_name || schedule.location_url}
              </a>
            ) : (
              <span className="truncate">{schedule.location_name || "Location not set"}</span>
            )}
          </span>
        </div>
      </div>

      <SessionRating schedule={schedule} />
      <SessionMenu label={`${groupName} session`} onUpdate={onUpdate} />
    </li>
  );
}

function ChapterRow({
  projectId,
  chapter,
  levelNumber,
  groups,
  now,
  onUpdate,
}: {
  projectId: string;
  chapter: LmsChapterSessionsEntry;
  levelNumber: number | null;
  groups: LmsGroupEntry[];
  now: number;
  onUpdate: (sheet: SessionSheet) => void;
}) {
  const schedules = [...chapter.sessions].sort(
    (a, b) =>
      new Date(a.session_date).getTime() - new Date(b.session_date).getTime(),
  );

  return (
    // The whole card links to the chapter; content sits above with pointer events off, except its own controls.
    <article className="relative px-5 py-5 transition-colors hover:bg-gray-50/60 dark:hover:bg-zinc-800/20 sm:px-6">
      <Link
        href={`/lms/${projectId}/chapters/${chapter.id}`}
        aria-label={`Open chapter ${chapter.name}`}
        className="absolute inset-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-claude"
      />
      <div className="pointer-events-none relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            {levelNumber === null ? chapter.level_name : `Level ${levelNumber}`}
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
        <AppButton
          variant="black"
          size="sm"
          className="pointer-events-auto shrink-0"
          href={`/lms/${projectId}/chapters/${chapter.id}`}
        >
          <FileText size={13} /> Manage content
        </AppButton>
      </div>

      {schedules.length ? (
        <ul className="pointer-events-none relative mt-4 flex flex-col gap-3">
          {schedules.map((schedule) => (
            <ChapterSchedule
              key={schedule.id}
              schedule={schedule}
              groups={groups}
              now={now}
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
  const levelsQuery = useQuery({
    queryKey: ["lms-levels"],
    queryFn: async () => requireApiData(await listLmsLevels()),
    enabled: !!sessionToken,
    staleTime: Infinity,
  });
  const chapters = query.data ?? [];
  const levelList = levelsQuery.data ?? [];
  // Until /levels answers, chapters already in the project still offer their levels.
  const levels = levelList.length
    ? levelList.map((level) => ({
        id: level.id,
        name: `Level ${level.level_number} · ${level.name}`,
      }))
    : Array.from(
        new Map(
          chapters.map((chapter) => [
            chapter.level_id,
            { id: chapter.level_id, name: chapter.level_name },
          ]),
        ).values(),
      );
  const levelNumber = (levelId: number) =>
    levelList.find((level) => level.id === levelId)?.level_number ?? null;

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
              now={query.dataUpdatedAt}
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
            ]);
          }}
        />
      )}
    </section>
  );
}
