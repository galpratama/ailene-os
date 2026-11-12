import { shortDate } from "@/lib/revenue";

export type PivotColumnUnit = "week" | "month";

export type PivotMetric<F> = {
  key: string;
  label: string;
  format: "count" | "money" | "rate";
  // A rate divides summed numerators by summed denominators, so it is never an average of cell rates.
  numerator: (fact: F) => number;
  denominator?: (fact: F) => number;
};

export type PivotRowGroup = { key: string; label: string; order: number; parent?: { key: string; label: string; order: number } };

export type PivotRowDimension<F> = { key: string; label: string; heading: string; row: (fact: F) => PivotRowGroup };

export type PivotColumn = { key: string; label: string };

export type PivotTableRow = { key: string; label: string; kind: "leaf" | "subtotal" | "total"; cells: (number | null)[]; total: number | null };

export type PivotTable = { columns: PivotColumn[]; rows: PivotTableRow[]; max: number };

function addDays(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function mondayOf(value: string) {
  const day = new Date(`${value}T00:00:00Z`).getUTCDay();
  return addDays(value, -((day + 6) % 7));
}

function columnKey(value: string, unit: PivotColumnUnit) {
  return unit === "week" ? mondayOf(value) : value.slice(0, 7);
}

// Every week or month the period touches, zero-filled so empty weeks still show.
export function pivotColumns(start: string, end: string, unit: PivotColumnUnit): PivotColumn[] {
  const columns: PivotColumn[] = [];
  if (unit === "week") {
    for (let week = mondayOf(start), index = 1; week <= end; week = addDays(week, 7), index += 1) {
      columns.push({ key: week, label: `W${index} · ${shortDate(week)}` });
    }
    return columns;
  }
  const [year, month] = start.split("-").map(Number);
  for (let cursor = new Date(Date.UTC(year, month - 1, 1)); cursor.toISOString().slice(0, 7) <= end.slice(0, 7); cursor.setUTCMonth(cursor.getUTCMonth() + 1)) {
    const key = cursor.toISOString().slice(0, 7);
    columns.push({ key, label: cursor.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }) });
  }
  return columns;
}

type Sums = { num: number[]; den: number[] };

function emptySums(size: number): Sums {
  return { num: new Array(size + 1).fill(0), den: new Array(size + 1).fill(0) };
}

function finish<F>(sums: Sums, metric: PivotMetric<F>) {
  return sums.num.map((num, i) => (metric.denominator ? (sums.den[i] > 0 ? num / sums.den[i] : null) : num));
}

// Rolls daily facts up into rows (with optional parent subtotals) by week or month columns, plus a total row and column.
export function buildPivot<F extends { date: string }>(
  facts: F[],
  metric: PivotMetric<F>,
  dimension: PivotRowDimension<F>,
  period: { start_date: string; end_date: string },
  unit: PivotColumnUnit,
): PivotTable {
  const columns = pivotColumns(period.start_date, period.end_date, unit);
  const index = new Map(columns.map((column, i) => [column.key, i]));
  const size = columns.length;
  const leaves = new Map<string, { group: PivotRowGroup; sums: Sums }>();
  const parents = new Map<string, { group: NonNullable<PivotRowGroup["parent"]>; sums: Sums }>();
  const grand = emptySums(size);

  for (const fact of facts) {
    const column = index.get(columnKey(fact.date, unit));
    if (column === undefined) continue;
    const num = metric.numerator(fact);
    const den = metric.denominator?.(fact) ?? 0;
    if (num === 0 && den === 0) continue;
    const group = dimension.row(fact);
    const targets: Sums[] = [grand];
    const leafKey = `${group.parent?.key ?? ""}/${group.key}`;
    if (!leaves.has(leafKey)) leaves.set(leafKey, { group, sums: emptySums(size) });
    targets.push(leaves.get(leafKey)!.sums);
    if (group.parent) {
      if (!parents.has(group.parent.key)) parents.set(group.parent.key, { group: group.parent, sums: emptySums(size) });
      targets.push(parents.get(group.parent.key)!.sums);
    }
    for (const sums of targets) {
      sums.num[column] += num;
      sums.num[size] += num;
      sums.den[column] += den;
      sums.den[size] += den;
    }
  }

  const toRow = (key: string, label: string, kind: PivotTableRow["kind"], sums: Sums): PivotTableRow => {
    const values = finish(sums, metric);
    return { key, label, kind, cells: values.slice(0, size), total: values[size] };
  };
  // Rows keep their dimension's order (group, stage), then the larger total first.
  const byOrder = (a: { group: { order: number; label: string }; sums: Sums }, b: { group: { order: number; label: string }; sums: Sums }) =>
    a.group.order - b.group.order || b.sums.num[size] - a.sums.num[size] || a.group.label.localeCompare(b.group.label);

  const leafRows = [...leaves.entries()].map(([key, entry]) => ({ key, ...entry })).sort(byOrder);
  const rows: PivotTableRow[] = [];
  if (parents.size) {
    for (const [parentKey, parent] of [...parents.entries()].sort((a, b) => byOrder(a[1], b[1]))) {
      rows.push(toRow(`parent:${parentKey}`, parent.group.label, "subtotal", parent.sums));
      for (const leaf of leafRows.filter((entry) => entry.group.parent?.key === parentKey)) rows.push(toRow(leaf.key, leaf.group.label, "leaf", leaf.sums));
    }
  } else {
    for (const leaf of leafRows) rows.push(toRow(leaf.key, leaf.group.label, "leaf", leaf.sums));
  }
  if (rows.length) rows.push(toRow("total", "Total", "total", grand));

  const max = Math.max(0, ...rows.filter((row) => row.kind === "leaf").flatMap((row) => row.cells.map((value) => value ?? 0)));
  return { columns, rows, max };
}
