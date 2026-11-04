"use client";

import AppButton from "@/components/buttons/AppButton";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

export type AnalyticsColumn<T> = {
  key: string;
  label: string;
  value: (row: T) => string | number | null;
  render?: (row: T) => ReactNode;
  align?: "left" | "right";
};

export function toCsv<T>(columns: AnalyticsColumn<T>[], rows: T[]) {
  const cell = (value: string | number | null) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  return [columns.map((column) => cell(column.label)).join(","), ...rows.map((row) => columns.map((column) => cell(column.value(row))).join(","))].join("\n");
}

// The table twin behind every chart: same numbers, sortable, so nothing is only readable by hovering a mark.
export default function AnalyticsDataTableOS<T>({ columns, rows, rowKey }: { columns: AnalyticsColumn<T>[]; rows: T[]; rowKey: (row: T, index: number) => string }) {
  const [sort, setSort] = useState<{ key: string; descending: boolean } | null>(null);

  const sorted = useMemo(() => {
    const column = columns.find((entry) => entry.key === sort?.key);
    if (!column || !sort) return rows;
    return [...rows].sort((a, b) => {
      const left = column.value(a);
      const right = column.value(b);
      if (left === null) return 1;
      if (right === null) return -1;
      const order = typeof left === "number" && typeof right === "number" ? left - right : String(left).localeCompare(String(right));
      return sort.descending ? -order : order;
    });
  }, [columns, rows, sort]);

  return (
    <div className="max-h-120 overflow-auto rounded-lg border border-line-soft">
      <table className="w-full min-w-max text-sm tabular-nums">
        <thead className="sticky top-0 z-1 bg-card-bg">
          <tr className="border-b border-line-soft text-left text-xs font-semibold text-gray-500 dark:text-zinc-400">
            {columns.map((column) => {
              const active = sort?.key === column.key;
              return (
                <th key={column.key} scope="col" aria-sort={active ? (sort.descending ? "descending" : "ascending") : "none"} className={`px-3 py-2 ${column.align === "right" ? "text-right" : "text-left"}`}>
                  <AppButton
                    type="button"
                    variant={active ? "sortActive" : "sort"}
                    size="bare"
                    className={`gap-1 whitespace-nowrap text-xs font-semibold ${column.align === "right" ? "flex-row-reverse" : ""}`}
                    onClick={() => setSort({ key: column.key, descending: active ? !sort.descending : true })}
                  >
                    {column.label}
                    {active && (sort.descending ? <ArrowDown size={12} aria-hidden="true" /> : <ArrowUp size={12} aria-hidden="true" />)}
                  </AppButton>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, index) => (
            <tr key={rowKey(row, index)} className="border-b border-line-soft last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
              {columns.map((column) => (
                <td key={column.key} className={`max-w-90 truncate px-3 py-2 text-gray-700 dark:text-zinc-300 ${column.align === "right" ? "text-right" : "text-left"}`}>
                  {column.render ? column.render(row) : column.value(row) ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
