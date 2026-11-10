"use client";

import type { OutcomeKind, OutcomeReason } from "@/apis/sales";
import AppButton from "@/components/buttons/AppButton";
import Label from "@/components/labels/Label";
import { Pencil, Plus } from "lucide-react";

const COPY: Record<OutcomeKind, { title: string; hint: string }> = {
  disqualified: { title: "Disqualify reasons", hint: "Dipilih saat lead SDR masuk stage terminal." },
  lost: { title: "Lost reasons", hint: "Dipilih saat deal BDR masuk stage terminal selain Closed won." },
};

// One kind of the outcome reason catalog; reasons are retired rather than deleted, since closed pipelines keep pointing at them.
export default function OutcomeReasonListOS({
  kind,
  reasons,
  onAdd,
  onEdit,
}: {
  kind: OutcomeKind;
  reasons: OutcomeReason[];
  onAdd: (kind: OutcomeKind) => void;
  onEdit: (reason: OutcomeReason) => void;
}) {
  const activeCount = reasons.filter((reason) => reason.active).length;
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-line bg-card-bg">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100">{COPY[kind].title}</h3>
            <Label variant="gray">{activeCount}</Label>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">{COPY[kind].hint}</p>
        </div>
        <AppButton type="button" variant="outline" size="sm" onClick={() => onAdd(kind)}>
          <Plus size={14} /> Add reason
        </AppButton>
      </div>

      {reasons.length === 0 ? (
        <p className="px-5 py-6 text-sm text-gray-500 dark:text-zinc-400">Belum ada alasan.</p>
      ) : (
        <div className="divide-y divide-line-soft">
          {reasons.map((reason) => (
            <div key={reason.code} className={`flex items-center gap-3 px-5 py-3 ${reason.active ? "" : "opacity-60"}`}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">{reason.label}</p>
                  {!reason.active && <Label variant="gray">Nonaktif</Label>}
                </div>
                <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-zinc-400">{reason.code}</p>
              </div>
              <AppButton type="button" variant="secondary" size="iconSm" aria-label={`Edit ${reason.label}`} title="Edit reason" onClick={() => onEdit(reason)}>
                <Pencil size={14} />
              </AppButton>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
