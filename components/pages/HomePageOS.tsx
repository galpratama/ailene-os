"use client";

import PriorityLabel from "@/components/labels/PriorityLabel";
import { setSessionToken, trpc } from "@/trpc/client";
import { AlertCircle, CheckSquare, Clock, Zap } from "lucide-react";
import { useEffect } from "react";

function formatDueDate(dueDate: string | Date | null) {
  if (!dueDate) return null;
  return new Date(dueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function HomePageOS({ sessionToken }: { sessionToken: string }) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const { data, isLoading } = trpc.list.b2b.homeSummary.useQuery(undefined, {
    enabled: !!sessionToken,
  });

  const stats = [
    {
      label: "Pending Approvals",
      value: data?.stats.pending_approvals ?? 0,
      icon: AlertCircle,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-500/10",
    },
    {
      label: "My Tasks Today",
      value: data?.stats.my_tasks_today ?? 0,
      icon: CheckSquare,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      label: "Team Overdue",
      value: data?.stats.team_overdue ?? 0,
      icon: Clock,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-500/10",
    },
    {
      label: "Active Tasks",
      value: data?.stats.active_tasks ?? 0,
      icon: Zap,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-500/10",
    },
  ];

  const approvalsWaiting = data?.approvals_waiting ?? [];
  const myTasks = data?.my_tasks ?? [];

  return (
    <div className="flex flex-col min-h-full">
      {/* Greeting */}
      <div className="bg-dashboard-bg border-b border-dashboard-border px-4 py-6 sm:px-8">
        <p className="text-xs text-neutral-400 dark:text-zinc-500 uppercase tracking-wider font-medium mb-1">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">Good morning, Akmal 👋</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
          {data?.stats.my_tasks_today
            ? `You have ${data.stats.my_tasks_today} task${data.stats.my_tasks_today > 1 ? "s" : ""} due today.`
            : "You have no tasks due today."}
        </p>
      </div>

      <div className="flex-1 px-4 py-6 flex flex-col gap-6 sm:px-8">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-card-bg rounded-xl border border-dashboard-border p-5 flex flex-col gap-3"
            >
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon size={16} className={s.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
                  {isLoading ? "—" : s.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* AI activity */}
          <div className="bg-card-bg rounded-xl border border-dashboard-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider">
                24 Jam Terakhir
              </span>
              <span className="px-1.5 py-0.5 rounded text-xs bg-neutral-100 text-neutral-500 dark:bg-zinc-800 dark:text-zinc-400">
                AI Summary
              </span>
            </div>
            <ul className="flex flex-col gap-2">
              <li className="flex gap-2 text-sm text-gray-600 dark:text-zinc-300">
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-600 mt-2 shrink-0" />
                No AI activity recorded in the last 24 hours.
              </li>
            </ul>
          </div>

          {/* Needs attention */}
          <div className="bg-card-bg rounded-xl border border-dashboard-border p-5">
            <p className="text-xs font-semibold text-neutral-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
              Needs Your Attention
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-zinc-300 mb-2">
                  Approvals waiting on you
                </p>
                {approvalsWaiting.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-zinc-500 italic">
                    {isLoading ? "Loading…" : "No pending approvals."}
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {approvalsWaiting.map((action) => (
                      <div
                        key={action.id}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="text-gray-700 dark:text-zinc-300 truncate">
                          {action.name}
                          <span className="text-gray-400 dark:text-zinc-500"> · {action.pipeline_name}</span>
                        </span>
                        {action.due_date && (
                          <span className="text-xs text-gray-400 dark:text-zinc-500 shrink-0">
                            {formatDueDate(action.due_date)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-zinc-300 mb-2">Your tasks</p>
                {myTasks.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-zinc-500 italic">
                    {isLoading ? "Loading…" : "No overdue or due-today tasks."}
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {myTasks.map((action) => (
                      <div
                        key={action.id}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="text-gray-700 dark:text-zinc-300 truncate">
                          {action.name}
                          <span className="text-gray-400 dark:text-zinc-500"> · {action.pipeline_name}</span>
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <PriorityLabel priority={action.priority} />
                          {action.due_date && (
                            <span className="text-xs text-gray-400 dark:text-zinc-500">
                              {formatDueDate(action.due_date)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
