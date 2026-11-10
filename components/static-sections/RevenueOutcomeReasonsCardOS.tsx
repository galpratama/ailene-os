"use client";

import type { RevenueOutcomeReasons } from "@/apis/revenue";
import WarehouseRankedBarsOS from "@/components/charts/WarehouseRankedBarsOS";
import RevenueCardOS from "@/components/elements/RevenueCardOS";
import type { RevenueTabProps } from "@/components/pages/RevenueEngineOS";
import { useRevenue } from "@/hooks/useRevenue";
import { getRevenueOutcomeReasons } from "@/lib/actions";
import { count, percent } from "@/lib/revenue";

// Disqualify reasons on the SDR tab, lost reasons on the BDR tab: one bar per reason picked when closing, "Belum diisi" for older closings.
export default function RevenueOutcomeReasonsCardOS({
  kind,
  title,
  description,
  period,
  enabled,
}: Omit<RevenueTabProps, "periodLabel"> & { kind: "disqualified" | "lost"; title: string; description: string }) {
  const query = useRevenue<RevenueOutcomeReasons>(`outcome-reasons/${kind}`, period, () => getRevenueOutcomeReasons({ ...period, kind }), enabled);
  const data = query.data;
  const unit = kind === "disqualified" ? "leads" : "deals";

  return (
    <RevenueCardOS
      title={title}
      description={description}
      source="os"
      isLoading={query.isLoading}
      error={query.error}
      onRetry={() => query.refetch()}
      isEmpty={!data?.total}
      emptyMessage={kind === "disqualified" ? "No leads were disqualified in this period." : "No deals were lost in this period."}
    >
      <WarehouseRankedBarsOS
        items={(data?.reasons ?? []).map((reason) => ({
          key: reason.code ?? "unrecorded",
          label: reason.label,
          value: reason.count,
          display: `${count(reason.count)} · ${percent(reason.share)}`,
          color: reason.code ? "var(--viz-1)" : "var(--viz-other)",
          rows: [{ label: unit, value: count(reason.count) }],
        }))}
      />
      {!!data?.unrecorded && (
        <p className="mt-3 text-xs text-gray-500 dark:text-zinc-400">
          {count(data.unrecorded)} {unit} ditutup sebelum alasan wajib diisi. Isi alasannya dari form edit lead supaya ikut terhitung.
        </p>
      )}
    </RevenueCardOS>
  );
}
