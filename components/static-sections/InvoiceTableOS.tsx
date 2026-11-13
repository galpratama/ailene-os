"use client";

import type { Invoice } from "@/apis/invoices";
import AppButton from "@/components/buttons/AppButton";
import CompanyLogoOS from "@/components/elements/CompanyLogoOS";
import InvoiceStatusLabel from "@/components/labels/InvoiceStatusLabel";
import { getRupiahCurrency, getShortRupiahCurrency } from "@/lib/currency";
import { formatPercentage } from "@/lib/invoices";
import dayjs from "dayjs";
import { Pencil, Receipt } from "lucide-react";
import type { ReactNode } from "react";

function day(value: string | null) {
  return value ? dayjs(value).format("D MMM YYYY") : "—";
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <tr key={i} className="border-b border-line-soft last:border-0">
          {Array.from({ length: 6 }, (_, j) => (
            <td key={j} className="px-4 py-4">
              <span className="block h-4 animate-pulse rounded-md bg-line-soft motion-reduce:animate-none" style={{ width: `${55 + ((i + j) % 4) * 12}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function InvoiceTableOS({
  rows,
  isLoading,
  onOpen,
  empty,
}: {
  rows: Invoice[];
  isLoading: boolean;
  onOpen: (invoice: Invoice) => void;
  empty: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card-bg">
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-230 text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
              <th scope="col" className="px-3.5 py-3">Invoice</th>
              <th scope="col" className="px-3.5 py-3">Company</th>
              <th scope="col" className="px-3.5 py-3">Status</th>
              <th scope="col" className="px-3.5 py-3 text-right">Nilai</th>
              <th scope="col" className="px-3.5 py-3 text-right">Sisa tagihan</th>
              <th scope="col" className="px-3.5 py-3">Tanggal</th>
              <th scope="col" className="px-3.5 py-3">
                <span className="sr-only">Aksi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows />
            ) : (
              rows.map((row) => (
                <tr key={row.id} onClick={() => onOpen(row)} className="cursor-pointer border-b border-line-soft transition-colors last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                  <td className="px-3.5 py-3.5 align-top">
                    <p className="font-semibold tabular-nums text-gray-900 dark:text-zinc-100">{row.number}</p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">Termin {row.term}</p>
                  </td>
                  <td className="px-3.5 py-3.5 align-top">
                    <div className="flex items-center gap-3">
                      <CompanyLogoOS name={row.company_name} imageUrl={row.company_image_url} size="sm" />
                      <div className="min-w-0">
                        <p className="max-w-56 truncate font-medium text-gray-900 dark:text-zinc-100">{row.company_name}</p>
                        <p className="max-w-56 truncate text-xs text-gray-500 dark:text-zinc-400">{row.contact?.full_name ?? row.sales_owner.full_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 py-3.5 align-top">
                    <InvoiceStatusLabel status={row.status} />
                  </td>
                  <td className="px-3.5 py-3.5 text-right align-top">
                    <p className="font-semibold tabular-nums text-gray-900 dark:text-zinc-100">{getRupiahCurrency(row.amount)}</p>
                    <p className="text-xs tabular-nums text-gray-500 dark:text-zinc-400">
                      {formatPercentage(row.percentage)} dari {getShortRupiahCurrency(row.base_amount)}
                    </p>
                  </td>
                  <td className="px-3.5 py-3.5 text-right align-top">
                    <p className={`tabular-nums ${row.outstanding > 0 && row.status !== "draft" ? "font-semibold text-gray-900 dark:text-zinc-100" : "text-gray-500 dark:text-zinc-400"}`}>
                      {row.status === "draft" ? "—" : getRupiahCurrency(row.outstanding)}
                    </p>
                    {row.paid_amount > 0 && <p className="text-xs tabular-nums text-gray-500 dark:text-zinc-400">Diterima {getShortRupiahCurrency(row.paid_amount)}</p>}
                  </td>
                  <td className="whitespace-nowrap px-3.5 py-3.5 align-top text-xs text-gray-600 dark:text-zinc-300">
                    <p>Invoice {day(row.invoice_date)}</p>
                    <p className={row.status === "overdue" ? "text-merah" : "text-gray-500 dark:text-zinc-400"}>Jatuh tempo {day(row.due_date)}</p>
                  </td>
                  <td className="px-3.5 py-3.5 align-top" onClick={(event) => event.stopPropagation()}>
                    <AppButton type="button" variant="secondary" size="icon" aria-label={`Edit invoice ${row.number}`} title="Edit invoice" onClick={() => onOpen(row)}>
                      <Pencil size={15} />
                    </AppButton>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!isLoading && rows.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
            <Receipt size={22} className="text-gray-300 dark:text-zinc-600" aria-hidden="true" />
            {empty}
          </div>
        )}
      </div>
    </div>
  );
}
