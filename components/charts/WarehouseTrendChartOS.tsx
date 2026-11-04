"use client";

import { ChartTooltipCard } from "@/components/elements/ChartHoverOS";
import { dateLabel, dateLongLabel } from "@/lib/analytics-warehouse";
import { Area, Bar, CartesianGrid, ComposedChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { date: string; value: number | null };

// One measure per plot: charts that share a syncId line up on the same day, which replaces a misleading dual axis.
export default function WarehouseTrendChartOS({
  points,
  label,
  headline,
  format,
  formatTick,
  kind = "bar",
  color = "var(--viz-1)",
  syncId,
  height = 112,
  showDates = true,
  notLoadedAfter,
  reversed = false,
  allowDecimals = false,
}: {
  points: Point[];
  label: string;
  headline?: string;
  format: (value: number) => string;
  formatTick?: (value: number) => string;
  kind?: "bar" | "area";
  color?: string;
  syncId?: string;
  height?: number;
  showDates?: boolean;
  notLoadedAfter?: string | null;
  reversed?: boolean;
  allowDecimals?: boolean;
}) {
  const firstMissing = notLoadedAfter ? points.find((point) => point.date > notLoadedAfter)?.date : undefined;
  const lastDate = points.at(-1)?.date;

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <p className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-zinc-300">
          <span aria-hidden="true" className="size-2 rounded-xs" style={{ backgroundColor: color }} />
          {label}
        </p>
        {headline && <p className="text-xs font-semibold text-gray-900 dark:text-zinc-100">{headline}</p>}
      </div>
      <div style={{ height: height + (showDates ? 20 : 0) }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={points} syncId={syncId} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} accessibilityLayer>
            <CartesianGrid vertical={false} stroke="var(--line-soft)" />
            <XAxis dataKey="date" hide={!showDates} height={20} axisLine={false} tickLine={false} minTickGap={28} tick={{ fill: "var(--sb-text)", fontSize: 11 }} tickFormatter={dateLabel} />
            <YAxis width={56} axisLine={false} tickLine={false} tickCount={3} reversed={reversed} allowDecimals={allowDecimals} domain={reversed ? ["dataMin - 1", "dataMax + 1"] : [0, "auto"]} tick={{ fill: "var(--sb-text)", fontSize: 11 }} tickFormatter={formatTick ?? format} />
            {firstMissing && lastDate && <ReferenceArea x1={firstMissing} x2={lastDate} fill="var(--viz-other)" fillOpacity={0.12} ifOverflow="extendDomain" />}
            <Tooltip
              cursor={kind === "bar" ? { fill: "var(--viz-other)", fillOpacity: 0.12 } : { stroke: "var(--viz-other)", strokeWidth: 1 }}
              content={({ active, label: date, payload }) => {
                if (!active || !payload?.length) return null;
                const value = payload[0].value;
                const isMissing = firstMissing && String(date) >= firstMissing;
                return (
                  <ChartTooltipCard
                    title={dateLongLabel(String(date))}
                    rows={[{ label, value: isMissing ? "Not loaded yet" : value === null || value === undefined ? "—" : format(Number(value)), color }]}
                  />
                );
              }}
            />
            {kind === "bar" ? (
              <Bar dataKey="value" fill={color} maxBarSize={24} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            ) : (
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={color} fillOpacity={0.1} connectNulls isAnimationActive={false} activeDot={{ r: 4, stroke: "var(--card-bg)", strokeWidth: 2, fill: color }} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
