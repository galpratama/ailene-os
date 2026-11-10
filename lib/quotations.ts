import type { QuotationListItem, QuotationStatus } from "@/apis/quotations";
import dayjs from "dayjs";

// An approved quotation's PDF promises this many days of validity from its quotation date.
export const QUOTATION_VALID_DAYS = 14;

export type QuotationTab = "all" | QuotationStatus;

export const quotationTabs: { key: QuotationTab; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "draft", label: "Draft" },
  { key: "manager_review", label: "Manager review" },
  { key: "needs_revision", label: "Needs revision" },
  { key: "approved", label: "Approved" },
];

export function inQuotationTab(status: QuotationStatus, tab: QuotationTab) {
  return tab === "all" || status === tab;
}

export function quotationValidUntil(quotation: { created_at: string }) {
  return dayjs(quotation.created_at).add(QUOTATION_VALID_DAYS, "day");
}

// Whole days left on a quotation's validity; negative once it has lapsed.
export function quotationDaysLeft(quotation: { created_at: string }) {
  return quotationValidUntil(quotation).startOf("day").diff(dayjs().startOf("day"), "day");
}

export function relativeDays(value: string) {
  const days = dayjs().startOf("day").diff(dayjs(value).startOf("day"), "day");
  if (days <= 0) return "hari ini";
  if (days === 1) return "kemarin";
  if (days < 30) return `${days} hari lalu`;
  return dayjs(value).format("D MMM YYYY");
}

// Headline figures over current versions only, so a revised quotation is never counted twice.
export function quotationStats(quotations: QuotationListItem[]) {
  const current = quotations.filter((row) => row.is_current);
  const of = (status: QuotationStatus) => {
    const rows = current.filter((row) => row.status === status);
    return { count: rows.length, value: rows.reduce((total, row) => total + Number(row.net_value), 0) };
  };
  return { draft: of("draft"), review: of("manager_review"), revision: of("needs_revision"), approved: of("approved") };
}
