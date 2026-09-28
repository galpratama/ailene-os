import "server-only";

import { callApi, type ApiEnvelope, type ApiList } from "./api";
import { getSessionToken } from "./session";

export type QuotationStatus =
  | "draft"
  | "manager_review"
  | "needs_revision"
  | "approved"
  | "sent"
  | "accepted"
  | "rejected"
  | "expired";
export type QuotationSourceType = "package" | "custom";
export type QuotationPackage = "foundation" | "intensive" | "sprint";
export type QuotationMateriLevel = "std" | "ringan" | "dalam";
export type QuotationSessionFormat = "offline" | "online";
export type QuotationTrainerTier = "certified" | "specialist" | "lead";
export type QuotationApprovalDecision = "approved" | "rejected" | "needs_revision";
export type QuotationOutcomeStatus = "sent" | "accepted" | "rejected" | "expired";

// margin_pct and the other cost figures are null for anyone but an administrator.
export type QuotationListItem = {
  id: number;
  pipeline_id: number;
  company_id: number;
  company_name: string;
  version: number;
  is_current: boolean;
  status: QuotationStatus;
  source_type: QuotationSourceType;
  package_type: QuotationPackage | null;
  net_value: number;
  invoice_amount: number;
  margin_pct: number | null;
  requires_review: boolean;
  created_by_id: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
};

export type QuotationLineItem = {
  id: number;
  order_index: number;
  format: QuotationSessionFormat;
  sesi: number;
  peserta: number;
  trainer: QuotationTrainerTier;
};

export type QuotationApproval = {
  id: number;
  decision: QuotationApprovalDecision;
  reason: string | null;
  actor_id: string;
  actor_name: string;
  created_at: string;
};

export type QuotationDetails = Omit<QuotationListItem, "margin_pct"> & {
  materi: QuotationMateriLevel;
  bd_pct: number;
  dc_pct: number;
  addon_assessment: boolean;
  addon_klinik: boolean;
  addon_klinik_sesi: number;
  addon_rekaman: boolean;
  addon_sertifikat: boolean;
  addon_sertifikat_qty: number;
  addon_perjalanan: boolean;
  addon_perjalanan_rp: number;
  subtotal: number;
  discount: number;
  pph_tax: number;
  trainer_cost: number | null;
  addons_cost: number | null;
  bd_fee: number | null;
  ops_fee: number | null;
  amo_fee: number | null;
  total_cost: number | null;
  net_profit: number | null;
  margin_pct: number | null;
  line_items: QuotationLineItem[];
  approvals: QuotationApproval[];
};

export type QuotationSummary = {
  total: number;
  list: QuotationListItem[];
};

export type ListQuotationsOptions = {
  pipeline_id?: number;
  status?: QuotationStatus;
  page?: number;
  page_size?: number;
};

// Pricing inputs only; the API computes every money figure and requires_review itself.
export type QuotationPricingPayload = {
  source_type: QuotationSourceType;
  package_type?: QuotationPackage | null;
  materi: QuotationMateriLevel;
  bd_pct: number;
  dc_pct: number;
  addon_assessment: boolean;
  addon_klinik: boolean;
  addon_klinik_sesi: number;
  addon_rekaman: boolean;
  addon_sertifikat: boolean;
  addon_sertifikat_qty: number;
  addon_perjalanan: boolean;
  addon_perjalanan_rp: number;
  days: {
    format: QuotationSessionFormat;
    sesi: number;
    peserta: number;
    trainer: QuotationTrainerTier;
  }[];
};

export type CreateQuotationPayload = QuotationPricingPayload & { pipeline_id: number };
export type UpdateQuotationPayload = QuotationPricingPayload & { id: number };

export type DecideQuotationPayload = {
  id: number;
  decision: QuotationApprovalDecision;
  reason?: string;
};

async function token() {
  return getSessionToken();
}

export async function listQuotations(
  options: ListQuotationsOptions = {}
): Promise<ApiEnvelope<ApiList<QuotationListItem>>> {
  return callApi("/api/v1/quotations", {
    token: await token(),
    body: options,
  });
}

export async function getQuotationSummary(): Promise<ApiEnvelope<QuotationSummary>> {
  return callApi("/api/v1/quotations/summary", {
    token: await token(),
  });
}

export async function getQuotationDetails(
  id: number
): Promise<ApiEnvelope<QuotationDetails>> {
  return callApi("/api/v1/quotations/details", {
    token: await token(),
    body: { id },
  });
}

export async function createQuotation(
  payload: CreateQuotationPayload
): Promise<ApiEnvelope<QuotationDetails>> {
  return callApi("/api/v1/quotations/create", {
    token: await token(),
    body: payload,
  });
}

export async function updateQuotation(
  payload: UpdateQuotationPayload
): Promise<ApiEnvelope<QuotationDetails>> {
  return callApi("/api/v1/quotations/update", {
    token: await token(),
    body: payload,
  });
}

export async function submitQuotation(
  id: number
): Promise<ApiEnvelope<QuotationDetails>> {
  return callApi("/api/v1/quotations/submit", {
    token: await token(),
    body: { id },
  });
}

export async function decideQuotation(
  payload: DecideQuotationPayload
): Promise<ApiEnvelope<QuotationDetails>> {
  return callApi("/api/v1/quotations/decide", {
    token: await token(),
    body: payload,
  });
}

export async function updateQuotationOutcome(payload: {
  id: number;
  status: QuotationOutcomeStatus;
}): Promise<ApiEnvelope<QuotationDetails>> {
  return callApi("/api/v1/quotations/update-outcome", {
    token: await token(),
    body: payload,
  });
}
