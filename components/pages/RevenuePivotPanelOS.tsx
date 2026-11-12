"use client";

import type { RevenuePivot, RevenuePivotActivityCell, RevenuePivotDealCell } from "@/apis/revenue";
import RevenueCardOS from "@/components/elements/RevenueCardOS";
import RevenueErrorOS from "@/components/elements/RevenueErrorOS";
import RevenuePivotTableOS from "@/components/elements/RevenuePivotTableOS";
import AppSelect from "@/components/fields/AppSelect";
import type { RevenueTabProps } from "@/components/pages/RevenueEngineOS";
import { useRevenue } from "@/hooks/useRevenue";
import { getRevenuePivot } from "@/lib/actions";
import { channelLabel, leadGroupLabels, leadGroups } from "@/lib/revenue";
import { buildPivot, type PivotColumnUnit, type PivotMetric, type PivotRowDimension } from "@/lib/revenue-pivot";
import { useMemo, useState } from "react";

const activityMetrics: PivotMetric<RevenuePivotActivityCell>[] = [
  { key: "leads", label: "Leads", format: "count", numerator: (f) => f.leads },
  { key: "sqls", label: "SQL", format: "count", numerator: (f) => f.sqls },
  { key: "meetings", label: "Meetings booked", format: "count", numerator: (f) => f.meetings },
  { key: "meetings_held", label: "Meetings held", format: "count", numerator: (f) => f.meetings_held },
  { key: "quotations", label: "Quotations sent", format: "count", numerator: (f) => f.quotations },
  { key: "won", label: "Won deals", format: "count", numerator: (f) => f.won },
  { key: "won_value", label: "Won value", format: "money", numerator: (f) => f.won_value },
  { key: "sql_rate", label: "Lead → SQL rate", format: "rate", numerator: (f) => f.sqls, denominator: (f) => f.leads },
  { key: "held_rate", label: "Booked → held rate", format: "rate", numerator: (f) => f.meetings_held, denominator: (f) => f.meetings },
  { key: "meeting_won_rate", label: "Meeting held → won rate", format: "rate", numerator: (f) => f.won, denominator: (f) => f.meetings_held },
];

const dealMetrics: PivotMetric<RevenuePivotDealCell>[] = [
  { key: "value", label: "Deal value", format: "money", numerator: (f) => f.value },
  { key: "weighted_value", label: "Weighted value", format: "money", numerator: (f) => f.weighted_value },
  { key: "deals", label: "Deals", format: "count", numerator: (f) => f.deals },
];

const columnOptions = [
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

function groupRow(group: RevenuePivotActivityCell["lead_group"]) {
  return { key: group, label: leadGroupLabels[group], order: leadGroups.indexOf(group) };
}

function ownerRow(owners: Map<string, string>, id: string | null) {
  return { key: id ?? "none", label: id ? owners.get(id) || "Unknown owner" : "No owner", order: 0 };
}

function PivotControls({
  id,
  metric,
  metrics,
  onMetric,
  rows,
  rowOptions,
  onRows,
  unit,
  onUnit,
}: {
  id: string;
  metric: string;
  metrics: { label: string; value: string }[];
  onMetric: (value: string) => void;
  rows: string;
  rowOptions: { label: string; value: string }[];
  onRows: (value: string) => void;
  unit: PivotColumnUnit;
  onUnit: (value: PivotColumnUnit) => void;
}) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:max-w-200">
      <AppSelect selectId={`${id}-metric`} label="Metric" placeholder="Metric" value={metric} options={metrics} onChange={(value) => onMetric(String(value))} />
      <AppSelect selectId={`${id}-rows`} label="Rows" placeholder="Rows" value={rows} options={rowOptions} onChange={(value) => onRows(String(value))} />
      <AppSelect selectId={`${id}-columns`} label="Columns" placeholder="Columns" value={unit} options={columnOptions} onChange={(value) => onUnit(value as PivotColumnUnit)} />
    </div>
  );
}

