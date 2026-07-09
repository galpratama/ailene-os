"use client";

import HomeActivityOS from "@/components/static-sections/HomeActivityOS";
import HomeAttentionOS from "@/components/static-sections/HomeAttentionOS";
import { setSessionToken, trpc } from "@/trpc/client";
import { AlertCircle, CheckSquare, Clock, Zap } from "lucide-react";
import { useEffect } from "react";

function getJakartaHour() {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(new Date())
    .find((part) => part.type === "hour")?.value;
  return Number(hour ?? 0);
}

function greeting() {
  const hour = getJakartaHour();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomePageOS({ sessionToken }: { sessionToken: string }) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const { data, isLoading, isError } =
    trpc.list.b2b.homeSummary.useQuery(undefined, {
      enabled: !!sessionToken,
    });

  const stats = [
    {
      label: "My Pending Approvals",
      value: data?.stats.pending_approvals ?? 0,
      icon: AlertCircle,
      color: "text-kuning",
      bg: "bg-kuning-t",
    },
    {
      label: "My Tasks Today",
      value: data?.stats.my_tasks_today ?? 0,
      icon: CheckSquare,
      color: "text-biru",
      bg: "bg-biru-t",
    },
    {
      label: "Team Overdue",
      value: data?.stats.team_overdue ?? 0,
      icon: Clock,
      color: "text-merah",
      bg: "bg-merah-t",
    },
    {
      label: "Active Tasks",
      value: data?.stats.active_tasks ?? 0,
      icon: Zap,
      color: "text-hijau",
      bg: "bg-hijau-t",
    },
  ];

  const firstName = data?.user.full_name.trim().split(/\s+/)[0] ?? "";
  const attention = data?.attention ?? {
    totals: {
      approvals: 0,
      overdue_tasks: 0,
      due_today_tasks: 0,
      stale_leads: 0,
    },
    approvals: [],
    overdue_tasks: [],
    due_today_tasks: [],
    stale_leads: [],
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-gray-300 bg-dashboard-bg px-4 py-6 sm:px-8">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-zinc-500">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Jakarta",
          })}
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
          {greeting()}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          {data?.stats.my_tasks_today
            ? `You have ${data.stats.my_tasks_today} task${
                data.stats.my_tasks_today > 1 ? "s" : ""
              } due today.`
            : "You have no tasks due today."}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8">
        {isError && (
          <div className="rounded-xl border border-merah/40 bg-merah-t px-4 py-3 text-sm text-merah">
            Dashboard data could not be loaded. Please refresh the page.
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col gap-3 rounded-xl border border-gray-300 bg-card-bg p-5"
            >
              <div
                className={`flex size-8 items-center justify-center rounded-lg ${stat.bg}`}
              >
                <stat.icon size={16} className={stat.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
                  {isLoading ? "—" : stat.value}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <HomeActivityOS
            activity={data?.activity ?? []}
            activityWindowDays={data?.meta.activity_window_days ?? 7}
            isLoading={isLoading}
          />
          <HomeAttentionOS
            attention={attention}
            staleLeadDays={data?.meta.stale_lead_days ?? 14}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
