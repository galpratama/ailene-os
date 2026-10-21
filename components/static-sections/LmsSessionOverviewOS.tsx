"use client";

import type {
  LmsChapter,
  LmsContentKind,
  LmsGroupEntry,
  LmsSchedule,
} from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import LmsContentStatusLabel from "@/components/labels/LmsContentStatusLabel";
import { lmsContentIcons } from "@/components/navigations/LmsCurriculumNavOS";
import { lmsContentKinds } from "@/lib/lms-curriculum";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  LockKeyhole,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  UnlockKeyhole,
  Users,
} from "lucide-react";

export default function LmsSessionOverviewOS({
  chapter,
  groups,
  levelName,
  onContent,
  onEdit,
  onDelete,
  onSchedule,
  onDeleteSchedule,
}: {
  chapter: LmsChapter;
  groups: LmsGroupEntry[];
  levelName: string;
  onContent: (kind: LmsContentKind) => void;
  onEdit: () => void;
  onDelete: () => void;
  onSchedule: (schedule: LmsSchedule | null) => void;
  onDeleteSchedule: (schedule: LmsSchedule) => void;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line-soft px-5 py-5 sm:px-7">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
            {levelName} / Session
          </p>
          <h2 className="text-lg font-semibold">{chapter.name}</h2>
          {chapter.description && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-gray-500 dark:text-zinc-400">
              {chapter.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <LmsContentStatusLabel status={chapter.status} />
          <AppButton
            variant="secondary"
            size="iconSm"
            title="Edit session"
            aria-label="Edit session"
            onClick={onEdit}
          >
            <Pencil size={14} />
          </AppButton>
          <AppButton
            variant="dangerGhost"
            size="iconSm"
            title="Delete session"
            aria-label="Delete session"
            onClick={onDelete}
          >
            <Trash2 size={14} />
          </AppButton>
        </div>
      </div>
      <div className="flex flex-col gap-8 px-5 py-6 sm:px-7">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Learning content</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              {chapter.contents.length} of 5 added
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-line divide-y divide-line-soft">
            {lmsContentKinds.map(({ kind, label, description }) => {
              const content = chapter.contents.find(
                (entry) => entry.kind === kind,
              );
              const Icon = lmsContentIcons[kind];
              return (
                <AppButton
                  key={kind}
                  variant="row"
                  size="row"
                  className="gap-3 px-4 py-4"
                  onClick={() => onContent(kind)}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-gray-50 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400">
                    <Icon size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-zinc-400">
                      {content?.title ?? description}
                    </span>
                  </span>
                  {content ? (
                    <LmsContentStatusLabel status={content.status} />
                  ) : (
                    <span className="flex shrink-0 items-center gap-1 text-xs text-gray-500 dark:text-zinc-400">
                      <Plus size={12} />
                      Add
                    </span>
                  )}
                  <ChevronRight size={14} className="shrink-0 text-gray-400" />
                </AppButton>
              );
            })}
          </div>
        </section>
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">Schedule & access</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                Schedule the same content for all groups or a specific group.
              </p>
            </div>
            <AppButton
              variant="outline"
              size="sm"
              onClick={() => onSchedule(null)}
            >
              <Plus size={13} />
              Add schedule
            </AppButton>
          </div>
          {!chapter.sessions.length && (
            <div className="rounded-xl border border-dashed border-line px-5 py-8 text-center">
              <CalendarDays size={24} className="mx-auto mb-3 text-gray-400" />
              <p className="text-sm font-medium">No schedule yet</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                Add a schedule to make this session available to participants.
              </p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {chapter.sessions.map((schedule) => (
              <div
                key={schedule.id}
                className="rounded-xl border border-line p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <CalendarDays size={15} className="text-gray-400" />
                    {new Date(schedule.session_date).toLocaleString("en-GB", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Jakarta",
                    })}{" "}
                    WIB
                  </p>
                  <div className="flex items-center gap-1">
                    <LmsContentStatusLabel status={schedule.status} />
                    <AppButton
                      variant="secondary"
                      size="iconSm"
                      aria-label="Edit schedule"
                      onClick={() => onSchedule(schedule)}
                    >
                      <Pencil size={13} />
                    </AppButton>
                    <AppButton
                      variant="dangerGhost"
                      size="iconSm"
                      aria-label="Delete schedule"
                      onClick={() => onDeleteSchedule(schedule)}
                    >
                      <Trash2 size={13} />
                    </AppButton>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Users size={13} />
                    {groups.find((group) => group.id === schedule.only_group_id)
                      ?.name ?? "All groups"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock3 size={13} />
                    {schedule.duration_minutes} min
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} />
                    {schedule.location_name} ·{" "}
                    {schedule.method === "online" ? "Online" : "In person"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {schedule.is_locked ? (
                      <LockKeyhole size={13} />
                    ) : (
                      <UnlockKeyhole size={13} />
                    )}
                    {schedule.is_locked ? "Locked" : "Open"}
                  </span>
                </div>
                {schedule.location_url && (
                  <AppButton
                    href={schedule.location_url}
                    variant="textLink"
                    size="textLink"
                    className="mt-3"
                  >
                    Open {schedule.method === "online" ? "meeting" : "location"}
                    <ChevronRight size={12} />
                  </AppButton>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
