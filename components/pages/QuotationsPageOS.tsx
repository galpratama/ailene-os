"use client";

import AppButton from "@/components/buttons/AppButton";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import AppTextArea from "@/components/fields/AppTextArea";
import { downloadInvoicePDF } from "@/components/pdf/InvoicePDF";
import QuotationStatusLabel from "@/components/labels/QuotationStatusLabel";
import { getRupiahCurrency } from "@/lib/currency";
import {
  buildInvoicePDFPropsFromQuotation,
  quotationPdfFilename,
} from "@/lib/quotation-pdf";
import { setSessionToken, trpc } from "@/trpc/client";
import { Building2, Download, Eye, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type QueueEntry = {
  id: number;
  pipeline_id: number;
  pipeline_name: string;
  company_name: string;
  version: number;
  source_type: string;
  net_value: string | number;
  margin_pct: string | number;
  created_by_name: string;
};

// Decide actions live here (not on the Pricing Calculator) so a Manager can clear the queue in place.
function ReviewQueueItemOS({
  entry,
  onDownload,
  isDownloading,
}: {
  entry: QueueEntry;
  onDownload: (id: number, companyName: string) => void;
  isDownloading: boolean;
}) {
  const utils = trpc.useUtils();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const decideQuotation = trpc.update.b2b.decideQuotation.useMutation({
    onSuccess: () => {
      utils.list.b2b.quotationApprovalQueue.invalidate();
      utils.list.b2b.quotations.invalidate();
      utils.list.b2b.homeSummary.invalidate();
    },
    onError: (err) => setError(err.message),
  });

  function decide(decision: "APPROVED" | "NEEDS_REVISION" | "REJECTED") {
    setError(null);
    if (decision !== "APPROVED" && !reason.trim()) {
      setError("Alasan wajib diisi untuk Needs Revision / Reject.");
      return;
    }
    decideQuotation.mutate({
      id: entry.id,
      decision,
      reason: reason.trim() || undefined,
    });
  }

  return (
    <div className="rounded-lg border border-gray-900/10 bg-white p-3 dark:border-white/10 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/pricing?quotation_id=${entry.id}`}
          className="min-w-0 hover:underline"
        >
          <p className="truncate text-sm font-semibold text-gray-800 dark:text-zinc-200">
            #{entry.id} · {entry.company_name} · {entry.pipeline_name}
          </p>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            v{entry.version} · {entry.source_type} · by {entry.created_by_name}
          </p>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <div className="text-right">
            <p className="font-mono text-sm font-semibold text-gray-900 dark:text-zinc-100">
              {getRupiahCurrency(Number(entry.net_value))}
            </p>
            <p
              className={`text-xs font-semibold ${
                Number(entry.margin_pct) < 0.45 ? "text-merah" : "text-hijau"
              }`}
            >
              {(Number(entry.margin_pct) * 100).toFixed(1)}% margin
            </p>
          </div>
          <AppButton
            type="button"
            variant="ghost"
            size="iconSm"
            title="Download PDF"
            disabled={isDownloading}
            onClick={() => onDownload(entry.id, entry.company_name)}
          >
            {isDownloading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
          </AppButton>
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-start">
        <AppTextArea
          textAreaId={`quotation-queue-reason-${entry.id}`}
          placeholder="Alasan (wajib untuk Needs Revision / Reject)"
          rows={1}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="flex-1"
        />
        <div className="flex shrink-0 gap-2">
          <AppButton
            type="button"
            variant="primary"
            size="sm"
            disabled={decideQuotation.isPending}
            onClick={() => decide("APPROVED")}
          >
            Approve
          </AppButton>
          <AppButton
            type="button"
            variant="outline"
            size="sm"
            disabled={decideQuotation.isPending}
            onClick={() => decide("NEEDS_REVISION")}
          >
            Revisi
          </AppButton>
          <AppButton
            type="button"
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900"
            disabled={decideQuotation.isPending}
            onClick={() => decide("REJECTED")}
          >
            Reject
          </AppButton>
        </div>
      </div>
    </div>
  );
}

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

  const [pipelineFilter, setPipelineFilter] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const { data: pipelineData } = trpc.list.b2b.pipelines.useQuery(
    { page: 1, page_size: 200 },
    { enabled: !!sessionToken }
  );
  const pipelineOptions: AppSelectOption[] = [
    { value: null, label: "All Pipelines" },
    ...(pipelineData?.list.map((p) => ({
      value: p.id,
      label: `${p.company_name} - ${p.name}`,
    })) ?? []),
  ];

  const { data: queueData } = trpc.list.b2b.quotationApprovalQueue.useQuery(
    { page_size: 50 },
    { enabled: !!sessionToken && canReview }
  );

  const { data, isLoading, isError } = trpc.list.b2b.quotations.useQuery(
    { page_size: 200, pipeline_id: pipelineFilter ?? undefined },
    { enabled: !!sessionToken }
  );

  const quotations = data?.list ?? [];
  const queue = queueData?.list ?? [];

  // PDF is generated client-side straight from the list, no /pricing navigation needed.
  async function handleDownload(id: number, companyName: string) {
    setDownloadError(null);
    setDownloadingId(id);
    try {
      const res = await utils.read.b2b.quotation.fetch({ id });
      const props = buildInvoicePDFPropsFromQuotation(res.quotation);
      await downloadInvoicePDF(
        props,
        quotationPdfFilename({ id, company_name: companyName })
      );
    } catch (err) {
      setDownloadError(
        err instanceof Error ? err.message : "Gagal membuat PDF."
      );
    } finally {
      setDownloadingId(null);
    }
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
        {/* Drafting/editing happens on the Pricing Calculator, which is
            pipeline-aware via ?quotation_id=/?pipeline_id= — this page is
            list + review queue only, no create/edit form of its own. */}
        <Link href="/pricing">
          <AppButton size="sm">
            <Plus size={14} />
            New Quotation
          </AppButton>
        </Link>
      </div>

      {downloadError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {downloadError}
        </p>
      )}

      {canReview && queue.length > 0 && (
        <div className="rounded-xl border border-kuning/40 bg-kuning-t p-4">
          <p className="mb-3 text-sm font-bold text-gray-900">
            Awaiting your review · {queue.length}
          </p>
          <div className="flex flex-col gap-2">
            {queue.map((entry) => (
              <ReviewQueueItemOS
                key={entry.id}
                entry={entry}
                onDownload={handleDownload}
                isDownloading={downloadingId === entry.id}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-nowrap items-center gap-3">
        <div className="min-w-32 flex-1">
          <AppSelect
            selectId="quotations-pipeline-filter"
            placeholder="All Pipelines"
            value={pipelineFilter}
            options={pipelineOptions}
            onChange={(value) => setPipelineFilter(value as number | null)}
          />
        </div>
      </div>

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
                  <th className="px-5 py-3" />
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
                        className="flex items-center gap-1 px-5 py-3.5 text-gray-600 dark:text-zinc-300"
                      >
                        <Building2 size={12} className="text-gray-400" />
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
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <AppButton
                          type="button"
                          variant="ghost"
                          size="iconSm"
                          title="Download PDF"
                          disabled={downloadingId === quotation.id}
                          onClick={() =>
                            handleDownload(quotation.id, quotation.company_name)
                          }
                        >
                          {downloadingId === quotation.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Download size={14} />
                          )}
                        </AppButton>
                        <Link href={`/pricing?quotation_id=${quotation.id}`}>
                          <AppButton
                            type="button"
                            variant="ghost"
                            size="iconSm"
                            title="View"
                          >
                            <Eye size={14} />
                          </AppButton>
                        </Link>
                      </div>
                    </td>
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
    </div>
  );
}
