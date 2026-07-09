"use client";

import {
  BriefcaseBusiness,
  ListPlus,
  PencilLine,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

type ActivityType =
  | "action_created"
  | "action_updated"
  | "lead_created"
  | "lead_updated";

type ActivityItem = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  pipeline_id: number;
  occurred_at: string | Date;
};

const activityConfig: Record<
  ActivityType,
  { label: string; icon: LucideIcon; color: string; background: string }
> = {
  action_created: {
    label: "Action created",
    icon: ListPlus,
    color: "text-biru",
    background: "bg-biru-t",
  },
  action_updated: {
    label: "Action updated",
    icon: RefreshCw,
    color: "text-kuning",
    background: "bg-kuning-t",
  },
  lead_created: {
    label: "Lead created",
    icon: BriefcaseBusiness,
    color: "text-hijau",
    background: "bg-hijau-t",
  },
  lead_updated: {
    label: "Lead updated",
    icon: PencilLine,
    color: "text-oranye",
    background: "bg-oranye-t",
  },
};

function relativeTime(value: string | Date) {
  const differenceMs = new Date(value).getTime() - Date.now();
  const absoluteMinutes = Math.abs(differenceMs) / 60_000;
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absoluteMinutes < 60) {
    return formatter.format(Math.round(differenceMs / 60_000), "minute");
  }
  const absoluteHours = absoluteMinutes / 60;
  if (absoluteHours < 24) {
    return formatter.format(Math.round(differenceMs / 3_600_000), "hour");
  }
  return formatter.format(Math.round(differenceMs / 86_400_000), "day");
}

export default function HomeActivityOS({
  activity,
  activityWindowDays,
  isLoading,
}: {
  activity: ActivityItem[];
  activityWindowDays: number;
  isLoading: boolean;
}) {
  return (
    <section className="rounded-xl border border-gray-300 bg-card-bg p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
            {activityWindowDays} Hari Terakhir
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Lead and action records actually created or updated in the database.
          </p>
        </div>
        <span className="rounded-full border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
          {isLoading ? "…" : `Latest ${activity.length}`}
        </span>
      </div>

      {activity.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center dark:border-zinc-700">
          <p className="text-sm font-semibold text-gray-600 dark:text-zinc-300">
            {isLoading ? "Loading recent activity…" : "No recent B2B activity"}
          </p>
          {!isLoading && (
            <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">
              No lead or action was created or updated in the last{" "}
              {activityWindowDays} days.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-gray-200 dark:divide-zinc-800">
          {activity.map((entry) => {
            const config = activityConfig[entry.type];
            return (
              <Link
                key={entry.id}
                href={`/leads/${entry.pipeline_id}`}
                className="group flex items-start gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${config.background} ${config.color}`}
                >
                  <config.icon size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-gray-800 group-hover:text-claude dark:text-zinc-200">
                      {entry.title}
                    </p>
                    <span className="shrink-0 text-[11px] text-gray-400 dark:text-zinc-500">
                      {relativeTime(entry.occurred_at)}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-zinc-400">
                    {config.label} · {entry.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
