"use client";

import { ChartTooltipCard, type ChartTooltipRow } from "@/components/elements/ChartHoverOS";
import { CartesianGrid, Label, ReferenceArea, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";

export type QuadrantPoint = {
  key: string;
  label: string;
  x: number;
  y: number;
  z: number;
  rows: ChartTooltipRow[];
  note?: string;
  emphasized?: boolean;
  directLabel?: boolean;
};

type DotProps = { cx?: number; cy?: number; size?: number; payload?: QuadrantPoint };

function Dot({ cx = 0, cy = 0, size = 64, payload }: DotProps) {
  const radius = Math.sqrt(size / Math.PI);
  const color = payload?.emphasized ? "var(--viz-3)" : "var(--viz-1)";
  return (
    <g>
      <circle cx={cx} cy={cy} r={Math.max(radius, 12)} fill="transparent" />
      <circle cx={cx} cy={cy} r={radius} fill={color} fillOpacity={0.75} stroke="var(--card-bg)" strokeWidth={2} />
      {payload?.directLabel && (
        <text x={cx} y={cy - radius - 5} textAnchor="middle" fontSize={11} fill="var(--sb-text-strong)">
          {payload.label.length > 22 ? `${payload.label.slice(0, 21)}…` : payload.label}
        </text>
      )}
    </g>
  );
}

// A two-measure map: a tinted zone marks where to act, so the reader looks for dots rather than decoding axes.
export default function WarehouseQuadrantChartOS({
  points,
  xLabel,
  yLabel,
  formatX,
  formatY,
  xScale = "linear",
  xTicks,
  xDomain,
  yDomain,
  yReversed = false,
  xLine,
  yLine,
  zone,
  bubbleRange = [60, 900],
  height = 300,
}: {
  points: QuadrantPoint[];
  xLabel: string;
  yLabel: string;
  formatX: (value: number) => string;
  formatY: (value: number) => string;
  xScale?: "linear" | "log";
  xTicks?: number[];
  xDomain: [number, number];
  yDomain: [number, number];
  yReversed?: boolean;
  xLine?: { value: number; label: string };
  yLine?: { value: number; label: string };
  zone?: { x1: number; x2: number; y1: number; y2: number; label: string; labelPosition?: "insideBottomRight" | "insideTop" };
  bubbleRange?: [number, number];
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 22, right: 28, bottom: 28, left: 6 }} accessibilityLayer>
          <CartesianGrid stroke="var(--line-soft)" />
          {zone && (
            <ReferenceArea x1={zone.x1} x2={zone.x2} y1={zone.y1} y2={zone.y2} fill="var(--viz-3)" fillOpacity={0.08} ifOverflow="hidden">
              <Label value={zone.label} position={zone.labelPosition ?? "insideBottomRight"} fill="var(--sb-text-strong)" fontSize={11} fontWeight={600} />
            </ReferenceArea>
          )}
          <XAxis type="number" dataKey="x" name={xLabel} scale={xScale} domain={xDomain} ticks={xTicks} allowDataOverflow axisLine={{ stroke: "var(--line)" }} tickLine={false} tick={{ fill: "var(--sb-text)", fontSize: 11 }} tickFormatter={formatX}>
            <Label value={xLabel} position="insideBottom" offset={-18} fill="var(--sb-text)" fontSize={11} />
          </XAxis>
          <YAxis type="number" dataKey="y" name={yLabel} width={48} domain={yDomain} reversed={yReversed} allowDataOverflow axisLine={{ stroke: "var(--line)" }} tickLine={false} tick={{ fill: "var(--sb-text)", fontSize: 11 }} tickFormatter={formatY}>
            <Label value={yLabel} angle={-90} position="insideLeft" offset={8} style={{ textAnchor: "middle" }} fill="var(--sb-text)" fontSize={11} />
          </YAxis>
          <ZAxis type="number" dataKey="z" range={bubbleRange} />
          {xLine && (
            <ReferenceLine x={xLine.value} stroke="var(--line)">
              <Label value={xLine.label} position="top" fill="var(--sb-text)" fontSize={11} />
            </ReferenceLine>
          )}
          {yLine && (
            <ReferenceLine y={yLine.value} stroke="var(--line)">
              <Label value={yLine.label} position="insideTopLeft" fill="var(--sb-text)" fontSize={11} />
            </ReferenceLine>
          )}
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              const point = payload?.[0]?.payload as QuadrantPoint | undefined;
              if (!active || !point) return null;
              return <ChartTooltipCard title={point.label} rows={point.rows} note={point.note} />;
            }}
          />
          <Scatter data={points} shape={<Dot />} isAnimationActive={false} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
