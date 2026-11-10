"use client";

import AppButton from "@/components/buttons/AppButton";
import RevenueKpiOS from "@/components/elements/RevenueKpiOS";
import AppInput from "@/components/fields/AppInput";
import AppSwitch from "@/components/fields/AppSwitch";
import PdfPreviewModalOS from "@/components/modals/PdfPreviewModalOS";
import QuotationManagerFlowOS from "@/components/static-sections/QuotationManagerFlowOS";
import QuotationTableOS from "@/components/static-sections/QuotationTableOS";
import { useSession } from "@/contexts/SessionContext";
import { useQuotationList } from "@/hooks/useQuotationList";
import { useQuotationPdf } from "@/hooks/useQuotationPdf";
import { getRupiahCurrency, getShortRupiahCurrency } from "@/lib/currency";
import { formatQuotationNumber } from "@/lib/quotation-number";
import { inQuotationTab, quotationStats, quotationTabs, type QuotationTab } from "@/lib/quotations";
import { Plus, Search } from "lucide-react";
import { useState } from "react";

export default function QuotationsPageOS({ sessionToken }: { sessionToken: string }) {
  const sessionUser = useSession();
  const isManager = sessionUser?.role === "administrator";

  const { data, isLoading, isError } = useQuotationList({}, !!sessionToken);
  const quotations = data ?? [];
  const pdf = useQuotationPdf();

  const [tab, setTab] = useState<QuotationTab>("all");
  const [search, setSearch] = useState("");
  const [showOld, setShowOld] = useState(false);

  const keyword = search.trim().toLowerCase();
  const oldCount = quotations.filter((row) => !row.is_current).length;
  const base = quotations.filter(
    (row) =>
      (showOld || row.is_current) &&
      (!keyword || [formatQuotationNumber(row), row.company_name, row.created_by_name].some((text) => text.toLowerCase().includes(keyword)))
  );
  const rows = base.filter((row) => inQuotationTab(row.status, tab));
  const stats = quotationStats(quotations);

  return (
    <div className="flex h-full min-w-0 flex-col gap-5 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Quotations</h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">Penawaran package dan custom training untuk semua lead.</p>
        </div>
        <AppButton href="/pricing" size="sm">
          <Plus size={14} />
          Quotation baru
        </AppButton>
      </div>

      {isError ? (
        <p role="alert" className="py-8 text-center text-sm text-merah">
          Quotation gagal dimuat. Kamu mungkin tidak punya akses ke data ini.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <RevenueKpiOS
              label="Approved"
              value={getShortRupiahCurrency(stats.approved.value)}
              lines={[`${stats.approved.count} quotation sudah dikirim ke klien`]}
              info="Total nilai program dari quotation yang sudah disetujui manager. Quotation yang disetujui langsung dikirim ke klien."
              isLoading={isLoading}
            />
            <RevenueKpiOS
              label="Manager review"
              value={String(stats.review.count)}
              lines={[`senilai ${getShortRupiahCurrency(stats.review.value)}`]}
              info="Quotation yang sudah diajukan dan menunggu keputusan manager."
              isLoading={isLoading}
            />
            <RevenueKpiOS
              label="Needs revision"
              value={String(stats.revision.count)}
              lines={[`senilai ${getShortRupiahCurrency(stats.revision.value)}`]}
              info="Quotation yang dikembalikan manager dan perlu diperbaiki pembuatnya sebelum diajukan lagi."
              isLoading={isLoading}
            />
            <RevenueKpiOS
              label="Draft"
              value={String(stats.draft.count)}
              lines={[`senilai ${getShortRupiahCurrency(stats.draft.value)}`]}
              info="Quotation yang masih disusun dan belum diajukan ke manager."
              isLoading={isLoading}
            />
          </div>

          {isManager && !isLoading && <QuotationManagerFlowOS quotations={quotations} pdf={pdf} />}

          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1" role="tablist" aria-label="Filter status quotation">
                {quotationTabs.map((entry) => {
                  const count = base.filter((row) => inQuotationTab(row.status, entry.key)).length;
                  const selected = tab === entry.key;
                  return (
                    <button
                      key={entry.key}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setTab(entry.key)}
                      className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-claude ${
                        selected
                          ? "border-forest-deep bg-forest-deep text-white dark:border-lime-bright dark:bg-lime-bright dark:text-forest-deep"
                          : "border-line text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                      }`}
                    >
                      {entry.label}
                      <span className={`tabular-nums ${selected ? "opacity-80" : "text-gray-400 dark:text-zinc-500"}`}>{count}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <AppInput
                  inputId="quotation-search"
                  type="search"
                  aria-label="Cari quotation"
                  placeholder="Cari nomor, company, pembuat"
                  icon={<Search size={14} />}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  containerClassName="w-full sm:w-72"
                />
                {oldCount > 0 && <AppSwitch inputId="quotation-show-old" label={`Versi lama (${oldCount})`} checked={showOld} onChange={setShowOld} compact />}
              </div>
            </div>

            <QuotationTableOS
              rows={rows}
              isLoading={isLoading}
              canViewMargin={isManager}
              pdf={pdf}
              empty={
                keyword || tab !== "all" ? (
                  <p className="text-sm text-gray-500 dark:text-zinc-400">Tidak ada quotation yang cocok dengan filter ini.</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-700 dark:text-zinc-200">Belum ada quotation</p>
                    <p className="max-w-sm text-sm text-gray-500 dark:text-zinc-400">Buat penawaran pertama dari Pricing Calculator, lalu ajukan ke manager.</p>
                    <AppButton href="/pricing" size="sm" className="mt-2">
                      <Plus size={14} />
                      Quotation baru
                    </AppButton>
                  </>
                )
              }
            />
            {!isLoading && rows.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                {rows.length} quotation · total nilai {getRupiahCurrency(rows.reduce((sum, row) => sum + Number(row.net_value), 0))}
              </p>
            )}
          </div>
        </>
      )}

      <PdfPreviewModalOS {...pdf.previewProps} />
    </div>
  );
}
