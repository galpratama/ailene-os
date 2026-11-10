"use client";

import type { QuotationDetails } from "@/apis/quotations";
import AppButton from "@/components/buttons/AppButton";
import QuotationFlowStepperOS from "@/components/elements/QuotationFlowStepperOS";
import { pricingUrlForPipeline } from "@/lib/quotation-navigation";
import { quotationDaysLeft, quotationValidUntil, relativeDays } from "@/lib/quotations";
import { Check, CheckCircle2, CopyPlus, Hourglass, Loader2, RotateCcw, Send } from "lucide-react";
import type { ReactNode } from "react";

function Callout({ tone, children }: { tone: "kuning" | "oranye" | "hijau" | "gray"; children: ReactNode }) {
  const tones = {
    kuning: "border-kuning/40 bg-kuning-t",
    oranye: "border-oranye/30 bg-oranye-t",
    hijau: "border-hijau/30 bg-hijau-t",
    gray: "border-line bg-gray-50 dark:bg-zinc-900",
  };
  return <div className={`rounded-lg border px-3.5 py-3 text-sm text-gray-800 dark:text-zinc-200 ${tones[tone]}`}>{children}</div>;
}

// What happens next for this quotation, for whoever is looking at it.
export default function QuotationNextStepOS({
  quotation,
  requiresReview,
  canDecide,
  isSaving,
  isSubmitting,
  isDeciding,
  onSave,
  onSubmit,
  onApprove,
  onRevise,
}: {
  quotation: QuotationDetails;
  requiresReview: boolean;
  canDecide: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  isDeciding: boolean;
  onSave: () => void;
  onSubmit: () => void;
  onApprove: () => void;
  onRevise: () => void;
}) {
  const lastRevision = [...quotation.approvals].reverse().find((approval) => approval.decision === "needs_revision");
  const editable = quotation.status === "draft" || quotation.status === "needs_revision";
  const busy = isSaving || isSubmitting;
  const daysLeft = quotationDaysLeft(quotation);

  return (
    <section aria-label="Langkah berikutnya" className="flex flex-col gap-4 rounded-xl border border-line bg-card-bg p-4">
      <QuotationFlowStepperOS status={quotation.status} requiresReview={editable ? requiresReview : quotation.requires_review} />

      {quotation.status === "needs_revision" && lastRevision && (
        <Callout tone="oranye">
          <p className="font-semibold">Dikembalikan oleh {lastRevision.actor_name} · {relativeDays(lastRevision.created_at)}</p>
          {lastRevision.reason && <p className="mt-1 whitespace-pre-line text-gray-700 dark:text-zinc-300">“{lastRevision.reason}”</p>}
        </Callout>
      )}

      {editable && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <AppButton type="button" variant="outline" className="flex-1 justify-center" disabled={busy} onClick={onSave}>
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              Simpan draft
            </AppButton>
            <AppButton type="button" variant="primary" className="flex-1 justify-center" disabled={busy} onClick={onSubmit}>
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : requiresReview ? <Send size={14} /> : <Check size={14} />}
              {requiresReview ? (quotation.status === "needs_revision" ? "Ajukan ulang ke manager" : "Ajukan ke manager") : "Approve & kirim ke klien"}
            </AppButton>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            {requiresReview
              ? "Custom scope atau margin di bawah 45% perlu persetujuan manager sebelum dikirim."
              : "Package dengan margin 45% ke atas disetujui otomatis dan langsung bisa dikirim ke klien."}
          </p>
        </div>
      )}

      {quotation.status === "manager_review" &&
        (canDecide ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-700 dark:text-zinc-300">
              Diajukan {relativeDays(quotation.updated_at)} oleh <span className="font-semibold">{quotation.created_by_name}</span>. Cek harga dan margin, lalu putuskan.
            </p>
            <div className="flex gap-2">
              <AppButton type="button" variant="outline" className="flex-1 justify-center" disabled={isDeciding} onClick={onRevise}>
                <RotateCcw size={14} />
                Minta revisi
              </AppButton>
              <AppButton type="button" variant="primary" className="flex-1 justify-center" disabled={isDeciding} onClick={onApprove}>
                {isDeciding ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Setujui
              </AppButton>
            </div>
          </div>
        ) : (
          <Callout tone="kuning">
            <p className="flex items-center gap-2 font-semibold">
              <Hourglass size={14} aria-hidden="true" />
              Menunggu keputusan manager
            </p>
            <p className="mt-0.5 text-gray-700 dark:text-zinc-300">Diajukan {relativeDays(quotation.updated_at)}. Versi ini terkunci sampai manager memutuskan.</p>
          </Callout>
        ))}

      {quotation.status === "approved" && (
        <div className="flex flex-col gap-3">
          <Callout tone={quotation.is_current ? "hijau" : "gray"}>
            <p className="flex items-center gap-2 font-semibold">
              <CheckCircle2 size={14} className="text-hijau" aria-hidden="true" />
              {quotation.is_current ? "Approved dan dikirim ke klien" : "Versi lama"}
            </p>
            <p className="mt-0.5 text-gray-700 dark:text-zinc-300">
              {quotation.is_current
                ? `Berlaku hingga ${quotationValidUntil(quotation).format("D MMMM YYYY")}${daysLeft < 0 ? ", masa berlakunya sudah habis." : daysLeft === 0 ? ", berakhir hari ini." : ` (${daysLeft} hari lagi).`}`
                : "Pipeline ini sudah punya versi quotation yang lebih baru."}
            </p>
          </Callout>
          {quotation.is_current && (
            <AppButton href={pricingUrlForPipeline(quotation.pipeline_id)} variant="outline" className="justify-center">
              <CopyPlus size={14} />
              Buat versi baru (v{quotation.version + 1})
            </AppButton>
          )}
        </div>
      )}
    </section>
  );
}
