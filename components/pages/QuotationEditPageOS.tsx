"use client";

import AppButton from "@/components/buttons/AppButton";
import QuotationStatusLabel from "@/components/labels/QuotationStatusLabel";
import PdfPreviewModalOS from "@/components/modals/PdfPreviewModalOS";
import QuotationReasonModalOS from "@/components/modals/QuotationReasonModalOS";
import { getQuotationPDFBlobUrl } from "@/components/pdf/QuotationPDF";
import { usePricingBuilder } from "@/hooks/usePricingBuilder";
import { buildQuotationPDFPropsFromQuotation } from "@/lib/quotation-pdf";
import { setSessionToken, trpc } from "@/trpc/client";
import type { B2BQuotationApprovalDecisionEnum } from "@prisma/client";
import dayjs from "dayjs";
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  ListChecks,
  Loader2,
  Lock,
  Package,
  Percent,
  RotateCcw,
  X,
} from "lucide-react";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";

const REVIEW_ROLES = ["Manager", "Administrator", "Super Admin"];

type PendingDecision = { decision: "NEEDS_REVISION" | "REJECTED" };

function EditorRow({
  icon: Icon,
  label,
  summary,
  defaultOpen,
  children,
}: {
  icon: typeof Package;
  label: string;
  summary: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-gray-200 last:border-0 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-zinc-800/50"
      >
        <Icon size={16} className="shrink-0 text-gray-400" />
        <span className="w-28 shrink-0 text-sm font-semibold text-gray-900 dark:text-zinc-100 sm:w-36">
          {label}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-gray-500 dark:text-zinc-400">
          {summary}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-4 dark:border-zinc-800/60 dark:bg-zinc-900/40">
          {children}
        </div>
      )}
    </div>
  );
}

