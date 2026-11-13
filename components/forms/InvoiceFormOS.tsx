"use client";

import type { Invoice, InvoiceBilling } from "@/apis/invoices";
import AppButton from "@/components/buttons/AppButton";
import CompanyLogoOS from "@/components/elements/CompanyLogoOS";
import AppInput from "@/components/fields/AppInput";
import AppNumberInput from "@/components/fields/AppNumberInput";
import AppSearchableSelect, { type AppSearchableOption } from "@/components/fields/AppSearchableSelect";
import AppTextArea from "@/components/fields/AppTextArea";
import InvoiceStatusLabel from "@/components/labels/InvoiceStatusLabel";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import SheetOS from "@/components/modals/SheetOS";
import { createInvoice, deleteInvoice, getInvoiceBilling, listPipelines, updateInvoice } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { getRupiahCurrency } from "@/lib/currency";
import { formatPercentage, invoiceAmount, suggestInvoiceNumber } from "@/lib/invoices";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Loader2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

const PICKER_PAGE_SIZE = 10;
const PERCENT_PRESETS = [30, 50, 70, 100];

type Errors = Partial<Record<"pipeline" | "term" | "number" | "percentage" | "due" | "paid", string>>;

function numberOr(value: string, fallback = 0) {
  const parsed = Number(value);
  return value.trim() === "" || Number.isNaN(parsed) ? fallback : parsed;
}

function CompanyCard({ billing, invoice }: { billing: InvoiceBilling | undefined; invoice?: Invoice }) {
  const source = billing ?? invoice;
  if (!source) return null;
  const contact = source.contact;
  return (
    <div className="rounded-xl border border-line bg-gray-50/60 p-4 dark:bg-zinc-900/40">
      <div className="flex items-center gap-3">
        <CompanyLogoOS name={source.company_name} imageUrl={source.company_image_url} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-zinc-100">{source.company_name}</p>
          <p className="truncate text-xs text-gray-500 dark:text-zinc-400">
            {source.company_legal_identifier ? `Identitas legal ${source.company_legal_identifier}` : "Identitas legal belum diisi di Company"}
          </p>
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <dt className="text-gray-500 dark:text-zinc-400">Kontak utama</dt>
          <dd className="truncate text-gray-800 dark:text-zinc-200">{contact ? `${contact.full_name}${contact.job_title ? `, ${contact.job_title}` : ""}` : "—"}</dd>
        </div>
        <div>
          <dt className="text-gray-500 dark:text-zinc-400">Sales owner</dt>
          <dd className="truncate text-gray-800 dark:text-zinc-200">{source.sales_owner.full_name}</dd>
        </div>
        {billing && (
          <>
            <div>
              <dt className="text-gray-500 dark:text-zinc-400">Nilai deal</dt>
              <dd className="font-semibold tabular-nums text-gray-900 dark:text-zinc-100">{getRupiahCurrency(billing.value)}</dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-zinc-400">Sudah di-invoice</dt>
              <dd className="tabular-nums text-gray-800 dark:text-zinc-200">
                {formatPercentage(billing.invoiced_percentage)} · {billing.invoices.length} termin
              </dd>
            </div>
          </>
        )}
      </dl>
      <p className="mt-3 text-xs text-gray-500 dark:text-zinc-400">Nama PT, identitas legal, dan kontak diambil dari Company pipeline ini. Ubah di Company Contact kalau ada yang salah.</p>
    </div>
  );
}

