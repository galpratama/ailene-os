"use client";

import type { RevenueCash, RevenueOpenInvoice, RevenuePlan, RevenuePlanMonth } from "@/apis/revenue";
import AppButton from "@/components/buttons/AppButton";
import RevenueCashBarsOS from "@/components/charts/RevenueCashBarsOS";
import RevenueMonthBarsOS from "@/components/charts/RevenueMonthBarsOS";
import AnalyticsDataTableOS, { type AnalyticsColumn } from "@/components/elements/AnalyticsDataTableOS";
import RevenueCardOS from "@/components/elements/RevenueCardOS";
import RevenueErrorOS from "@/components/elements/RevenueErrorOS";
import RevenueKpiOS from "@/components/elements/RevenueKpiOS";
import RevenueTargetFormOS from "@/components/forms/RevenueTargetFormOS";
import type { RevenueTabProps } from "@/components/pages/RevenueEngineOS";
import { useSession } from "@/contexts/SessionContext";
import { useRevenue } from "@/hooks/useRevenue";
import { getRevenueCash, getRevenuePlan } from "@/lib/actions";
import { count, money, percent } from "@/lib/revenue";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Target } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const notSet = <span className="text-gray-400 dark:text-zinc-500">Belum diset</span>;

function monthLabel(month: string, partial: boolean) {
  return `${new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" })}${partial ? " (partial range)" : ""}`;
}

// Actual with its target underneath, so each cell reads "done / planned".
function versus(actual: string, target: string | null) {
  return (
    <span className="flex flex-col items-end">
      <span>{actual}</span>
      <span className="text-xs text-gray-500 dark:text-zinc-400">{target === null ? "no target" : `of ${target}`}</span>
    </span>
  );
}

const planColumns: AnalyticsColumn<RevenuePlanMonth>[] = [
  { key: "month", label: "Month", value: (row) => row.month, render: (row) => monthLabel(row.month, row.partial) },
  { key: "leads", label: "Leads", value: (row) => row.actual.leads, render: (row) => versus(count(row.actual.leads), row.target ? count(row.target.leads) : null), align: "right" },
  { key: "sqls", label: "SQL", value: (row) => row.actual.sqls, render: (row) => versus(count(row.actual.sqls), row.target ? count(row.target.sqls) : null), align: "right" },
  { key: "closings", label: "Closings", value: (row) => row.actual.closings, render: (row) => versus(count(row.actual.closings), row.target ? count(row.target.closings) : null), align: "right" },
  { key: "revenue", label: "Revenue", value: (row) => row.actual.revenue, render: (row) => versus(money(row.actual.revenue), row.target ? money(row.target.revenue) : null), align: "right" },
  { key: "target", label: "Revenue target", value: (row) => row.target?.revenue ?? null, render: (row) => (row.target ? money(row.target.revenue) : notSet), align: "right" },
  { key: "attainment", label: "Attainment", value: (row) => row.attainment?.revenue ?? null, render: (row) => percent(row.attainment?.revenue), align: "right" },
];

const invoiceColumns: AnalyticsColumn<RevenueOpenInvoice>[] = [
  {
    key: "number",
    label: "Invoice",
    value: (row) => row.number,
    render: (row) => (
      <Link href={`/invoices?invoice=${row.id}`} className="font-medium text-gray-900 hover:text-claude hover:underline dark:text-zinc-100">
        {row.number}
        <span className="ml-1 text-xs font-normal text-gray-500 dark:text-zinc-400">T{row.term}</span>
      </Link>
    ),
  },
  { key: "client", label: "Client", value: (row) => row.company_name },
  { key: "outstanding", label: "Outstanding", value: (row) => row.outstanding, render: (row) => money(row.outstanding), align: "right" },
  { key: "amount", label: "Amount", value: (row) => row.amount, render: (row) => money(row.amount), align: "right" },
  { key: "invoiced", label: "Invoiced", value: (row) => row.invoice_date, render: (row) => dayjs(row.invoice_date).format("D MMM YYYY") },
  {
    key: "days",
    label: "Days open",
    value: (row) => row.days_open,
    render: (row) => <span className={row.overdue || row.days_open > 30 ? "font-semibold text-merah" : ""}>{count(row.days_open)}{row.overdue ? " · overdue" : ""}</span>,
    align: "right",
  },
];

