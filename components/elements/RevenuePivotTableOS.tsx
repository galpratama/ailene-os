import { count, money, percent } from "@/lib/revenue";
import type { PivotMetric, PivotTable } from "@/lib/revenue-pivot";

function display(value: number | null, format: PivotMetric<never>["format"]) {
  if (format === "rate") return percent(value);
  if (format === "money") return value ? money(value) : "—";
  return count(value ?? 0);
}

// A pivot grid: darker leaf cells hold higher values; subtotal and total rows stay unshaded.
export default function RevenuePivotTableOS({ table, format, heading }: { table: PivotTable; format: PivotMetric<never>["format"]; heading: string }) {
  const heat = (value: number | null) => {
    if (!value || table.max <= 0) return undefined;
    return { backgroundColor: `color-mix(in srgb, var(--viz-1) ${Math.round(6 + (value / table.max) * 30)}%, transparent)` };
  };
  const nested = table.rows.some((row) => row.kind === "subtotal");

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max border-collapse text-sm tabular-nums">
        <thead>
          <tr className="border-b border-line-soft text-xs text-gray-500 dark:text-zinc-400">
            <th scope="col" className="sticky left-0 z-10 bg-card-bg py-2 pr-4 text-left font-medium">{heading}</th>
            {table.columns.map((column) => (
              <th key={column.key} scope="col" className="px-3 py-2 text-right font-medium whitespace-nowrap">{column.label}</th>
            ))}
            <th scope="col" className="py-2 pl-3 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-soft">
          {table.rows.map((row) => {
            const strong = row.kind !== "leaf";
            return (
              <tr key={row.key} className={row.kind === "total" ? "border-t-2 border-line" : undefined}>
                <th
                  scope="row"
                  className={`sticky left-0 z-10 bg-card-bg py-2 pr-4 text-left whitespace-nowrap ${strong ? "font-semibold text-gray-900 dark:text-zinc-100" : "font-normal text-gray-700 dark:text-zinc-300"} ${row.kind === "leaf" && nested ? "pl-6" : ""}`}
                >
                  {row.label}
                </th>
                {row.cells.map((value, i) => (
                  <td
                    key={table.columns[i].key}
                    style={row.kind === "leaf" ? heat(value) : undefined}
                    className={`px-3 py-2 text-right whitespace-nowrap ${strong ? "font-semibold text-gray-900 dark:text-zinc-100" : "text-gray-800 dark:text-zinc-200"}`}
                  >
                    {display(value, format)}
                  </td>
                ))}
                <td className="py-2 pl-3 text-right font-semibold whitespace-nowrap text-gray-900 dark:text-zinc-100">{display(row.total, format)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
