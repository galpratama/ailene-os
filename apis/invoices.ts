import "server-only";

import { callApi, type ApiEnvelope, type ApiList } from "./api";
import { getSessionToken } from "./session";

// Invoices bill a closed-won pipeline in terms: `ailene-os-apis/docs/api/invoices.md`.

// Derived by the API from the dates and payment; never sent.
export type InvoiceStatus = "draft" | "issued" | "partially_paid" | "overdue" | "paid";

export type InvoicePerson = { id: string; full_name: string };

export type InvoiceContact = {
  full_name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
};

// The company (PT name, legal identifier, contact) always comes from the pipeline, never from the invoice.
export type InvoiceCompany = {
  pipeline_id: number;
  pipeline_stage: string;
  company_id: number;
  company_name: string;
  company_legal_identifier: string | null;
  company_image_url: string | null;
  contact: InvoiceContact | null;
  sales_owner: InvoicePerson;
};

export type Invoice = InvoiceCompany & {
  id: number;
  term: number;
  number: string;
  percentage: number;
  base_amount: number;
  amount: number;
  paid_amount: number;
  outstanding: number;
  status: InvoiceStatus;
  bast_date: string | null;
  invoice_date: string | null;
  due_date: string | null;
  paid_date: string | null;
  notes: string | null;
  created_by: InvoicePerson;
  created_at: string;
  updated_at: string;
};

export type InvoiceBilling = InvoiceCompany & {
  value: number;
  invoiced_percentage: number;
  remaining_percentage: number;
  invoiced_amount: number;
  paid_amount: number;
  next_term: number;
  invoices: Invoice[];
};

export type ListInvoicesOptions = {
  pipeline_id?: number;
  status?: InvoiceStatus;
  keyword?: string;
  page?: number;
  page_size?: number;
};

// Update replaces every field; an omitted term keeps the current one.
export type InvoiceFieldsPayload = {
  term?: number;
  number: string;
  percentage: number;
  bast_date: string | null;
  invoice_date: string | null;
  due_date: string | null;
  paid_amount: number;
  paid_date: string | null;
  notes: string | null;
};

export type CreateInvoicePayload = InvoiceFieldsPayload & { pipeline_id: number };
export type UpdateInvoicePayload = InvoiceFieldsPayload & { id: number };

async function post<T>(path: string, body: unknown): Promise<ApiEnvelope<T>> {
  return callApi(`/api/v2/invoices${path}`, { token: await getSessionToken(), body });
}

export async function listInvoices(options: ListInvoicesOptions = {}) {
  return post<ApiList<Invoice>>("", options);
}

export async function getInvoiceDetails(id: number) {
  return post<Invoice>("/details", { id });
}

export async function getInvoiceBilling(pipelineId: number) {
  return post<InvoiceBilling>("/billing", { pipeline_id: pipelineId });
}

export async function createInvoice(payload: CreateInvoicePayload) {
  return post<Invoice>("/create", payload);
}

export async function updateInvoice(payload: UpdateInvoicePayload) {
  return post<Invoice>("/update", payload);
}

export async function deleteInvoice(id: number) {
  return post<null>("/delete", { id });
}
