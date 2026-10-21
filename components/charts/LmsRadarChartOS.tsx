"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export type LmsRadarDatum = { label: string; value: number | null };

export default function LmsRadarChartOS({
  data,
  max,
  color = "var(--claude)",
  valueLabel,
  height = 260,
}: {
  data: LmsRadarDatum[];
  max: number;
  color?: string;
  valueLabel: string;
  height?: number;
}) {
  const points = data.map((d) => ({ ...d, value: d.value ?? 0 }));
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={points} outerRadius="72%" accessibilityLayer>
          <PolarGrid stroke="var(--dashboard-border)" />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fill: "var(--sb-text)", fontSize: 11 }}
          />
          <PolarRadiusAxis domain={[0, max]} tick={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card-bg)",
              borderColor: "var(--dashboard-border)",
              borderRadius: 12,
              color: "var(--foreground)",
              fontSize: 12,
            }}
            formatter={(value) => [Number(value).toFixed(1), valueLabel]}
          />
          <Radar
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={color}
            fillOpacity={0.22}
            animationDuration={600}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