export default function RevenueTargetsPanelOS({ period, enabled }: RevenueTabProps) {
  const isAdmin = useSession()?.role === "administrator";
  const queryClient = useQueryClient();
  const plan = useRevenue<RevenuePlan>("plan", period, () => getRevenuePlan(period), enabled);
  const cash = useRevenue<RevenueCash>("cash", period, () => getRevenueCash(period), enabled);
  const [targetMonth, setTargetMonth] = useState<string | null>(null);

  if (plan.isError && !plan.data && cash.isError && !cash.data) return <RevenueErrorOS error={plan.error} onRetry={() => Promise.all([plan.refetch(), cash.refetch()])} />;

  const months = plan.data?.months ?? [];
  const missingTargets = plan.data?.data_gaps.some((gap) => gap.code === "revenue_targets");
  const c = cash.data;
  const editAction = isAdmin ? (
    <AppButton type="button" variant="outline" size="sm" onClick={() => setTargetMonth(period.end_date.slice(0, 7))}>
      <Target size={14} /> Set target
    </AppButton>
  ) : undefined;

  return (
    <>
      <p className="text-base text-gray-800 dark:text-zinc-200">
        Plan against actual, in counts and in rupiah, and how much of it has turned into cash. Enterprise clients usually pay 30 to 60 days after BAST, so a closing isn&apos;t cash yet.
      </p>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <RevenueKpiOS
          label="Closed, not yet invoiced"
          value={money(c?.closed_not_invoiced.amount)}
          lines={c ? [`${count(c.closed_not_invoiced.count)} won deals with an unbilled share`] : []}
          info="Won deal value minus invoices that have an invoice date, as of today. Draft invoices don't count yet."
          isLoading={cash.isLoading}
        />
        <RevenueKpiOS
          label="Invoiced, not yet paid"
          value={money(c?.invoiced_not_paid.amount)}
          lines={c ? [`${count(c.invoiced_not_paid.count)} open invoices`] : []}
          info="Outstanding balance of issued invoices that are not fully paid, as of today."
          isLoading={cash.isLoading}
        />
        <RevenueKpiOS
          label="Open more than 30 days"
          value={money(c?.open_over_30_days.amount)}
          lines={c ? [`${count(c.open_over_30_days.count)} invoices to chase`] : []}
          info="Part of the open balance whose invoice date is more than 30 days ago."
          isLoading={cash.isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RevenueCardOS
          title="Revenue vs target"
          description="Memantau apakah revenue bulanan on track terhadap target."
          source="os"
          isLoading={plan.isLoading}
          error={plan.error}
          onRetry={() => plan.refetch()}
          actions={editAction}
        >
          <RevenueMonthBarsOS data={months.map((month) => ({ month: month.month, partial: month.partial, revenue: month.actual.revenue, closings: month.actual.closings, target: month.target?.revenue ?? null }))} />
          {missingTargets && <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400">Some months in this range have no target yet.</p>}
        </RevenueCardOS>
        <RevenueCardOS
          title="Invoiced vs collected"
          description="Memastikan revenue yang sudah ditagih benar-benar diterima sebagai uang, dan memantau piutang yang belum tertagih."
          source="os"
          isLoading={cash.isLoading}
          error={cash.error}
          onRetry={() => cash.refetch()}
          isEmpty={!!c && c.monthly.every((month) => month.invoiced === 0 && month.collected === 0)}
          emptyMessage="No invoices issued or paid in this period."
        >
          {c && (
            <>
              <RevenueCashBarsOS data={c.monthly} />
              <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400">
                {money(c.invoiced.current)} invoiced and {money(c.cash_collected.current)} collected in this period.
              </p>
            </>
          )}
        </RevenueCardOS>
      </div>

      <RevenueCardOS
        title="Monthly plan vs actual"
        description="Membandingkan realisasi lead, SQL, closing, dan revenue dengan target tiap bulan, untuk melihat di mana target meleset."
        source="os"
        isLoading={plan.isLoading}
        error={plan.error}
        onRetry={() => plan.refetch()}
        actions={editAction}
      >
        <AnalyticsDataTableOS columns={planColumns} rows={months} rowKey={(row) => row.month} />
        {missingTargets && (
          <p className="mt-3 text-xs text-gray-500 dark:text-zinc-400">
            {isAdmin ? "Months without a target show actuals only. Use Set target to add one." : "Months without a target show actuals only; an administrator sets targets."}
          </p>
        )}
        {plan.data?.totals.attainment && (
          <p className="mt-3 text-xs text-gray-500 dark:text-zinc-400">
            Across the {count(plan.data.totals.months_with_target)} months with a target: {money(plan.data.totals.targeted_actual.revenue)} of {money(plan.data.totals.target?.revenue)} revenue ({percent(plan.data.totals.attainment.revenue)}).
          </p>
        )}
      </RevenueCardOS>

      <RevenueCardOS
        title="Open invoices"
        description="Menentukan invoice mana yang perlu ditagih lebih dulu supaya arus kas tetap lancar."
        source="os"
        isLoading={cash.isLoading}
        error={cash.error}
        onRetry={() => cash.refetch()}
        isEmpty={!!c && c.open_invoices.length === 0}
        emptyMessage="No open invoices. Everything issued has been paid."
        actions={
          <AppButton href="/invoices" variant="outline" size="sm">
            All invoices
          </AppButton>
        }
      >
        <AnalyticsDataTableOS columns={invoiceColumns} rows={c?.open_invoices ?? []} rowKey={(row) => String(row.id)} />
      </RevenueCardOS>

      {targetMonth && (
        <RevenueTargetFormOS
          initialMonth={targetMonth}
          onClose={() => setTargetMonth(null)}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ["revenue"] })}
        />
      )}
    </>
  );
}
