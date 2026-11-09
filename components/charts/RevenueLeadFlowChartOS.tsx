"use client";

import type { LeadGroup, RevenueLeadFlow } from "@/apis/revenue";
import { ChartTooltipCard } from "@/components/elements/ChartHoverOS";
import { count, leadGroupColors, leadGroupShortLabels } from "@/lib/revenue";
import type { SankeyNodeProps } from "recharts";
import { ResponsiveContainer, Sankey, Tooltip } from "recharts";

type FlowNode = { name: string; id: string; color: string };
type FlowLink = { source: number; target: number; value: number; origin: LeadGroup };

const outcomeColors: Record<string, string> = {
  "o:won": "var(--ink)",
  "q:disqualified": "var(--viz-other)",
  "o:lost": "var(--viz-other)",
};

function nodeColor(id: string) {
  if (id.startsWith("src:")) return leadGroupColors[id.slice(4) as LeadGroup] ?? "var(--viz-other)";
  return outcomeColors[id] ?? "var(--sb-text)";
}

function NodeShape({ x, y, width, height, payload }: SankeyNodeProps) {
  const node = payload as unknown as FlowNode & { value: number; sourceLinks: unknown[] };
  const labelOnLeft = node.sourceLinks.length === 0;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={node.color} rx={2} />
      <text
        x={labelOnLeft ? x - 8 : x + width + 8}
        y={y + height / 2}
        textAnchor={labelOnLeft ? "end" : "start"}
        dominantBaseline="middle"
        fontSize={12}
        fill="var(--foreground)"
      >
        {node.name} {node.value}
      </text>
    </g>
  );
}

type LinkProps = {
  sourceX: number;
  targetX: number;
  sourceY: number;
  targetY: number;
  sourceControlX: number;
  targetControlX: number;
  linkWidth: number;
  payload: FlowLink;
};

// Bands keep their source group's color through every column, so a closing can be traced back to where it came from.
function LinkShape({ sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, payload }: LinkProps) {
  return (
    <path
      d={`M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
      fill="none"
      stroke={leadGroupColors[payload.origin]}
      strokeOpacity={0.35}
      strokeWidth={Math.max(linkWidth, 1)}
    />
  );
}

export default function RevenueLeadFlowChartOS({ data }: { data: RevenueLeadFlow }) {
  const order = [...data.nodes].sort((a, b) => a.column - b.column);
  const index = new Map(order.map((node, position) => [node.id, position]));
  const nodes: FlowNode[] = order.map((node) => ({ name: node.label, id: node.id, color: nodeColor(node.id) }));
  const links: FlowLink[] = data.links.map((link) => ({ source: index.get(link.source) ?? 0, target: index.get(link.target) ?? 0, value: link.count, origin: link.origin }));

  const byId = new Map(data.nodes.map((node) => [node.id, node.label]));
  return (
    <div>
      <table className="w-full text-sm md:hidden">
        <caption className="sr-only">Lead flow as a table</caption>
        <thead>
          <tr className="border-b border-line-soft text-left text-xs text-gray-500 dark:text-zinc-400">
            <th scope="col" className="py-2 font-semibold">From</th>
            <th scope="col" className="py-2 font-semibold">To</th>
            <th scope="col" className="py-2 text-right font-semibold">Leads</th>
          </tr>
        </thead>
        <tbody>
          {data.links.map((link) => (
            <tr key={`${link.source}-${link.target}-${link.origin}`} className="border-b border-line-soft last:border-0">
              <td className="py-2">
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ backgroundColor: leadGroupColors[link.origin] }} />
                  {byId.get(link.source)}
                </span>
              </td>
              <td className="py-2">{byId.get(link.target)}</td>
              <td className="py-2 text-right tabular-nums">{count(link.count)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="hidden h-96 w-full md:block" role="img" aria-label={`Lead flow of ${data.leads} leads: ${data.nodes.map((node) => `${node.label} ${node.count}`).join(", ")}`}>
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={{ nodes, links }}
            nodePadding={22}
            nodeWidth={10}
            iterations={64}
            margin={{ top: 8, right: 150, bottom: 8, left: 140 }}
            node={(props: SankeyNodeProps) => <NodeShape {...props} />}
            link={(props: unknown) => <LinkShape {...(props as LinkProps)} />}
          >
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload as { payload?: FlowLink & { source: FlowNode; target: FlowNode }; name?: string; value?: number };
                const link = item.payload;
                if (link?.source && link.target) {
                  return (
                    <ChartTooltipCard
                      title={`${link.source.name} → ${link.target.name}`}
                      rows={[{ label: `leads from ${leadGroupShortLabels[link.origin]}`, value: count(link.value), color: leadGroupColors[link.origin] }]}
                    />
                  );
                }
                return <ChartTooltipCard title={String(item.name ?? "")} rows={[{ label: "leads", value: count(Number(item.value ?? 0)) }]} />;
              }}
            />
          </Sankey>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 hidden flex-wrap gap-x-3 gap-y-1 md:flex">
        {(Object.keys(leadGroupColors) as LeadGroup[]).map((group) => (
          <li key={group} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-zinc-300">
            <span aria-hidden="true" className="size-2 rounded-xs" style={{ backgroundColor: leadGroupColors[group] }} />
            {leadGroupShortLabels[group]}
          </li>
        ))}
      </ul>
    </div>
  );
}