// Create or edit one invoice term; the client's company always comes from the chosen pipeline.
export default function InvoiceFormOS({
  invoice,
  onClose,
  onSaved,
}: {
  invoice?: Invoice;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const today = dayjs().format("YYYY-MM-DD");
  const [pipelineOption, setPipelineOption] = useState<AppSearchableOption | null>(null);
  const pipelineId = invoice?.pipeline_id ?? (pipelineOption ? Number(pipelineOption.value) : null);

  const [term, setTerm] = useState(invoice ? String(invoice.term) : "");
  const [number, setNumber] = useState(invoice?.number ?? "");
  const [percentage, setPercentage] = useState(invoice ? String(invoice.percentage) : "");
  const [bastDate, setBastDate] = useState(invoice?.bast_date ?? "");
  const [invoiceDate, setInvoiceDate] = useState(invoice?.invoice_date ?? "");
  const [dueDate, setDueDate] = useState(invoice?.due_date ?? "");
  const [paidAmount, setPaidAmount] = useState(invoice && invoice.paid_amount > 0 ? String(invoice.paid_amount) : "");
  const [paidDate, setPaidDate] = useState(invoice?.paid_date ?? "");
  const [notes, setNotes] = useState(invoice?.notes ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const prefilledFor = useRef<number | null>(invoice?.pipeline_id ?? null);

  const billing = useQuery({
    queryKey: ["invoices", "billing", pipelineId],
    queryFn: async () => requireApiData(await getInvoiceBilling(pipelineId!)),
    enabled: pipelineId !== null,
  });

  // A newly picked pipeline proposes its next term, the share still unbilled, and a default number.
  useEffect(() => {
    const data = billing.data;
    if (invoice || !data || prefilledFor.current === data.pipeline_id) return;
    prefilledFor.current = data.pipeline_id;
    setTerm(String(data.next_term));
    setPercentage(data.remaining_percentage > 0 ? String(data.remaining_percentage) : "");
    setNumber(suggestInvoiceNumber(data.pipeline_id, data.next_term, today));
  }, [billing.data, invoice, today]);

  // A draft follows the deal value; an issued invoice keeps the base it was issued with.
  const base = invoice?.invoice_date ? invoice.base_amount : (billing.data?.value ?? invoice?.base_amount ?? 0);
  const othersPercentage = Math.max(0, (billing.data?.invoiced_percentage ?? 0) - (invoice?.percentage ?? 0));
  const available = Math.round((100 - othersPercentage) * 100) / 100;
  const amount = invoiceAmount(base, numberOr(percentage));
  const notWon = !invoice && billing.data && billing.data.pipeline_stage !== "closed_won";

  async function loadPipelineOptions(keyword: string, page: number) {
    const result = requireApiData(await listPipelines({ phase: "bdr", stage: "closed_won", keyword: keyword.trim() || undefined, page, page_size: PICKER_PAGE_SIZE }));
    return {
      options: result.list.map((pipeline) => ({ value: pipeline.id, label: pipeline.company_name })),
      hasMore: result.metapaging.current_page < result.metapaging.total_page,
    };
  }

  const save = useMutation({
    mutationFn: async () => {
      const fields = {
        term: numberOr(term, 0) || undefined,
        number: number.trim(),
        percentage: numberOr(percentage),
        bast_date: bastDate || null,
        invoice_date: invoiceDate || null,
        due_date: dueDate || null,
        paid_amount: numberOr(paidAmount),
        paid_date: paidDate || null,
        notes: notes.trim() || null,
      };
      return requireApiData(invoice ? await updateInvoice({ ...fields, id: invoice.id }) : await createInvoice({ ...fields, pipeline_id: pipelineId! }));
    },
    onSuccess: async (saved) => {
      showSuccessToast(invoice ? `Invoice ${saved.number} disimpan` : `Invoice ${saved.number} dibuat`);
      await onSaved();
      onClose();
    },
    onError: (error) => showErrorToast(error),
  });

  const remove = useMutation({
    mutationFn: async () => requireApiData(await deleteInvoice(invoice!.id)),
    onSuccess: async () => {
      showSuccessToast(`Invoice ${invoice!.number} dihapus`);
      await onSaved();
      onClose();
    },
    onError: (error) => showErrorToast(error),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const pct = numberOr(percentage, NaN);
    const termValue = numberOr(term, 0);
    const paid = numberOr(paidAmount);
    const next: Errors = {};
    if (!invoice && pipelineId === null) next.pipeline = "Pilih pipeline yang sudah closed won.";
    if (term.trim() && (!Number.isInteger(termValue) || termValue < 1 || termValue > 99)) next.term = "Termin 1 sampai 99.";
    if (!number.trim()) next.number = "Nomor invoice wajib diisi.";
    if (Number.isNaN(pct) || pct <= 0 || pct > 100) next.percentage = "Isi persentase lebih dari 0 sampai 100.";
    else if (billing.data && pct > available) next.percentage = `Sisa yang bisa ditagih ${formatPercentage(available)} dari nilai deal.`;
    if (dueDate && invoiceDate && dueDate < invoiceDate) next.due = "Jatuh tempo tidak boleh sebelum tanggal invoice.";
    if ((paid > 0) !== !!paidDate) next.paid = "Isi jumlah dan tanggal bayar bersamaan.";
    else if (paidDate && !invoiceDate) next.paid = "Isi tanggal invoice dulu sebelum mencatat pembayaran.";
    else if (paidDate && invoiceDate && paidDate < invoiceDate) next.paid = "Tanggal bayar tidak boleh sebelum tanggal invoice.";
    else if (paid > amount) next.paid = `Pembayaran melebihi nilai invoice (${getRupiahCurrency(amount)}).`;
    setErrors(next);
    if (Object.keys(next).length > 0 || notWon) return;
    save.mutate();
  }

  const busy = save.isPending || remove.isPending;

  return (
    <SheetOS
      title={invoice ? `Invoice ${invoice.number}` : "Invoice baru"}
      description="Satu invoice adalah satu termin dari pipeline yang sudah closed won, sebesar persentase dari nilai deal."
      isOpen
      onClose={onClose}
      wide
    >
      <form noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {invoice ? (
            <div className="flex flex-wrap items-center gap-2">
              <InvoiceStatusLabel status={invoice.status} />
              <span className="text-xs text-gray-500 dark:text-zinc-400">Termin {invoice.term} · pipeline #{invoice.pipeline_id}</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              <AppSearchableSelect
                selectId="invoice-pipeline"
                label="Pipeline (closed won)"
                placeholder="Ketik nama company"
                value={pipelineOption}
                onChange={(option) => {
                  setPipelineOption(option);
                  setErrors((current) => ({ ...current, pipeline: undefined }));
                }}
                loadOptions={loadPipelineOptions}
                debounceMs={300}
                required
                disabled={busy}
                noOptionsMessage="Tidak ada pipeline closed won yang cocok."
              />
              {errors.pipeline && <p className="text-xs text-merah">{errors.pipeline}</p>}
            </div>
          )}

          {billing.isLoading && pipelineId !== null && (
            <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
              <Loader2 size={14} className="animate-spin" /> Memuat data company dan nilai deal...
            </p>
          )}
          {billing.isError && <p className="text-sm text-merah">{billing.error.message}</p>}
          {(billing.data || invoice) && <CompanyCard billing={billing.data} invoice={invoice} />}
          {notWon && <p className="text-sm text-merah">Pipeline ini belum closed won, jadi belum bisa dibuatkan invoice.</p>}

          <fieldset className="space-y-4" disabled={busy}>
            <legend className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Termin dan nilai</legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[7rem_1fr]">
              <AppNumberInput inputId="invoice-term" label="Termin ke" mode="numeric" value={term} onValueChange={setTerm} placeholder="1" errorMessage={errors.term} />
              <AppInput
                inputId="invoice-number"
                label="Nomor invoice"
                value={number}
                onChange={(event) => setNumber(event.target.value)}
                placeholder="INV/2026/11/001"
                characterLength={50}
                errorMessage={errors.number}
                required
              />
            </div>
            <div className="space-y-2">
              <AppNumberInput
                inputId="invoice-percentage"
                label="Persentase dari nilai deal"
                mode="decimal"
                value={percentage}
                onValueChange={setPercentage}
                placeholder="50"
                errorMessage={errors.percentage}
                required
              />
              <div className="flex flex-wrap gap-1.5">
                {PERCENT_PRESETS.filter((preset) => preset <= available).map((preset) => (
                  <AppButton key={preset} type="button" variant="outline" size="pill" onClick={() => setPercentage(String(preset))}>
                    {preset}%
                  </AppButton>
                ))}
                {billing.data && available > 0 && !PERCENT_PRESETS.includes(available) && (
                  <AppButton type="button" variant="outline" size="pill" onClick={() => setPercentage(String(available))}>
                    Sisa {formatPercentage(available)}
                  </AppButton>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-zinc-300">
                Nilai invoice <span className="font-semibold tabular-nums text-gray-900 dark:text-zinc-100">{getRupiahCurrency(amount)}</span>
                <span className="text-xs text-gray-500 dark:text-zinc-400"> = {formatPercentage(numberOr(percentage))} × {getRupiahCurrency(base)}</span>
              </p>
              {invoice?.invoice_date && (
                <p className="text-xs text-gray-500 dark:text-zinc-400">Invoice sudah terbit, jadi dasar nilainya dikunci di {getRupiahCurrency(invoice.base_amount)} walaupun nilai deal berubah.</p>
              )}
            </div>
          </fieldset>

          <fieldset className="space-y-4" disabled={busy}>
            <legend className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Tanggal</legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <AppInput inputId="invoice-bast-date" label="Tanggal BAST" type="date" value={bastDate} onChange={(event) => setBastDate(event.target.value)} />
              <AppInput inputId="invoice-date" label="Tanggal invoice" type="date" value={invoiceDate} onChange={(event) => setInvoiceDate(event.target.value)} />
              <AppInput inputId="invoice-due-date" label="Jatuh tempo" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} errorMessage={errors.due} />
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400">Tanpa tanggal invoice, invoice tetap draft dan belum dihitung sebagai tagihan.</p>
          </fieldset>

          <fieldset className="space-y-4" disabled={busy}>
            <legend className="text-sm font-semibold text-gray-900 dark:text-zinc-100">Pembayaran</legend>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <AppNumberInput inputId="invoice-paid-amount" label="Total diterima (Rp)" mode="decimal" value={paidAmount} onValueChange={setPaidAmount} placeholder="0" errorMessage={errors.paid} />
              <AppInput inputId="invoice-paid-date" label="Tanggal pembayaran terakhir" type="date" value={paidDate} onChange={(event) => setPaidDate(event.target.value)} />
            </div>
            <AppButton
              type="button"
              variant="outline"
              size="sm"
              disabled={amount <= 0}
              onClick={() => {
                setPaidAmount(String(amount));
                setPaidDate(paidDate || today);
                if (!invoiceDate) setInvoiceDate(today);
              }}
            >
              Tandai lunas
            </AppButton>
          </fieldset>

          <AppTextArea textAreaId="invoice-notes" label="Catatan" value={notes} onChange={(event) => setNotes(event.target.value)} characterLength={5000} rows={3} disabled={busy} />
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-line-soft px-6 py-4">
          <div>
            {invoice && invoice.paid_amount === 0 && (
              <AppButton type="button" variant="dangerGhost" size="sm" onClick={() => setConfirmDelete(true)} disabled={busy}>
                <Trash2 size={14} /> Hapus
              </AppButton>
            )}
          </div>
          <div className="flex gap-2">
            <AppButton type="button" variant="outline" size="sm" onClick={onClose} disabled={busy}>
              Batal
            </AppButton>
            <AppButton type="submit" size="sm" disabled={busy || !!notWon}>
              {save.isPending && <Loader2 size={14} className="animate-spin" />}
              {invoice ? "Simpan" : "Buat invoice"}
            </AppButton>
          </div>
        </div>
      </form>

      <AlertConfirmationOS
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => remove.mutate()}
        title="Hapus invoice?"
        message={`Invoice ${invoice?.number ?? ""} akan dihapus permanen. Invoice yang sudah ada pembayarannya tidak bisa dihapus.`}
        confirmLabel="Hapus"
        destructive
        isPending={remove.isPending}
      />
    </SheetOS>
  );
}
