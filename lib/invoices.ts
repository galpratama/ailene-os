import type { InvoiceStatus } from "@/apis/invoices";

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  draft: "Draft",
  issued: "Terbit",
  partially_paid: "Dibayar sebagian",
  overdue: "Lewat jatuh tempo",
  paid: "Lunas",
};

export const invoiceStatusTabs: { key: InvoiceStatus | "all"; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "draft", label: invoiceStatusLabels.draft },
  { key: "issued", label: invoiceStatusLabels.issued },
  { key: "partially_paid", label: invoiceStatusLabels.partially_paid },
  { key: "overdue", label: invoiceStatusLabels.overdue },
  { key: "paid", label: invoiceStatusLabels.paid },
];

// Preview of the API's amount: base × percentage ÷ 100, rounded half-up to cents.
export function invoiceAmount(base: number, percentage: number) {
  return Math.round(base * percentage) / 100;
}

// Default number for a new term, e.g. INV/2026/11/812-1; staff can overwrite it with finance's own numbering.
export function suggestInvoiceNumber(pipelineId: number, term: number, today: string) {
  return `INV/${today.slice(0, 4)}/${today.slice(5, 7)}/${pipelineId}-${term}`;
}

// Percentages are shown the way finance writes them: 50%, 33,33%.
export function formatPercentage(value: number) {
  return `${value.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%`;
}
