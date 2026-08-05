"use client";

import type { SankeyNodeProps } from "recharts";
import { ResponsiveContainer, Sankey, Tooltip } from "recharts";

type SankeyData = {
  nodes: { name: string }[];
  links: { source: number; target: number; value: number }[];
};

// Keyed by label string, since the Sankey payload only carries node names, not the raw B2BStageEnum value.
const STAGE_NODE_COLORS: Record<string, string> = {
  "Lead Identified": "#9ca3af",
  Contacted: "var(--biru)",
  Replied: "var(--biru)",
  "Show Interest": "var(--toska)",
  "Meeting Booked": "var(--ungu)",
  Negotiation: "var(--pink)",
  "Verbal Commit": "var(--kuning)",
  "Closed Won": "var(--hijau)",
  "Closed Lost": "var(--merah)",
  "On Hold": "var(--oranye)",
};
const STAGE_LEGEND_ORDER = Object.keys(STAGE_NODE_COLORS);

function SankeyNodeShape({ x, y, width, height, payload }: SankeyNodeProps) {
  const color = STAGE_NODE_COLORS[payload.name] ?? "var(--claude)";
  // Terminal nodes label on the left so the text doesn't spill past the chart edge.
  const labelOnLeft = payload.sourceLinks.length === 0;

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color} rx={2} />
      <text
        x={labelOnLeft ? x - 8 : x + width + 8}
        y={y + height / 2}
        textAnchor={labelOnLeft ? "end" : "start"}
        dominantBaseline="middle"
        fontSize={12}
        fill="var(--foreground)"
      >
        {payload.name} ({payload.value})
      </text>
    </g>
  );
}

export default function StageFlowSankeyChartOS({
  data,
  windowDays,
  isLoading,
}: {
  data: SankeyData;
  windowDays: number;
  isLoading: boolean;
}) {
  // recharts' Sankey crashes (stack overflow) on cyclic/backward links, so only keep forward edges.
  const links = data.links.filter((link) => link.target > link.source);
  const hasData = links.length > 0;

  return (
    <div className="rounded-xl border border-gray-300 bg-card-bg p-5 dark:border-zinc-700">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400">
        Stage Flow
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
        How leads moved between stages over the last {windowDays} days. Bar
        width shows how many leads made that move.
      </p>

      {!hasData ? (
        <div className="mt-5 rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center dark:border-zinc-700">
          <p className="text-sm font-semibold text-gray-600 dark:text-zinc-300">
            {isLoading
              ? "Loading stage flow…"
              : "No stage changes recorded yet"}
          </p>
          {!isLoading && (
            <p className="mt-1 text-xs text-gray-400 dark:text-zinc-500">
              This fills in as leads move between stages going forward.
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="mt-5 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <Sankey
                data={{ nodes: data.nodes, links }}
                nodePadding={28}
                nodeWidth={12}
                margin={{ top: 8, right: 140, bottom: 8, left: 100 }}
                link={{ stroke: "var(--claude)", strokeOpacity: 0.25 }}
                node={SankeyNodeShape}
              >
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--dashboard-border)",
                    borderRadius: 12,
                    color: "var(--foreground)",
                    fontSize: 12,
                  }}
                  itemStyle={{ fontSize: 12 }}
                  formatter={(value, _name, item) => {
                    const payload = item.payload as {
                      source?: { name: string };
                      target?: { name: string };
                      name?: string;
                    };
                    const label =
                      payload.source && payload.target
                        ? `${payload.source.name} → ${payload.target.name}`
                        : (payload.name ?? "");
                    return [
                      `${value} lead${Number(value) === 1 ? "" : "s"}`,
                      label,
                    ];
                  }}
                />
              </Sankey>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-200 pt-3 dark:border-zinc-800">
            {STAGE_LEGEND_ORDER.map((label) => (
              <div key={label} className="flex items-center gap-1.5">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: STAGE_NODE_COLORS[label] }}
                />
                <span className="text-xs text-gray-500 dark:text-zinc-400">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
