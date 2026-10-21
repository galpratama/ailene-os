"use client";

import type { SankeyNodeProps } from "recharts";
import { ResponsiveContainer, Sankey, Tooltip } from "recharts";
import { usePipelineStages } from "@/hooks/usePipelineStages";
import { stageChartColor } from "@/lib/stage-chart-colors";
import type { PipelineStageDefinition } from "@/apis/sales";

type SankeyData = {
  nodes: { name: string }[];
  links: { source: number; target: number; value: number }[];
};

function nodeColor(name: string, catalog: readonly PipelineStageDefinition[]) {
  return stageChartColor(catalog.find((stage) => stage.name === name)?.code ?? "");
}

function SankeyNodeShape({ x, y, width, height, payload, color }: SankeyNodeProps & { color: string }) {
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
  const catalog = usePipelineStages();
  // recharts' Sankey crashes (stack overflow) on cyclic/backward links, so only keep forward edges.
  const links = data.links.filter((link) => link.target > link.source);
  const hasData = links.length > 0;

  return (
    <div className="rounded-xl border border-line bg-card-bg p-5">
      <p className="text-base font-semibold capitalize text-gray-900 dark:text-zinc-100">
        Stage Flow
      </p>
      <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
        How leads moved between stages over the last {windowDays} days. Bar
        width shows how many leads made that move.
      </p>

      {!hasData ? (
        <div className="mt-5 rounded-xl border border-dashed border-line px-4 py-8 text-center">
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
                node={(props: SankeyNodeProps) => <SankeyNodeShape {...props} color={nodeColor(props.payload.name, catalog.stages)} />}
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

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line-soft pt-3">
            {data.nodes.map(({ name: label }, index) => (
              <div key={`${index}-${label}`} className="flex items-center gap-1.5">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: nodeColor(label, catalog.stages) }}
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
