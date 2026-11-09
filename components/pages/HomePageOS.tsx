"use client";

import RevenueEngineOS from "@/components/pages/RevenueEngineOS";
import HomeAttentionOS from "@/components/static-sections/HomeAttentionOS";
import { useSession } from "@/contexts/SessionContext";
import { getHomeStat } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { useQuery } from "@tanstack/react-query";

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
  const sessionUser = useSession();

  const stat = useQuery({
    queryKey: ["stat"],
    queryFn: async () => requireApiData(await getHomeStat()),
    enabled: !!sessionToken,
    // Refresh on returning home after task, sales, quotation or ownership changes.
    staleTime: 0,
  });
  const tasks = stat.data?.tasks;
  const leads = stat.data?.leads;
  const quotations = stat.data?.quotations;

  const firstName = sessionUser?.full_name.trim().split(/\s+/)[0] ?? "";

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-line bg-dashboard-bg px-4 py-6 sm:px-8">
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
          {tasks?.my_tasks_today
            ? `You have ${tasks.my_tasks_today} task${
                tasks.my_tasks_today > 1 ? "s" : ""
              } due today.`
            : "You have no tasks due today."}
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8">
        {stat.isError && (
          <div className="rounded-xl border border-merah/40 bg-merah-t px-4 py-3 text-sm text-merah">
            Dashboard data could not be loaded. Please refresh the page.
          </div>
        )}

        <HomeAttentionOS
          attention={{
            totals: {
              approvals: tasks?.approvals.total ?? 0,
              overdue_tasks: tasks?.overdue_tasks.total ?? 0,
              due_today_tasks: tasks?.due_today_tasks.total ?? 0,
              stale_leads: leads?.stale_leads.total ?? 0,
              quotations_pending: quotations?.total ?? 0,
            },
            approvals: tasks?.approvals.list ?? [],
            overdue_tasks: tasks?.overdue_tasks.list ?? [],
            due_today_tasks: tasks?.due_today_tasks.list ?? [],
            stale_leads: leads?.stale_leads.list ?? [],
            quotations_pending: quotations?.list ?? [],
          }}
          staleLeadDays={leads?.stale_lead_days ?? 0}
          isLoading={stat.isLoading}
        />

        <RevenueEngineOS sessionToken={sessionToken} />
      </div>
    </div>
  );
}