export default function RevenuePivotPanelOS({ period, periodLabel, enabled }: RevenueTabProps) {
  const pivot = useRevenue<RevenuePivot>("pivot", period, () => getRevenuePivot(period), enabled);
  const data = pivot.data;

  const [activityMetric, setActivityMetric] = useState("sqls");
  const [activityRows, setActivityRows] = useState("channel");
  const [activityUnit, setActivityUnit] = useState<PivotColumnUnit>("week");
  const [dealMetric, setDealMetric] = useState("value");
  const [dealRows, setDealRows] = useState("stage");
  const [dealUnit, setDealUnit] = useState<PivotColumnUnit>("month");

  const owners = useMemo(() => new Map((data?.owners ?? []).map((owner) => [owner.id, owner.name])), [data?.owners]);

  const activityDimensions = useMemo<PivotRowDimension<RevenuePivotActivityCell>[]>(
    () => [
      { key: "channel", label: "Channel (with group subtotals)", heading: "Channel", row: (f) => ({ key: f.lead_channel ?? "none", label: channelLabel(f.lead_channel), order: 0, parent: groupRow(f.lead_group) }) },
      { key: "group", label: "Source group", heading: "Source group", row: (f) => groupRow(f.lead_group) },
      { key: "owner", label: "Sales owner", heading: "Sales owner", row: (f) => ownerRow(owners, f.sales_owner_id) },
    ],
    [owners],
  );

  const dealDimensions = useMemo<PivotRowDimension<RevenuePivotDealCell>[]>(() => {
    const stages = new Map((data?.stages ?? []).map((stage, i) => [stage.code, { name: stage.name, order: i }]));
    return [
      { key: "stage", label: "Stage", heading: "Stage", row: (f) => ({ key: f.stage_code, label: stages.get(f.stage_code)?.name ?? f.stage_code, order: stages.get(f.stage_code)?.order ?? 999 }) },
      { key: "group", label: "Source group", heading: "Source group", row: (f) => groupRow(f.lead_group) },
      { key: "owner", label: "Sales owner", heading: "Sales owner", row: (f) => ownerRow(owners, f.sales_owner_id) },
    ];
  }, [data?.stages, owners]);

  const activity = useMemo(() => {
    const metric = activityMetrics.find((entry) => entry.key === activityMetric) ?? activityMetrics[0];
    const dimension = activityDimensions.find((entry) => entry.key === activityRows) ?? activityDimensions[0];
    return { metric, dimension, table: buildPivot(data?.activity ?? [], metric, dimension, period, activityUnit) };
  }, [data?.activity, activityMetric, activityDimensions, activityRows, period, activityUnit]);

  const deals = useMemo(() => {
    const metric = dealMetrics.find((entry) => entry.key === dealMetric) ?? dealMetrics[0];
    const dimension = dealDimensions.find((entry) => entry.key === dealRows) ?? dealDimensions[0];
    return { metric, dimension, table: buildPivot(data?.deals ?? [], metric, dimension, period, dealUnit) };
  }, [data?.deals, dealMetric, dealDimensions, dealRows, period, dealUnit]);

  if (pivot.isError && !data) return <RevenueErrorOS error={pivot.error} onRetry={() => pivot.refetch()} />;

  return (
    <>
      <p className="text-base text-gray-800 dark:text-zinc-200">
        Go deeper into {periodLabel}: pick a metric, what goes in the rows, and what goes in the columns. Rates are worked out from the totals, not averaged, and darker cells hold higher values.
      </p>

      <RevenueCardOS
        title="Pivot: funnel activity"
        partialNote={data?.data_gaps.some((gap) => gap.code === "meeting_held_step") ? "No pipeline stage is marked as Meeting held yet, so held meetings show 0." : undefined}
        description="Membedah aktivitas funnel (lead, SQL, meeting booked, meeting held atau masuk Discovery done, quotation, won) per channel, sumber, atau sales owner, per minggu atau bulan. Setiap event dihitung di tanggal terjadinya, jadi bisa dipakai untuk melihat channel atau orang mana yang naik-turun dari minggu ke minggu."
        source="os"
        isLoading={pivot.isLoading}
        error={pivot.error}
        onRetry={() => pivot.refetch()}
      >
        <PivotControls
          id="pivot-activity"
          metric={activity.metric.key}
          metrics={activityMetrics.map((entry) => ({ label: entry.label, value: entry.key }))}
          onMetric={setActivityMetric}
          rows={activity.dimension.key}
          rowOptions={activityDimensions.map((entry) => ({ label: entry.label, value: entry.key }))}
          onRows={setActivityRows}
          unit={activityUnit}
          onUnit={setActivityUnit}
        />
        {activity.table.rows.length ? (
          <RevenuePivotTableOS table={activity.table} format={activity.metric.format} heading={activity.dimension.heading} />
        ) : (
          <p className="py-10 text-center text-sm text-gray-500 dark:text-zinc-400">No {activity.metric.label.toLowerCase()} in this period.</p>
        )}
      </RevenueCardOS>

      <RevenueCardOS
        title="Revenue pivot: deals and pipeline"
        description="Pivot yang sama untuk nilai deal. Setiap deal masuk ke minggu/bulan saat ia masuk ke stage-nya sekarang. Nilainya dari quotation terkini (atau estimasi pipeline), dan nilai tertimbang = nilai × probabilitas menang stage dari katalog."
        source="os"
        isLoading={pivot.isLoading}
        error={pivot.error}
        onRetry={() => pivot.refetch()}
        partialNote="Invoices and cash collected are not recorded in OS yet, so they are not in this pivot."
      >
        <PivotControls
          id="pivot-deals"
          metric={deals.metric.key}
          metrics={dealMetrics.map((entry) => ({ label: entry.label, value: entry.key }))}
          onMetric={setDealMetric}
          rows={deals.dimension.key}
          rowOptions={dealDimensions.map((entry) => ({ label: entry.label, value: entry.key }))}
          onRows={setDealRows}
          unit={dealUnit}
          onUnit={setDealUnit}
        />
        {deals.table.rows.length ? (
          <RevenuePivotTableOS table={deals.table} format={deals.metric.format} heading={deals.dimension.heading} />
        ) : (
          <p className="py-10 text-center text-sm text-gray-500 dark:text-zinc-400">No deals entered a stage in this period.</p>
        )}
      </RevenueCardOS>
    </>
  );
}
