"use client";

import LostReasonChartOS from "@/components/charts/LostReasonChartOS";
import PipelineFunnelChartOS from "@/components/charts/PipelineFunnelChartOS";
import StageDistributionChartOS from "@/components/charts/StageDistributionChartOS";
import StageFlowSankeyChartOS from "@/components/charts/StageFlowSankeyChartOS";
import WeeklyConversionChartOS from "@/components/charts/WeeklyConversionChartOS";
import HomeAttentionOS from "@/components/static-sections/HomeAttentionOS";
import { setSessionToken, trpc } from "@/trpc/client";
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

  const {
    data,
    isError,
    isLoading: isSummaryLoading,
  } = trpc.list.b2b.homeSummary.useQuery(undefined, {
    enabled: !!sessionToken,
  });

  const { data: analytics, isLoading: isAnalyticsLoading } =
    trpc.list.b2b.dashboardAnalytics.useQuery(undefined, {
      enabled: !!sessionToken,
    });

  const firstName = data?.user.full_name.trim().split(/\s+/)[0] ?? "";

  return (
    <div className="flex min-h-full flex-col">
      <div className="border-b border-gray-300 bg-dashboard-bg px-4 py-6 dark:border-zinc-700 sm:px-8">
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

        <HomeAttentionOS
          attention={
            data?.attention ?? {
              totals: {
                approvals: 0,
                overdue_tasks: 0,
                due_today_tasks: 0,
                stale_leads: 0,
                ownership_conflicts: 0,
              },
              approvals: [],
              overdue_tasks: [],
              due_today_tasks: [],
              stale_leads: [],
              ownership_conflicts: [],
            }
          }
          staleLeadDays={data?.meta.stale_lead_days ?? 0}
          isLoading={isSummaryLoading}
        />

        {/* This week's trend + leads by stage */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <WeeklyConversionChartOS
              data={analytics?.weekly_conversion ?? []}
              weekStart={analytics?.meta.week_start ?? new Date()}
              weekEnd={analytics?.meta.week_end ?? new Date()}
              trailingStart={analytics?.meta.trailing_start ?? new Date()}
              trailingEnd={analytics?.meta.trailing_end ?? new Date()}
              isLoading={isAnalyticsLoading}
            />
          </div>
          <StageDistributionChartOS
            data={analytics?.stage_distribution ?? []}
            isLoading={isAnalyticsLoading}
          />
        </div>

        {/* Funnel + lost reason */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <PipelineFunnelChartOS
            data={analytics?.funnel ?? []}
            isLoading={isAnalyticsLoading}
          />
          <LostReasonChartOS
            data={analytics?.reason_distribution ?? []}
            isLoading={isAnalyticsLoading}
          />
        </div>
        <StageFlowSankeyChartOS
          data={analytics?.sankey ?? { nodes: [], links: [] }}
          windowDays={analytics?.meta.sankey_window_days ?? 90}
          isLoading={isAnalyticsLoading}
        />
      </div>
    </div>
  );
}
