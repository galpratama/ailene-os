"use client";

import type { RevenueTeamTasks } from "@/apis/revenue";
import type { TaskPriority, TaskStatus } from "@/apis/tasks";
import AnalyticsDataTableOS, { type AnalyticsColumn } from "@/components/elements/AnalyticsDataTableOS";
import RevenueCardOS from "@/components/elements/RevenueCardOS";
import RevenueErrorOS from "@/components/elements/RevenueErrorOS";
import RevenueKpiOS from "@/components/elements/RevenueKpiOS";
import PriorityLabel from "@/components/labels/PriorityLabel";
import TaskStatusLabel from "@/components/labels/TaskStatusLabel";
import type { RevenueTabProps } from "@/components/pages/RevenueEngineOS";
import { useRevenue } from "@/hooks/useRevenue";
import { getRevenueTeamTasks } from "@/lib/actions";
import { count, PENDING_LABEL, shortDate } from "@/lib/revenue";

type Person = RevenueTeamTasks["by_person"][number];
type Task = RevenueTeamTasks["list"][number];

const personColumns: AnalyticsColumn<Person>[] = [
  { key: "person", label: "Person", value: (row) => row.assignee?.name ?? "Unassigned" },
  { key: "open", label: "Open", value: (row) => row.open, align: "right" },
  { key: "overdue", label: "Overdue", value: (row) => row.overdue, render: (row) => <span className={row.overdue ? "font-semibold text-merah" : ""}>{row.overdue}</span>, align: "right" },
  { key: "review", label: "In review", value: (row) => row.in_review, align: "right" },
  { key: "blocked", label: "Blocked", value: () => PENDING_LABEL, render: () => <span className="text-gray-400 dark:text-zinc-500">{PENDING_LABEL}</span>, align: "right" },
];

const taskColumns: AnalyticsColumn<Task>[] = [
  { key: "name", label: "Task", value: (row) => row.name },
  { key: "assignee", label: "Owner", value: (row) => row.assignee?.name ?? "Unassigned" },
  { key: "status", label: "Status", value: (row) => row.status, render: (row) => <TaskStatusLabel status={row.status as TaskStatus} /> },
  { key: "priority", label: "Priority", value: (row) => row.priority, render: (row) => <PriorityLabel priority={row.priority as TaskPriority} /> },
  { key: "due", label: "Due", value: (row) => row.end_date, render: (row) => <span className={row.overdue ? "font-semibold text-merah" : ""}>{shortDate(row.end_date)}</span> },
];

export default function RevenueTeamTasksPanelOS({ enabled }: RevenueTabProps) {
  const tasks = useRevenue<RevenueTeamTasks>("team-tasks", 100, () => getRevenueTeamTasks({ page_size: 100 }), enabled);
  const data = tasks.data;

  if (tasks.isError && !data) return <RevenueErrorOS error={tasks.error} onRetry={() => tasks.refetch()} />;

  return (
    <>
      <p className="text-base text-gray-800 dark:text-zinc-200">Current company-wide open work from Ailene OS tasks, independent of the selected dates, and the handoffs between sales and delivery.</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <RevenueKpiOS label="Open tasks" value={count(data?.open)} lines={[`${count(data?.in_review)} in review`]} info="To do, backlog, in progress, and review tasks you can see." isLoading={tasks.isLoading} />
        <RevenueKpiOS label="Overdue" value={count(data?.overdue)} lines={["past the due date, not done"]} info="Open tasks whose due date is before today in Jakarta time." isLoading={tasks.isLoading} />
        <RevenueKpiOS label="Blocked" pending="Tasks have no blocked status yet." />
        <RevenueKpiOS label="Handoffs over SLA" pending="Handoff gates are not defined yet." />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RevenueCardOS title="Open tasks by person" description="Most overdue first." source="Ailene OS tasks" isLoading={tasks.isLoading} isEmpty={!data?.by_person.length} emptyMessage="No open tasks.">
          <AnalyticsDataTableOS columns={personColumns} rows={data?.by_person ?? []} rowKey={(row) => row.assignee?.id ?? "unassigned"} />
        </RevenueCardOS>
        <RevenueCardOS
          title="Handoff gates"
          description="Items waiting at each gate and the oldest one's age, against its SLA."
          pending="Needs handoff gate definitions with an SLA."
          pendingShape="table"
          pendingColumns={["Gate", "Handoff", "Waiting", "Oldest", "SLA", "Status"]}
        />
      </div>

      <RevenueCardOS
        title="All open tasks"
        description={data && data.open > data.list.length ? `Showing the first ${data.list.length} of ${data.open}, overdue first.` : "Overdue first, then by due date."}
        source="Ailene OS tasks"
        isLoading={tasks.isLoading}
        isEmpty={!data?.list.length}
        emptyMessage="No open tasks."
      >
        <AnalyticsDataTableOS columns={taskColumns} rows={data?.list ?? []} rowKey={(row) => String(row.id)} />
      </RevenueCardOS>
    </>
  );
}
