"use client";

import PriorityLabel from "@/components/labels/PriorityLabel";
import StageLabel from "@/components/labels/StageLabel";
import type {
  B2BActionPriorityEnum,
  B2BStageEnum,
} from "@prisma/client";
import {
  AlertCircle,
  CheckCircle2,
  CircleAlert,
  Clock3,
  SearchX,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type AttentionAction = {
  id: number;
  name: string;
  pipeline_id: number;
  pipeline_name: string;
  due_date: string | Date | null;
  priority: B2BActionPriorityEnum;
};

type StaleLead = {
  id: number;
  company_name: string;
  pipeline_name: string;
  stage: B2BStageEnum;
  last_activity_at: string | Date;
  inactive_days: number;
};

function formatDueDate(value: string | Date | null) {
  if (!value) return "No due date";
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function AttentionGroup({
  title,
  description,
  count,
  icon: Icon,
  iconClass,
  children,
}: {
  title: string;
  description: string;
  count: number;
  icon: LucideIcon;
  iconClass: string;
  children: ReactNode;
}) {
  if (count === 0) return null;

  return (
    <div>
      <div className="mb-2 flex items-start gap-2">
        <Icon size={15} className={`mt-0.5 shrink-0 ${iconClass}`} />
        <div>
          <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
            {title} · {count}
          </p>
          <p className="text-xs text-gray-400 dark:text-zinc-500">
            {description}
          </p>
        </div>
      </div>
      <div className="ml-5 flex flex-col gap-2">
        {children}
        {count > 5 && (
          <p className="text-xs text-gray-400 dark:text-zinc-500">
            Showing the 5 highest-priority items.
          </p>
        )}
      </div>
    </div>
  );
}

function ActionRow({ action }: { action: AttentionAction }) {
  return (
    <Link
      href={`/leads/${action.pipeline_id}`}
      className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2 hover:border-claude/40 dark:border-zinc-800"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-700 dark:text-zinc-300">
          {action.name}
        </p>
        <p className="truncate text-xs text-gray-400 dark:text-zinc-500">
          {action.pipeline_name} · {formatDueDate(action.due_date)}
        </p>
      </div>
      <PriorityLabel priority={action.priority} />
    </Link>
  );
}

export default function HomeAttentionOS({
  attention,
  staleLeadDays,
  isLoading,
}: {
  attention: {
    totals: {
      approvals: number;
      overdue_tasks: number;
      due_today_tasks: number;
      stale_leads: number;
    };
    approvals: AttentionAction[];
    overdue_tasks: AttentionAction[];
    due_today_tasks: AttentionAction[];
    stale_leads: StaleLead[];
  };
  staleLeadDays: number;
  isLoading: boolean;
}) {
  const totalAttention =
    attention.totals.approvals +
    attention.totals.overdue_tasks +
    attention.totals.due_today_tasks +
    attention.totals.stale_leads;

  return (
    <section className="rounded-xl border border-gray-300 bg-card-bg p-5">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
          Needs Your Attention
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          Only items assigned to you or leads you own.
        </p>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-sm text-gray-400">
          Loading priorities…
        </p>
      ) : totalAttention === 0 ? (
        <div className="rounded-xl border border-hijau/40 bg-hijau-t px-4 py-5 text-center">
          <CheckCircle2 size={22} className="mx-auto text-hijau" />
          <p className="mt-2 text-sm font-semibold text-gray-700">
            All clear
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            No approvals, overdue tasks, due-today tasks, or stale leads.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <AttentionGroup
            title="Overdue tasks"
            description="Assigned to you, past due, and not completed."
            count={attention.totals.overdue_tasks}
            icon={CircleAlert}
            iconClass="text-merah"
          >
            {attention.overdue_tasks.map((action) => (
              <ActionRow key={action.id} action={action} />
            ))}
          </AttentionGroup>

          <AttentionGroup
            title="Approval requests"
            description="Actions assigned to you with Review status."
            count={attention.totals.approvals}
            icon={AlertCircle}
            iconClass="text-kuning"
          >
            {attention.approvals.map((action) => (
              <ActionRow key={action.id} action={action} />
            ))}
          </AttentionGroup>

          <AttentionGroup
            title="Due today"
            description="Assigned to you and expected to finish today."
            count={attention.totals.due_today_tasks}
            icon={Clock3}
            iconClass="text-biru"
          >
            {attention.due_today_tasks.map((action) => (
              <ActionRow key={action.id} action={action} />
            ))}
          </AttentionGroup>

          <AttentionGroup
            title="Stale leads"
            description={`Open leads you own with no update for at least ${staleLeadDays} days.`}
            count={attention.totals.stale_leads}
            icon={SearchX}
            iconClass="text-oranye"
          >
            {attention.stale_leads.map((lead) => (
              <Link
                key={lead.id}
                href={`/leads/${lead.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2 hover:border-claude/40 dark:border-zinc-800"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-700 dark:text-zinc-300">
                    {lead.company_name}
                  </p>
                  <p className="truncate text-xs text-gray-400 dark:text-zinc-500">
                    {lead.pipeline_name} · inactive {lead.inactive_days} days
                  </p>
                </div>
                <StageLabel stage={lead.stage} />
              </Link>
            ))}
          </AttentionGroup>
        </div>
      )}
    </section>
  );
}
