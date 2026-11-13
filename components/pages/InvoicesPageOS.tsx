"use client";

import type { Invoice, InvoiceStatus } from "@/apis/invoices";
import AppButton from "@/components/buttons/AppButton";
import RevenueKpiOS from "@/components/elements/RevenueKpiOS";
import AppInput from "@/components/fields/AppInput";
import InvoiceFormOS from "@/components/forms/InvoiceFormOS";
import InvoiceTableOS from "@/components/static-sections/InvoiceTableOS";
import { getInvoiceDetails, getRevenueCash, listInvoices } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { getRupiahCurrency, getShortRupiahCurrency } from "@/lib/currency";
import { invoiceStatusTabs } from "@/lib/invoices";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const PAGE_SIZE = 20;

type FormTarget = { mode: "create" } | { mode: "edit"; invoice: Invoice };

export default function InvoicesPageOS({ sessionToken }: { sessionToken: string }) {
  const enabled = !!sessionToken;
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useSearchParams();
  const linkedId = Number(params.get("invoice")) || null;

  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const list = useQuery({
    queryKey: ["invoices", "list", { status, keyword, page }],
    queryFn: async () =>
      requireApiData(await listInvoices({ status: status === "all" ? undefined : status, keyword: keyword || undefined, page, page_size: PAGE_SIZE })),
    enabled,
    placeholderData: keepPreviousData,
  });

  // The receivable figures are snapshots, so any period works; this month keeps the request small.
  const month = { start_date: dayjs().startOf("month").format("YYYY-MM-DD"), end_date: dayjs().format("YYYY-MM-DD") };
  const cash = useQuery({
    queryKey: ["revenue", "cash", month],
    queryFn: async () => requireApiData(await getRevenueCash(month)),
    enabled,
  });

  // A link from the revenue engine opens that invoice directly.
  const linked = useQuery({
    queryKey: ["invoices", "details", linkedId],
    queryFn: async () => requireApiData(await getInvoiceDetails(linkedId!)),
    enabled: enabled && linkedId !== null,
  });
  const [dismissedId, setDismissedId] = useState<number | null>(null);
  const activeTarget: FormTarget | null =
    formTarget ?? (linked.data && linked.data.id !== dismissedId ? { mode: "edit", invoice: linked.data } : null);

  function closeForm() {
    setFormTarget(null);
    if (linkedId !== null) {
      setDismissedId(linkedId);
      router.replace("/invoices");
    }
  }

  async function refresh() {
    await Promise.all([queryClient.invalidateQueries({ queryKey: ["invoices"] }), queryClient.invalidateQueries({ queryKey: ["revenue"] })]);
  }

  const rows = list.data?.list ?? [];
  const meta = list.data?.metapaging;
  const snapshot = cash.data;

  return (
    <div className="flex h-full min-w-0 flex-col gap-5 px-4 py-6 sm:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">Invoices</h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">Tagihan per termin dari pipeline yang sudah closed won, dan pembayarannya.</p>
        </div>
        <AppButton size="sm" onClick={() => setFormTarget({ mode: "create" })}>
          <Plus size={14} />
          Invoice baru
        </AppButton>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <RevenueKpiOS
          label="Closed, belum di-invoice"
          value={snapshot ? getShortRupiahCurrency(snapshot.closed_not_invoiced.amount) : undefined}
          lines={snapshot ? [`${snapshot.closed_not_invoiced.count} deal won masih punya sisa yang belum ditagih`] : []}
          info="Nilai deal closed won dikurangi invoice yang sudah terbit (punya tanggal invoice). Draft belum dihitung."
          isLoading={cash.isLoading}
        />
        <RevenueKpiOS
          label="Sudah ditagih, belum dibayar"
          value={snapshot ? getShortRupiahCurrency(snapshot.invoiced_not_paid.amount) : undefined}
          lines={snapshot ? [`${snapshot.invoiced_not_paid.count} invoice terbuka`] : []}
          info="Sisa tagihan dari invoice yang sudah terbit dan belum lunas."
          isLoading={cash.isLoading}
        />
        <RevenueKpiOS
          label="Terbuka lebih dari 30 hari"
          value={snapshot ? getShortRupiahCurrency(snapshot.open_over_30_days.amount) : undefined}
          lines={snapshot ? [`${snapshot.open_over_30_days.count} invoice perlu dikejar`] : []}
          info="Bagian dari tagihan terbuka yang tanggal invoice-nya lebih dari 30 hari lalu."
          isLoading={cash.isLoading}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="-mx-1 flex max-w-full gap-1 overflow-x-auto px-1" role="tablist" aria-label="Filter status invoice">
            {invoiceStatusTabs.map((entry) => {
              const selected = status === entry.key;
              return (
                <button
                  key={entry.key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    setStatus(entry.key);
                    setPage(1);
                  }}
                  className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-claude ${
                    selected
                      ? "border-forest-deep bg-forest-deep text-white dark:border-lime-bright dark:bg-lime-bright dark:text-forest-deep"
                      : "border-line text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                  }`}
                >
                  {entry.label}
                </button>
              );
            })}
          </div>
          <AppInput
            inputId="invoice-search"
            type="search"
            aria-label="Cari invoice"
            placeholder="Cari nomor atau company"
            icon={<Search size={14} />}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            containerClassName="w-full sm:w-72"
          />
        </div>

        {list.isError ? (
          <p role="alert" className="py-8 text-center text-sm text-merah">
            {list.error.message}
          </p>
        ) : (
          <InvoiceTableOS
            rows={rows}
            isLoading={list.isLoading}
            onOpen={(invoice) => setFormTarget({ mode: "edit", invoice })}
            empty={
              keyword || status !== "all" ? (
                <p className="text-sm text-gray-500 dark:text-zinc-400">Tidak ada invoice yang cocok dengan filter ini.</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-700 dark:text-zinc-200">Belum ada invoice</p>
                  <p className="max-w-sm text-sm text-gray-500 dark:text-zinc-400">Pilih pipeline yang sudah closed won, lalu tagih per termin sesuai persentase dari nilai deal.</p>
                  <AppButton size="sm" className="mt-2" onClick={() => setFormTarget({ mode: "create" })}>
                    <Plus size={14} />
                    Invoice baru
                  </AppButton>
                </>
              )
            }
          />
        )}

        {meta && meta.total_data > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 dark:text-zinc-400">
            <p>
              {meta.total_data} invoice · nilai di halaman ini {getRupiahCurrency(rows.reduce((sum, row) => sum + row.amount, 0))}
            </p>
            {meta.total_page > 1 && (
              <div className="flex items-center gap-2">
                <AppButton type="button" variant="outline" size="iconSm" aria-label="Halaman sebelumnya" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft size={14} />
                </AppButton>
                <span className="tabular-nums">
                  {meta.current_page} / {meta.total_page}
                </span>
                <AppButton type="button" variant="outline" size="iconSm" aria-label="Halaman berikutnya" disabled={page >= meta.total_page} onClick={() => setPage(page + 1)}>
                  <ChevronRight size={14} />
                </AppButton>
              </div>
            )}
          </div>
        )}
      </div>

      {activeTarget && (
        <InvoiceFormOS
          key={activeTarget.mode === "edit" ? `edit-${activeTarget.invoice.id}` : "create"}
          invoice={activeTarget.mode === "edit" ? activeTarget.invoice : undefined}
          onClose={closeForm}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
