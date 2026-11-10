"use client";

import type { QuotationListItem } from "@/apis/quotations";
import AppButton from "@/components/buttons/AppButton";
import CompanyLogoOS from "@/components/elements/CompanyLogoOS";
import QuotationMarginMeterOS from "@/components/elements/QuotationMarginMeterOS";
import TaskAssigneeAvatarOS from "@/components/elements/TaskAssigneeAvatarOS";
import QuotationStatusLabel from "@/components/labels/QuotationStatusLabel";
import type { useQuotationPdf } from "@/hooks/useQuotationPdf";
import { getRupiahCurrency, getShortRupiahCurrency } from "@/lib/currency";
import { formatQuotationNumber } from "@/lib/quotation-number";
import { quotationDaysLeft, relativeDays } from "@/lib/quotations";
import dayjs from "dayjs";
import { ArrowDown, ArrowUp, Download, Eye, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";

type SortKey = "date" | "value" | "margin";

const packageLabels: Record<string, string> = { foundation: "Foundation", intensive: "Intensive", sprint: "Sprint" };

function sortValue(row: QuotationListItem, key: SortKey) {
  if (key === "value") return Number(row.net_value);
  if (key === "margin") return row.margin_pct === null ? -Infinity : Number(row.margin_pct);
  return dayjs(row.created_at).valueOf();
}

function SortHeader({ label, sortKey, sort, onSort, align = "left" }: { label: string; sortKey: SortKey; sort: { key: SortKey; desc: boolean }; onSort: (key: SortKey) => void; align?: "left" | "right" }) {
  const active = sort.key === sortKey;
  const Arrow = active && !sort.desc ? ArrowUp : ArrowDown;
  return (
    <th scope="col" aria-sort={active ? (sort.desc ? "descending" : "ascending") : "none"} className={`px-3.5 py-3 ${align === "right" ? "text-right" : ""}`}>
      <AppButton type="button" variant={active ? "sortActive" : "sort"} size="sort" onClick={() => onSort(sortKey)} className={align === "right" ? "ml-auto" : ""}>
        {label}
        <Arrow size={12} className={active ? "" : "opacity-40"} aria-hidden="true" />
      </AppButton>
    </th>
  );
}

function StatusCell({ row }: { row: QuotationListItem }) {
  let note: ReactNode = null;
  if (row.status === "approved" && row.is_current) {
    const left = quotationDaysLeft(row);
    note = left < 0 ? "Masa berlaku habis" : left === 0 ? <span className="text-oranye">Berlaku sampai hari ini</span> : `Berlaku ${left} hari lagi`;
  } else if (row.status === "manager_review") {
    note = `Diajukan ${relativeDays(row.updated_at)}`;
  }
  return (
    <div className="flex flex-col items-start gap-1">
      <QuotationStatusLabel status={row.status} />
      {note && <span className="whitespace-nowrap text-xs text-gray-500 dark:text-zinc-400">{note}</span>}
    </div>
  );
}

function SkeletonRows({ columns }: { columns: number }) {
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <tr key={i} className="border-b border-line-soft last:border-0">
          {Array.from({ length: columns }, (_, j) => (
            <td key={j} className="px-4 py-4">
              <span className="block h-4 animate-pulse rounded-md bg-line-soft motion-reduce:animate-none" style={{ width: `${55 + ((i + j) % 4) * 12}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function QuotationTableOS({
  rows,
  isLoading,
  canViewMargin,
  pdf,
  empty,
}: {
  rows: QuotationListItem[];
  isLoading: boolean;
  canViewMargin: boolean;
  pdf: ReturnType<typeof useQuotationPdf>;
  empty: ReactNode;
}) {
  const router = useRouter();
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "date", desc: true });
  const sorted = [...rows].sort((a, b) => (sortValue(a, sort.key) - sortValue(b, sort.key)) * (sort.desc ? -1 : 1));
  const columns = canViewMargin ? 7 : 6;

  function onSort(key: SortKey) {
    setSort((current) => (current.key === key ? { key, desc: !current.desc } : { key, desc: true }));
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card-bg">
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-230 text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
              <SortHeader label="Quotation" sortKey="date" sort={sort} onSort={onSort} />
              <th scope="col" className="px-3.5 py-3">Company</th>
              <th scope="col" className="px-3.5 py-3">Status</th>
              <SortHeader label="Nilai" sortKey="value" sort={sort} onSort={onSort} align="right" />
              {canViewMargin && <SortHeader label="Margin" sortKey="margin" sort={sort} onSort={onSort} />}
              <th scope="col" className="px-3.5 py-3">Dibuat oleh</th>
              <th scope="col" className="px-3.5 py-3">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows columns={columns} />
            ) : (
              sorted.map((row) => {
                const number = formatQuotationNumber(row);
                const href = `/quotations/${row.id}`;
                return (
                  <tr
                    key={row.id}
                    onClick={() => router.push(href)}
                    className={`cursor-pointer border-b border-line-soft transition-colors last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50 ${row.is_current ? "" : "opacity-60"}`}
                  >
                    <td className="px-3.5 py-3.5 align-top">
                      <Link href={href} onClick={(event) => event.stopPropagation()} className="font-semibold tabular-nums text-gray-900 hover:text-claude hover:underline focus-visible:outline-2 focus-visible:outline-claude dark:text-zinc-100">
                        {number}
                      </Link>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
                        {dayjs(row.created_at).format("D MMM YYYY")}
                        {!row.is_current && <span className="rounded-full border border-line px-1.5 text-[11px]">Versi lama</span>}
                      </p>
                    </td>
                    <td className="px-3.5 py-3.5 align-top">
                      <div className="flex items-center gap-3">
                        <CompanyLogoOS name={row.company_name} imageUrl={row.company_image_url} size="sm" />
                        <div className="min-w-0">
                          <p className="max-w-56 truncate font-medium text-gray-900 dark:text-zinc-100">{row.company_name}</p>
                          <p className="text-xs text-gray-500 dark:text-zinc-400">
                            {row.source_type === "custom" ? "Custom" : `Package ${packageLabels[row.package_type ?? ""] ?? ""}`.trim()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3.5 align-top">
                      <StatusCell row={row} />
                    </td>
                    <td className="px-3.5 py-3.5 text-right align-top">
                      <p className="font-semibold tabular-nums text-gray-900 dark:text-zinc-100">{getRupiahCurrency(Number(row.net_value))}</p>
                      <p className="text-xs tabular-nums text-gray-500 dark:text-zinc-400">Invoice {getShortRupiahCurrency(Number(row.invoice_amount))}</p>
                    </td>
                    {canViewMargin && (
                      <td className="px-3.5 py-3.5 align-top">
                        <QuotationMarginMeterOS margin={row.margin_pct === null ? null : Number(row.margin_pct)} compact />
                      </td>
                    )}
                    <td className="px-3.5 py-3.5 align-top">
                      <div className="flex items-center gap-2.5">
                        <TaskAssigneeAvatarOS name={row.created_by_name} avatar={row.created_by_avatar ?? null} colorKey={row.created_by_id} size="md" />
                        <div className="min-w-0">
                          <p className="max-w-40 truncate text-gray-800 dark:text-zinc-200">{row.created_by_name}</p>
                          <p className="text-xs text-gray-500 dark:text-zinc-400">{relativeDays(row.created_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3.5 align-top" onClick={(event) => event.stopPropagation()}>
                      <div className="flex items-center justify-end gap-0.5">
                        <AppButton type="button" variant="secondary" size="icon" aria-label={`Lihat PDF ${number}`} title="Lihat PDF" disabled={pdf.isBusy(row.id, "view")} onClick={() => pdf.view(row.id)}>
                          {pdf.isBusy(row.id, "view") ? <Loader2 size={15} className="animate-spin" /> : <Eye size={15} />}
                        </AppButton>
                        <AppButton type="button" variant="secondary" size="icon" aria-label={`Unduh PDF ${number}`} title="Unduh PDF" disabled={pdf.isBusy(row.id, "download")} onClick={() => pdf.download(row.id)}>
                          {pdf.isBusy(row.id, "download") ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                        </AppButton>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {!isLoading && rows.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
            <FileText size={22} className="text-gray-300 dark:text-zinc-600" aria-hidden="true" />
            {empty}
          </div>
        )}
      </div>
    </div>
  );
}