export default function QuotationEditPageOS({
  sessionToken,
  quotationId,
}: {
  sessionToken: string;
  quotationId: number;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const utils = trpc.useUtils();

  const { data: sessionData } = trpc.auth.checkSession.useQuery(undefined, {
    enabled: !!sessionToken,
  });
  const canViewCostDetails =
    !!sessionData && sessionData.user.role_name !== "Business Development";
  const canDecide =
    !!sessionData && REVIEW_ROLES.includes(sessionData.user.role_name);

  const {
    data: quotationData,
    isLoading,
    isError,
  } = trpc.read.b2b.quotation.useQuery(
    { id: quotationId },
    { enabled: !!sessionToken }
  );
  const quotation = quotationData?.quotation;
  const isEditable =
    !!quotation &&
    (quotation.status === "DRAFT" || quotation.status === "NEEDS_REVISION");

  const builder = usePricingBuilder({
    isEditable,
    canViewCostDetails,
    seed: quotation ?? null,
  });

  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmittingQuotation, setIsSubmittingQuotation] = useState(false);

  function invalidateQuotationQueries() {
    utils.list.b2b.quotations.invalidate();
    utils.list.b2b.quotationApprovalQueue.invalidate();
    utils.list.b2b.homeSummary.invalidate();
    utils.read.b2b.quotation.invalidate({ id: quotationId });
  }

  const updateQuotation = trpc.update.b2b.quotation.useMutation();
  const submitQuotationMutation = trpc.update.b2b.submitQuotation.useMutation();
  const outcomeQuotationMutation =
    trpc.update.b2b.updateQuotationOutcome.useMutation({
      onError: (err) => setSaveError(err.message),
    });

  async function handleSaveDraft() {
    setSaveError(null);
    setIsSavingDraft(true);
    try {
      await updateQuotation.mutateAsync({
        id: quotationId,
        ...builder.buildQuotationPayload(),
      });
      invalidateQuotationQueries();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Gagal menyimpan draft.");
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function handleSubmit() {
    setSaveError(null);
    setIsSubmittingQuotation(true);
    try {
      await updateQuotation.mutateAsync({
        id: quotationId,
        ...builder.buildQuotationPayload(),
      });
      await submitQuotationMutation.mutateAsync({ id: quotationId });
      invalidateQuotationQueries();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Gagal membuat quotation."
      );
    } finally {
      setIsSubmittingQuotation(false);
    }
  }

  function handleOutcome(status: "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED") {
    outcomeQuotationMutation.mutate(
      { id: quotationId, status },
      { onSuccess: invalidateQuotationQueries }
    );
  }

  const [pendingDecision, setPendingDecision] =
    useState<PendingDecision | null>(null);
  const decideQuotation = trpc.update.b2b.decideQuotation.useMutation({
    onSuccess: () => {
      invalidateQuotationQueries();
      setPendingDecision(null);
    },
    onError: (err) => setSaveError(err.message),
  });
  function decide(decision: B2BQuotationApprovalDecisionEnum, reason?: string) {
    setSaveError(null);
    decideQuotation.mutate({ id: quotationId, decision, reason });
  }

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  async function handlePreviewClientView() {
    if (!quotation) return;
    setSaveError(null);
    setIsPreviewLoading(true);
    try {
      const props = buildQuotationPDFPropsFromQuotation(quotation);
      const url = await getQuotationPDFBlobUrl(props);
      setPreviewUrl(url);
      setIsPreviewOpen(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Gagal membuka preview.");
    } finally {
      setIsPreviewLoading(false);
    }
  }
  function closePreview() {
    setIsPreviewOpen(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }

  if (isLoading) {
    return (
      <p className="px-8 py-12 text-center text-sm text-gray-400">
        Loading quotation...
      </p>
    );
  }
  if (isError || !quotation) {
    return (
      <p className="px-8 py-12 text-center text-sm text-red-500">
        Quotation not found or you do not have access.
      </p>
    );
  }

  const saveErrorBlock = saveError && (
    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
      {saveError}
    </p>
  );

  const draftSubmitButtons = isEditable && (
    <div className="flex gap-2">
      <AppButton
        type="button"
        variant="outline"
        className="flex-1 justify-center"
        disabled={isSavingDraft || isSubmittingQuotation}
        onClick={handleSaveDraft}
      >
        {isSavingDraft && <Loader2 size={14} className="animate-spin" />}
        Simpan Draft
      </AppButton>
      <AppButton
        type="button"
        variant="primary"
        className="flex-1 justify-center"
        disabled={isSavingDraft || isSubmittingQuotation}
        onClick={handleSubmit}
      >
        {isSubmittingQuotation && <Loader2 size={14} className="animate-spin" />}
        Buat Quotation
      </AppButton>
    </div>
  );

  const outcomeSentButton = quotation.status === "APPROVED" && (
    <AppButton
      type="button"
      variant="primary"
      disabled={outcomeQuotationMutation.isPending}
      onClick={() => handleOutcome("SENT")}
    >
      Mark as Sent
    </AppButton>
  );

  const outcomeFinalButtons = quotation.status === "SENT" && (
    <div className="flex gap-2">
      <AppButton
        type="button"
        variant="primary"
        size="sm"
        className="flex-1 justify-center"
        disabled={outcomeQuotationMutation.isPending}
        onClick={() => handleOutcome("ACCEPTED")}
      >
        Accepted
      </AppButton>
      <AppButton
        type="button"
        variant="outline"
        size="sm"
        className="flex-1 justify-center"
        disabled={outcomeQuotationMutation.isPending}
        onClick={() => handleOutcome("REJECTED")}
      >
        Rejected
      </AppButton>
      <AppButton
        type="button"
        variant="outline"
        size="sm"
        className="flex-1 justify-center"
        disabled={outcomeQuotationMutation.isPending}
        onClick={() => handleOutcome("EXPIRED")}
      >
        Expired
      </AppButton>
    </div>
  );

  const approvalHistoryBlock = quotation.approvals.length > 0 && (
    <div className="flex flex-col gap-2 rounded-xl border border-gray-300 bg-card-bg p-4 dark:border-zinc-700">
      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        Riwayat approval
      </h4>
      {quotation.approvals.map((approval) => (
        <div
          key={approval.id}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs dark:border-zinc-800"
        >
          <p className="font-semibold text-gray-700 dark:text-zinc-300">
            {approval.decision} · {approval.actor_name}
          </p>
          {approval.reason && (
            <p className="mt-0.5 text-gray-500 dark:text-zinc-400">
              {approval.reason}
            </p>
          )}
        </div>
      ))}
    </div>
  );

  const managerReviewNote = quotation.status === "MANAGER_REVIEW" && !canDecide && (
    <p className="rounded-lg border border-kuning/40 bg-kuning-t px-3 py-2 text-sm text-gray-700">
      Menunggu keputusan Manager.
    </p>
  );

  const managerDecideButtons = canDecide && quotation.status === "MANAGER_REVIEW" && (
    <div className="flex flex-wrap items-center gap-1.5">
      <AppButton
        type="button"
        variant="outline"
        size="sm"
        className="bg-hijau text-white border-hijau hover:bg-hijau/90"
        disabled={decideQuotation.isPending}
        onClick={() => decide("APPROVED")}
      >
        <Check size={13} />
        Setuju
      </AppButton>
      <AppButton
        type="button"
        variant="outline"
        size="sm"
        className="bg-oranye text-white border-oranye hover:bg-oranye/90"
        disabled={decideQuotation.isPending}
        onClick={() => setPendingDecision({ decision: "NEEDS_REVISION" })}
      >
        <RotateCcw size={13} />
        Revisi
      </AppButton>
      <AppButton
        type="button"
        variant="outline"
        size="sm"
        className="bg-merah text-white border-merah hover:bg-merah/90"
        disabled={decideQuotation.isPending}
        onClick={() => setPendingDecision({ decision: "REJECTED" })}
      >
        <X size={13} />
        Tolak
      </AppButton>
    </div>
  );

  const editorRows = (
    <>
      <EditorRow icon={Package} label="Package" summary={builder.packageSummary}>
        {builder.packageContent}
      </EditorRow>
      <EditorRow
        icon={CalendarDays}
        label="Susunan hari"
        summary={builder.daysSummary}
        defaultOpen
      >
        {builder.daysContent}
      </EditorRow>
      <EditorRow icon={BookOpen} label="Materi" summary={builder.materiSummary}>
        {builder.materiContent}
      </EditorRow>
      <EditorRow icon={ListChecks} label="Add-ons" summary={builder.addonsSummary}>
        {builder.addonsContent}
      </EditorRow>
      <EditorRow icon={Percent} label="Komersial" summary={builder.commercialSummary}>
        {builder.commercialContent}
      </EditorRow>
    </>
  );

  return (
    <div className="flex min-w-0 flex-col gap-5 overflow-x-hidden px-4 py-6 sm:px-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1 text-xs font-medium text-gray-400 dark:text-zinc-500">
          <Link
            href="/quotations"
            className="hover:text-gray-600 dark:hover:text-zinc-300"
          >
            Quotations
          </Link>
          <ChevronRight size={12} />
          <span>Q-{quotation.id}</span>
          <ChevronRight size={12} />
          <span className="text-gray-600 dark:text-zinc-300">Edit</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
              Quotation Q-{quotation.id}
            </h2>
            <QuotationStatusLabel status={quotation.status} />
          </div>
          <AppButton
            type="button"
            variant="outline"
            size="sm"
            disabled={isPreviewLoading}
            onClick={handlePreviewClientView}
          >
            {isPreviewLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Eye size={14} />
            )}
            Preview (Client view)
          </AppButton>
        </div>
        <p className="text-xs text-gray-400 dark:text-zinc-500">
          {quotation.company_name} · {quotation.pipeline_name} · v
          {quotation.version} · Terakhir disimpan{" "}
          {dayjs(quotation.updated_at).format("D MMM YYYY, HH:mm")} oleh{" "}
          {quotation.created_by_name}
          {!isEditable && " · Sudah tidak bisa diubah, versi ini terkunci."}
        </p>
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,1fr)] xl:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="rounded-xl border border-gray-300 bg-card-bg dark:border-zinc-700">
            <div className="border-b border-gray-200 px-4 py-3 dark:border-zinc-800">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
                Quotation Editor{" "}
                <span className="font-normal normal-case text-gray-400">
                  (client facing information)
                </span>
              </h3>
            </div>
            <div className="flex flex-col">{editorRows}</div>
          </div>

          {builder.totalValueBox}

          {!canViewCostDetails && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-card-bg p-4 dark:border-zinc-700">
              <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                <Lock size={12} /> Staff / BD view — biaya disembunyikan dari
                non-manager
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {["Trainer cost", "Biaya tambahan", "Komisi BD", "Net margin"].map(
                  (label) => (
                    <div
                      key={label}
                      className="rounded-lg border border-gray-200 px-2.5 py-2 dark:border-zinc-800"
                    >
                      <p className="text-[10px] text-gray-400">{label}</p>
                      <p className="font-mono text-sm text-gray-300 dark:text-zinc-600">
                        — — —
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {builder.flagsBlock}
          {builder.copyButtonBlock}
          {saveErrorBlock}
          {draftSubmitButtons}
          {outcomeSentButton}
          {outcomeFinalButtons}
        </div>

        <div className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-6">
          {canViewCostDetails ? (
            <div className="rounded-xl border border-gray-300 bg-card-bg dark:border-zinc-700">
              <div className="flex items-center justify-between gap-2 border-b border-gray-200 px-4 py-3 dark:border-zinc-800">
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
                  Manager Approval{" "}
                  <span className="font-normal normal-case text-gray-400">
                    (internal view)
                  </span>
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  <Lock size={11} /> Manager only
                </span>
              </div>
              <div className="flex flex-col gap-4 p-4">
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="rounded-lg border border-gray-200 px-2.5 py-2 dark:border-zinc-800">
                    <p className="text-[10px] uppercase text-gray-400">
                      Quotation version
                    </p>
                    <p className="font-semibold text-gray-800 dark:text-zinc-200">
                      v{quotation.version}
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-200 px-2.5 py-2 dark:border-zinc-800">
                    <p className="text-[10px] uppercase text-gray-400">
                      Last updated
                    </p>
                    <p className="font-semibold text-gray-800 dark:text-zinc-200">
                      {dayjs(quotation.updated_at).format("D MMM, HH:mm")}
                    </p>
                  </div>
                </div>

                {builder.costBreakdownCard}
                {builder.marginCard}
                {approvalHistoryBlock}
                {managerDecideButtons}
                {managerReviewNote}
              </div>
            </div>
          ) : (
            managerReviewNote
          )}
        </div>
      </div>

      <PdfPreviewModalOS
        isOpen={isPreviewOpen}
        url={previewUrl}
        title={`Quotation #${quotation.id} · ${quotation.company_name}`}
        onClose={closePreview}
      />

      <QuotationReasonModalOS
        isOpen={pendingDecision !== null}
        title={
          pendingDecision?.decision === "REJECTED"
            ? "Reject quotation?"
            : "Kembalikan untuk revisi?"
        }
        confirmLabel={
          pendingDecision?.decision === "REJECTED" ? "Reject" : "Kembalikan"
        }
        destructive={pendingDecision?.decision === "REJECTED"}
        isPending={decideQuotation.isPending}
        onClose={() => setPendingDecision(null)}
        onConfirm={(reason) => {
          if (!pendingDecision) return;
          decide(pendingDecision.decision, reason);
        }}
      />
    </div>
  );
}
