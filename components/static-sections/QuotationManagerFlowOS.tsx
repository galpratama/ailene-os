"use client";

import type { QuotationApprovalDecision, QuotationListItem } from "@/apis/quotations";
import AppButton from "@/components/buttons/AppButton";
import CompanyLogoOS from "@/components/elements/CompanyLogoOS";
import QuotationMarginMeterOS from "@/components/elements/QuotationMarginMeterOS";
import TaskAssigneeAvatarOS from "@/components/elements/TaskAssigneeAvatarOS";
import QuotationReasonModalOS from "@/components/modals/QuotationReasonModalOS";
import type { useQuotationPdf } from "@/hooks/useQuotationPdf";
import { decideQuotation } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { getRupiahCurrency, getShortRupiahCurrency } from "@/lib/currency";
import { formatQuotationNumber } from "@/lib/quotation-number";
import { relativeDays } from "@/lib/quotations";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Check, CheckCircle2, ClipboardCheck, Eye, Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// The manager's review queue, kept apart from the full table so a decision never hides among 100 rows.
export default function QuotationManagerFlowOS({ quotations, pdf }: { quotations: QuotationListItem[]; pdf: ReturnType<typeof useQuotationPdf> }) {
  const queryClient = useQueryClient();
  const rows = quotations
    .filter((row) => row.is_current && row.status === "manager_review")
    .sort((a, b) => a.updated_at.localeCompare(b.updated_at));
  const [busyId, setBusyId] = useState<number | null>(null);
  const [revising, setRevising] = useState<QuotationListItem | null>(null);

  const decide = useMutation({
    mutationFn: async (payload: { quotation: QuotationListItem; decision: QuotationApprovalDecision; reason?: string }) =>
      requireApiData(await decideQuotation({ id: payload.quotation.id, decision: payload.decision, reason: payload.reason })),
    onMutate: ({ quotation }) => setBusyId(quotation.id),
    onSuccess: async (_, { quotation, decision }) => {
      setRevising(null);
      showSuccessToast(`${formatQuotationNumber(quotation)} ${decision === "approved" ? "disetujui dan siap dikirim ke klien" : "dikembalikan untuk revisi"}.`);
      await queryClient.invalidateQueries({ queryKey: ["quotations"] });
    },
    onError: (err) => showErrorToast(err),
    onSettled: () => setBusyId(null),
  });

  return (
    <section aria-labelledby="manager-flow-title" className="flex flex-col rounded-2xl border border-line bg-card-bg">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-kuning-t text-gray-900">
            <ClipboardCheck size={16} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 id="manager-flow-title" className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
              Perlu review manager
              <span className="ml-1.5 tabular-nums text-gray-500 dark:text-zinc-400">{rows.length}</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">Cek harga dan margin. Setelah disetujui, quotation langsung dikirim ke klien.</p>
          </div>
        </div>
      </header>

      {rows.length === 0 ? (
        <div className="flex items-center gap-2 px-5 py-4 text-sm text-gray-500 dark:text-zinc-400">
          <CheckCircle2 size={16} className="shrink-0 text-hijau" aria-hidden="true" />
          Semua quotation sudah direview.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 2xl:grid-cols-3">
          {rows.map((quotation) => {
            const number = formatQuotationNumber(quotation);
            return (
              <li key={quotation.id} className="flex flex-col gap-3.5 rounded-xl border border-line p-4 transition-colors hover:border-claude/40">
                <div className="flex items-start gap-3">
                  <CompanyLogoOS name={quotation.company_name} imageUrl={quotation.company_image_url} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">{quotation.company_name}</p>
                    <Link href={`/quotations/${quotation.id}`} className="text-xs tabular-nums text-gray-500 hover:text-claude hover:underline dark:text-zinc-400">
                      {number}
                    </Link>
                  </div>
                  <span className="shrink-0 text-xs text-gray-500 dark:text-zinc-400">Diajukan {relativeDays(quotation.updated_at)}</span>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 dark:text-zinc-400">Nilai program</p>
                    <p className="truncate font-heading text-xl font-semibold tabular-nums text-gray-900 dark:text-zinc-100">{getRupiahCurrency(Number(quotation.net_value))}</p>
                    <p className="text-xs tabular-nums text-gray-500 dark:text-zinc-400">Total invoice {getShortRupiahCurrency(Number(quotation.invoice_amount))}</p>
                  </div>
                  <QuotationMarginMeterOS margin={quotation.margin_pct === null ? null : Number(quotation.margin_pct)} compact />
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
                  <TaskAssigneeAvatarOS name={quotation.created_by_name} avatar={quotation.created_by_avatar ?? null} colorKey={quotation.created_by_id} size="md" />
                  <span className="truncate">
                    oleh <span className="font-medium text-gray-700 dark:text-zinc-200">{quotation.created_by_name}</span>
                  </span>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-1.5 border-t border-line-soft pt-3">
                  <AppButton type="button" variant="secondary" size="iconSm" aria-label={`Lihat PDF ${number}`} title="Lihat PDF" disabled={pdf.isBusy(quotation.id, "view")} onClick={() => pdf.view(quotation.id)}>
                    {pdf.isBusy(quotation.id, "view") ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                  </AppButton>
                  <AppButton href={`/quotations/${quotation.id}`} variant="secondary" size="iconSm" aria-label={`Buka ${number}`} title="Buka detail">
                    <ArrowUpRight size={14} />
                  </AppButton>
                  <span className="flex-1" />
                  {busyId === quotation.id && <Loader2 size={14} className="animate-spin text-gray-400" aria-label="Menyimpan" />}
                  <AppButton type="button" variant="outline" size="sm" disabled={decide.isPending} onClick={() => setRevising(quotation)}>
                    <RotateCcw size={13} />
                    Revisi
                  </AppButton>
                  <AppButton type="button" variant="primary" size="sm" disabled={decide.isPending} onClick={() => decide.mutate({ quotation, decision: "approved" })}>
                    <Check size={13} />
                    Setuju
                  </AppButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <QuotationReasonModalOS
        isOpen={revising !== null}
        title="Kembalikan untuk revisi?"
        confirmLabel="Kembalikan"
        isPending={decide.isPending}
        onClose={() => setRevising(null)}
        onConfirm={(reason) => {
          if (revising) decide.mutate({ quotation: revising, decision: "needs_revision", reason });
        }}
      />
    </section>
  );
}
