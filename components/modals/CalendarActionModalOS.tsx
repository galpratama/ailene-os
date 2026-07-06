"use client";

import AppButton from "@/components/buttons/AppButton";
import PriorityLabel from "@/components/labels/PriorityLabel";
import type { B2BActionPriorityEnum, B2BActionStatusEnum } from "@prisma/client";
import { Building2, CalendarDays, UserRound, Workflow, X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

export type CalendarActionModalEvent = {
  id: number;
  title: string;
  name: string;
  summary: string | null;
  status: B2BActionStatusEnum;
  priority: B2BActionPriorityEnum;
  due_date: string | Date | null;
  pipeline_id: number;
  pipeline_name: string;
  company_id: number;
  company_name: string;
  assignee_id: string | null;
  assignee_name: string | null;
  assignee_avatar: string | null;
};

const statusLabels: Record<B2BActionStatusEnum, string> = {
  TO_DO: "To Do",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  DONE: "Done",
};

const priorityLabels: Record<B2BActionPriorityEnum, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

function formatDate(value: string | Date | null) {
  if (!value) return "No due date";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function initialsOf(name: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export default function CalendarActionModalOS({
  event,
  onClose,
}: {
  event: CalendarActionModalEvent | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!event) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [event]);

  if (!event) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-300 bg-card-bg shadow-xl dark:border-zinc-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5 dark:border-zinc-800">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-claude">
              B2B Action
            </p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
              {event.title}
            </h2>
          </div>
          <AppButton
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </AppButton>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-dashboard-border bg-dashboard-bg p-3">
              <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-zinc-500">
                <CalendarDays size={13} />
                Due date
              </span>
              <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                {formatDate(event.due_date)}
              </p>
            </div>
            <div className="rounded-xl border border-dashboard-border bg-dashboard-bg p-3">
              <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-zinc-500">
                <Workflow size={13} />
                Status
              </span>
              <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                {statusLabels[event.status]}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-claude/10 text-claude">
                <Building2 size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                  {event.company_name}
                </p>
                <p className="text-sm text-gray-500 dark:text-zinc-400">
                  {event.pipeline_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-xs font-bold text-gray-500 dark:bg-zinc-800 dark:text-zinc-300">
                {event.assignee_avatar ? (
                  <Image
                    src={event.assignee_avatar}
                    alt={event.assignee_name ?? ""}
                    width={32}
                    height={32}
                    className="size-full object-cover"
                  />
                ) : (
                  initialsOf(event.assignee_name)
                )}
              </div>
              <div className="min-w-0">
                <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-zinc-500">
                  <UserRound size={12} />
                  Assignee
                </span>
                <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
                  {event.assignee_name ?? "Unassigned"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PriorityLabel priority={event.priority} />
            <span className="text-sm font-medium text-gray-600 dark:text-zinc-300">
              {priorityLabels[event.priority]} priority
            </span>
          </div>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500">
              Summary
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600 dark:text-zinc-300">
              {event.summary ?? "No summary provided."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
