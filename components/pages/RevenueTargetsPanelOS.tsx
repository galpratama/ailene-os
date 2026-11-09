"use client";

import type { RevenueOverview } from "@/apis/revenue";
import RevenueMonthBarsOS from "@/components/charts/RevenueMonthBarsOS";
import AnalyticsDataTableOS, { type AnalyticsColumn } from "@/components/elements/AnalyticsDataTableOS";
import RevenueCardOS from "@/components/elements/RevenueCardOS";
import RevenueErrorOS from "@/components/elements/RevenueErrorOS";
import RevenueKpiOS from "@/components/elements/RevenueKpiOS";
import type { RevenueTabProps } from "@/components/pages/RevenueEngineOS";
import { useRevenue } from "@/hooks/useRevenue";
import { getRevenueOverview } from "@/lib/actions";
import { count, money, PENDING_LABEL } from "@/lib/revenue";

type Month = RevenueOverview["monthly"][number];

const pending = () => <span className="text-gray-400 dark:text-zinc-500">{PENDING_LABEL}</span>;

const planColumns: AnalyticsColumn<Month>[] = [
  {
    key: "month",
    label: "Month",
    value: (row) => row.month,
    render: (row) => `${new Date(`${row.month}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" })}${row.partial ? " (to date)" : ""}`,
  },
  { key: "leads", label: "Leads", value: (row) => row.leads, render: (row) => count(row.leads), align: "right" },
  { key: "sqls", label: "SQL", value: (row) => row.sqls, render: (row) => count(row.sqls), align: "right" },
  { key: "closings", label: "Closings", value: (row) => row.closings, render: (row) => count(row.closings), align: "right" },
  { key: "revenue", label: "Revenue", value: (row) => row.revenue_closed, render: (row) => money(row.revenue_closed), align: "right" },
  { key: "target", label: "Targets", value: () => PENDING_LABEL, render: pending },
  { key: "attainment", label: "Attainment", value: () => PENDING_LABEL, render: pending, align: "right" },
];

export default function RevenueTargetsPanelOS({ period, enabled }: RevenueTabProps) {
  const overview = useRevenue<RevenueOverview>("overview", period, () => getRevenueOverview({ ...period, trend_months: 6 }), enabled);
  const months = overview.data?.monthly ?? [];

  if (overview.isError && !overview.data) return <RevenueErrorOS error={overview.error} onRetry={() => overview.refetch()} />;

  return (
    <>
      <p className="text-base text-gray-800 dark:text-zinc-200">
        Plan against actual, in counts and in rupiah, and how much of it has turned into cash. Enterprise clients usually pay 30 to 60 days after BAST, so a closing isn&apos;t cash yet.
      </p>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <RevenueKpiOS label="Closed, not yet invoiced" pending="Needs invoices linked to won deals." />
        <RevenueKpiOS label="Invoiced, not yet paid" pending="Needs invoice payments." />
        <RevenueKpiOS label="Open more than 30 days" pending="Needs invoice dates and payments." />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RevenueCardOS
          title="Revenue vs target"
          description="Closed revenue per month; the current month is lighter until it ends."
          source="Ailene OS pipelines and quotations"
          partialNote="The dashed monthly target needs revenue targets."
          isLoading={overview.isLoading}
        >
          <RevenueMonthBarsOS data={months.map((month) => ({ month: month.month, partial: month.partial, revenue: month.revenue_closed, closings: month.closings }))} />
        </RevenueCardOS>
        <RevenueCardOS
          title="Invoiced vs collected"
          description="By the month the invoice was raised."
          pending="Needs invoices and payments in Ailene OS."
          pendingShape="columns"
        />
      </div>

      <RevenueCardOS
        title="Monthly plan vs actual"
        description="Actuals for the last six months. Attainment is revenue closed ÷ revenue target."
        source="Ailene OS pipelines and quotations"
        partialNote="Lead, SQL, closing, and revenue targets are not stored yet."
        isLoading={overview.isLoading}
      >
        <AnalyticsDataTableOS columns={planColumns} rows={months} rowKey={(row) => row.month} />
      </RevenueCardOS>

      <RevenueCardOS
        title="Open invoices"
        description="Every invoice not yet paid, oldest first."
        pending="Needs invoices in Ailene OS."
        pendingShape="table"
        pendingColumns={["Invoice", "Client", "Amount", "Invoiced", "Days open"]}
      />
    </>
  );
}
