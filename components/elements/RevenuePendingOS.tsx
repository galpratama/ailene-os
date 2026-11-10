import PendingLabelOS from "@/components/labels/PendingLabelOS";
import type { PendingBlocker } from "@/lib/revenue";

export type PendingShape = "bars" | "columns" | "table" | "steps";

const barWidths = [92, 78, 64, 51, 38];
const columnHeights = [42, 58, 50, 72, 64, 86];

// A ghost of the finished widget, so the layout stays complete while the backend catches up.
export default function RevenuePendingOS({
  shape = "bars",
  reason,
  columns = [],
  blocker,
}: {
  shape?: PendingShape;
  reason: string;
  columns?: string[];
  blocker?: PendingBlocker;
}) {
  return (
    <div className="relative">
      <div aria-hidden="true" className="pointer-events-none select-none opacity-60">
        {shape === "bars" && (
          <ul className="flex flex-col gap-3">
            {barWidths.map((width) => (
              <li key={width} className="flex items-center gap-3">
                <span className="h-2.5 w-24 shrink-0 rounded-full bg-line-soft" />
                <span className="h-2.5 rounded-full bg-line-soft" style={{ width: `${width}%` }} />
              </li>
            ))}
          </ul>
        )}
        {shape === "columns" && (
          <div className="flex h-40 items-end gap-3 border-b border-line-soft px-2">
            {columnHeights.map((height, index) => (
              <span key={index} className="flex-1 rounded-t-md bg-line-soft" style={{ height: `${height}%` }} />
            ))}
          </div>
        )}
        {shape === "steps" && (
          <div className="flex h-24 items-center gap-1">
            {[100, 88, 76, 64, 52].map((height) => (
              <span key={height} className="flex-1 rounded-md bg-line-soft" style={{ height: `${height}%` }} />
            ))}
          </div>
        )}
        {shape === "table" && (
          <div className="overflow-hidden rounded-lg border border-line-soft">
            <div className="flex gap-3 border-b border-line-soft px-3 py-2 text-xs font-semibold text-gray-500 dark:text-zinc-400">
              {(columns.length ? columns : ["", "", ""]).map((column, index) => (
                <span key={`${column}-${index}`} className="flex-1 truncate">{column}</span>
              ))}
            </div>
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex gap-3 border-b border-line-soft px-3 py-2.5 last:border-0">
                {(columns.length ? columns : ["", "", ""]).map((column, index) => (
                  <span key={`${column}-${index}`} className="h-2.5 flex-1 rounded-full bg-line-soft" />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-4 text-center">
        <PendingLabelOS blocker={blocker} />
        <p className="max-w-sm rounded-md bg-card-bg/90 px-2 py-0.5 text-xs text-gray-600 dark:text-zinc-300">{reason}</p>
      </div>
    </div>
  );
}
