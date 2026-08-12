"use client";

import AppButton from "@/components/buttons/AppButton";
import { downloadQuotationPDF, getQuotationPDFBlobUrl } from "@/components/pdf/QuotationPDF";
import QuotationStatusLabel from "@/components/labels/QuotationStatusLabel";
import PdfPreviewModalOS from "@/components/modals/PdfPreviewModalOS";
import QuotationReasonModalOS from "@/components/modals/QuotationReasonModalOS";
import { getRupiahCurrency } from "@/lib/currency";
import {
  buildQuotationPDFPropsFromQuotation,
  quotationPdfFilename,
} from "@/lib/quotation-pdf";
import { setSessionToken, trpc } from "@/trpc/client";
import type { B2BQuotationApprovalDecisionEnum } from "@prisma/client";
import { Check, Download, Eye, Loader2, Pencil, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type PendingDecision = {
  id: number;
  decision: "NEEDS_REVISION" | "REJECTED";
};

export default function QuotationsPageOS({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const utils = trpc.useUtils();

  const { data: sessionData } = trpc.auth.checkSession.useQuery(undefined, {
    enabled: !!sessionToken,
  });
  const canReview = ["Manager", "Administrator", "Super Admin"].includes(
    sessionData?.user.role_name ?? ""
  );
  const canViewMargin = canReview;

  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [pendingDecision, setPendingDecision] =
    useState<PendingDecision | null>(null);

  const { data, isLoading, isError } = trpc.list.b2b.quotations.useQuery(
    { page_size: 200 },
    { enabled: !!sessionToken }
  );
  const quotations = data?.list ?? [];

  const decideQuotation = trpc.update.b2b.decideQuotation.useMutation({
    onSuccess: () => {
      utils.list.b2b.quotations.invalidate();
      utils.list.b2b.homeSummary.invalidate();
      setPendingDecision(null);
    },
    onError: (err) => setActionError(err.message),
  });

  function decide(
    id: number,
    decision: B2BQuotationApprovalDecisionEnum,
    reason?: string
  ) {
    setActionError(null);
    decideQuotation.mutate({ id, decision, reason });
  }

  async function loadPdfProps(id: number) {
    const res = await utils.read.b2b.quotation.fetch({ id });
    return buildQuotationPDFPropsFromQuotation(res.quotation);
  }

  async function handleDownload(id: number, companyName: string) {
    setActionError(null);
    setDownloadingId(id);
    try {
      const props = await loadPdfProps(id);
      await downloadQuotationPDF(
        props,
        quotationPdfFilename({ id, company_name: companyName })
      );
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal membuat PDF.");
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleView(id: number, companyName: string) {
    setActionError(null);
    setViewingId(id);
    try {
      const props = await loadPdfProps(id);
      const url = await getQuotationPDFBlobUrl(props);
      setPreviewUrl(url);
      setPreviewTitle(`Quotation #${id} · ${companyName}`);
      setIsPreviewOpen(true);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal membuka PDF.");
    } finally {
      setViewingId(null);
    }
  }

  function closePreview() {
    setIsPreviewOpen(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }

  return (
    <div className="px-4 py-6 flex flex-col gap-5 h-full sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
            Quotations
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
            Package and custom training quotations, across every lead
          </p>
        </div>
        {/* Drafting/editing lives on the pipeline-aware Pricing Calculator, not here. */}
        <Link href="/pricing">
          <AppButton size="sm">New Quotation</AppButton>
        </Link>
      </div>

      {actionError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {actionError}
        </p>
      )}

      {isError && (
        <p className="text-sm text-red-500 py-8 text-center">
          Failed to load quotations. You may not have access to this data.
        </p>
      )}

      {!isError && (
        <div className="shrink-0 overflow-hidden rounded-xl border border-gray-300 bg-card-bg dark:border-zinc-700">
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-800">
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Company / Pipeline</th>
                  <th className="px-5 py-3">Version</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Net Value</th>
                  {canViewMargin && <th className="px-5 py-3">Margin</th>}
                  <th className="px-5 py-3">Created By</th>
                  <th className="px-5 py-3">Actions</th>
                  {canReview && <th className="px-5 py-3">Manager Action</th>}
                </tr>
              </thead>
              <tbody>
                {quotations.map((quotation) => (
                  <tr
                    key={quotation.id}
                    className="border-b border-gray-200 last:border-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-400 dark:text-zinc-500">
                      #{quotation.id}
                    </td>
                    <td className="p-0">
                      <Link
                        href={`/pricing?quotation_id=${quotation.id}`}
                        className="flex items-center px-5 py-3.5 text-gray-600 dark:text-zinc-300"
                      >
                        {quotation.company_name} · {quotation.pipeline_name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-zinc-400">
                      v{quotation.version}
                      {!quotation.is_current && (
                        <span className="ml-1 text-gray-300 dark:text-zinc-600">(old)</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <QuotationStatusLabel status={quotation.status} />
                    </td>
                    <td className="px-5 py-3.5 font-mono font-semibold text-gray-900 dark:text-zinc-100">
                      {getRupiahCurrency(Number(quotation.net_value))}
                    </td>
                    {canViewMargin && (
                      <td className="px-5 py-3.5">
                        {quotation.margin_pct !== undefined ? (
                          <span
                            className={`font-semibold ${
                              Number(quotation.margin_pct) < 0.45
                                ? "text-merah"
                                : "text-hijau"
                            }`}
                          >
                            {(Number(quotation.margin_pct) * 100).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-gray-300 dark:text-zinc-600">—</span>
                        )}
                      </td>
                    )}
                    <td className="px-5 py-3.5 text-gray-500 dark:text-zinc-400">
                      {quotation.created_by_name}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <AppButton
                          type="button"
                          variant="outline"
                          size="sm"
                          className="bg-biru text-gray-900 border-biru hover:bg-biru/90"
                          disabled={viewingId === quotation.id}
                          onClick={() =>
                            handleView(quotation.id, quotation.company_name)
                          }
                        >
                          {viewingId === quotation.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Eye size={13} />
                          )}
                          Lihat
                        </AppButton>
                        <AppButton
                          type="button"
                          variant="outline"
                          size="sm"
                          className="bg-ungu text-white border-ungu hover:bg-ungu/90"
                          disabled={downloadingId === quotation.id}
                          onClick={() =>
                            handleDownload(quotation.id, quotation.company_name)
                          }
                        >
                          {downloadingId === quotation.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Download size={13} />
                          )}
                          Unduh
                        </AppButton>
                        <Link href={`/pricing?quotation_id=${quotation.id}`}>
                          <AppButton
                            type="button"
                            variant="outline"
                            size="sm"
                            className="bg-kuning text-white border-kuning hover:bg-kuning/90"
                          >
                            <Pencil size={13} />
                            Update
                          </AppButton>
                        </Link>
                      </div>
                    </td>
                    {canReview && (
                      <td className="px-5 py-3.5">
                        {quotation.status === "MANAGER_REVIEW" ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <AppButton
                              type="button"
                              variant="outline"
                              size="sm"
                              className="bg-hijau text-white border-hijau hover:bg-hijau/90"
                              disabled={decideQuotation.isPending}
                              onClick={() => decide(quotation.id, "APPROVED")}
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
                              onClick={() =>
                                setPendingDecision({
                                  id: quotation.id,
                                  decision: "NEEDS_REVISION",
                                })
                              }
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
                              onClick={() =>
                                setPendingDecision({
                                  id: quotation.id,
                                  decision: "REJECTED",
                                })
                              }
                            >
                              <X size={13} />
                              Tolak
                            </AppButton>
                          </div>
                        ) : (
                          <span className="text-gray-300 dark:text-zinc-600">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {!isLoading && quotations.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-10">
                No quotations found.
              </p>
            )}
          </div>
        </div>
      )}

      <PdfPreviewModalOS
        isOpen={isPreviewOpen}
        url={previewUrl}
        title={previewTitle}
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
          decide(pendingDecision.id, pendingDecision.decision, reason);
        }}
      />
    </div>
  );
}
