import "server-only";

import { callApi, clientSecret, type ApiEnvelope, type ApiList } from "./api";
import { getSessionToken } from "./session";

export type LeadSource = "inbound" | "outbound";
export type LeadChannel = "referral" | "linkedin" | "thread" | "instagram";
export type PipelinePhase = "sdr" | "bdr";

export type PipelineStage =
  | "lead_identified"
  | "triaging"
  | "attempting"
  | "engaged"
  | "qualified"
  | "meeting_booked"
  | "disqualified"
  | "discovery_done"
  | "proposal_negotiation"
  | "closed_won"
  | "closed_lost";

export type CompanyData = {
  id: number;
  name: string;
  normalized_name: string;
  legal_identifier: string | null;
  industry_id: number | null;
  lead_source: LeadSource | null;
  lead_channel: LeadChannel | null;
  website_url: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactData = {
  id: number;
  company_id: number;
  company_name: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  primary: boolean;
  created_at: string;
  updated_at: string;
};

export type PipelineData = {
  id: number;
  company_id: number;
  company_name: string;
  sales_owner_id: string;
  sales_owner_name: string;
  lead_source: LeadSource | null;
  lead_channel: LeadChannel | null;
  stage: PipelineStage;
  phase: PipelinePhase;
  terminal: boolean;
  estimated_value: number;
  expected_close_date: string | null;
  qualified_at: string | null;
  meeting_booked_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PipelineStageHistoryData = {
  id: number;
  from_stage: PipelineStage | null;
  to_stage: PipelineStage;
  changed_by: string;
  note: string | null;
  created_at: string;
};

export type CompanyForm = {
  name: string;
  industry_id?: number | null;
  lead_source: LeadSource;
  lead_channel?: LeadChannel | null;
  legal_identifier?: string | null;
  website_url?: string | null;
  image_url?: string | null;
};

export type ContactForm = {
  full_name: string;
  email?: string | null;
  phone?: string | null;
  job_title?: string | null;
  primary?: boolean;
};

export type ListCompaniesOptions = {
  keyword?: string;
  lead_source?: LeadSource;
  lead_channel?: LeadChannel;
  page?: number;
  page_size?: number;
};

export type ListPipelinesOptions = {
  phase: PipelinePhase;
  stage?: PipelineStage;
  lead_source?: LeadSource;
  lead_channel?: LeadChannel;
  sales_owner_id?: string;
  keyword?: string;
  page?: number;
  page_size?: number;
};

export type CreatePipelinePayload = {
  company_id?: number;
  new_company?: CompanyForm;
  new_contact?: ContactForm;
  sales_owner_id?: string;
  stage?: PipelineStage;
  estimated_value?: number;
  expected_close_date?: string | null;
};

export type InboundLeadPayload = {
  company_name: string;
  industry_id?: number | null;
  website_url?: string | null;
  contact: {
    full_name: string;
    email?: string | null;
    phone?: string | null;
    job_title?: string | null;
  };
  lead_channel?: LeadChannel | null;
  note?: string | null;
};

// The response withholds owner fields on purpose, so the landing page never sees internal staff.
export type InboundLeadData = {
  id: number;
  company_id: number;
  company_name: string;
  contact_id: number;
  lead_source: LeadSource;
  lead_channel: LeadChannel | null;
  stage: PipelineStage;
  phase: PipelinePhase;
  created_at: string;
};

export type UpdatePipelinePayload = {
  id: number;
  company_id: number;
  sales_owner_id: string;
  stage: PipelineStage;
  estimated_value: number;
  expected_close_date?: string | null;
  stage_note?: string | null;
};

async function token() {
  return getSessionToken();
}

export async function listCompanies(
  options: ListCompaniesOptions = {}
): Promise<ApiEnvelope<ApiList<CompanyData>>> {
  return callApi("/api/v1/companies", {
    token: await token(),
    body: options,
  });
}

export async function getCompanyDetails(
  id: number
): Promise<
  ApiEnvelope<CompanyData & {
    contacts: ContactData[];
    pipeline: PipelineData | null;
  }>
> {
  return callApi("/api/v1/companies/details", {
    token: await token(),
    body: { id },
  });
}

export async function createCompany(
  company: CompanyForm
): Promise<ApiEnvelope<CompanyData>> {
  return callApi("/api/v1/companies/create", {
    token: await token(),
    body: { company },
  });
}

export async function updateCompany(payload: {
  id: number;
  company: CompanyForm;
}): Promise<ApiEnvelope<CompanyData>> {
  return callApi("/api/v1/companies/update", {
    token: await token(),
    body: payload,
  });
}

export async function deleteCompany(id: number): Promise<ApiEnvelope<null>> {
  return callApi("/api/v1/companies/delete", {
    token: await token(),
    body: { id },
  });
}

export async function createContact(payload: {
  company_id: number;
  contact: ContactForm;
}): Promise<ApiEnvelope<ContactData>> {
  return callApi("/api/v1/contacts/create", {
    token: await token(),
    body: payload,
  });
}

export async function updateContact(payload: {
  id: number;
  company_id: number;
  contact: ContactForm;
}): Promise<ApiEnvelope<ContactData>> {
  return callApi("/api/v1/contacts/update", {
    token: await token(),
    body: payload,
  });
}

export async function listPipelines(
  options: ListPipelinesOptions
): Promise<ApiEnvelope<ApiList<PipelineData>>> {
  return callApi("/api/v1/pipelines", {
    token: await token(),
    body: options,
  });
}

export async function getPipelineDetails(
  id: number
): Promise<
  ApiEnvelope<PipelineData & {
    stage_history: PipelineStageHistoryData[];
  }>
> {
  return callApi("/api/v1/pipelines/details", {
    token: await token(),
    body: { id },
  });
}

export async function createPipeline(
  payload: CreatePipelinePayload
): Promise<ApiEnvelope<PipelineData>> {
  return callApi("/api/v1/pipelines/create", {
    token: await token(),
    body: payload,
  });
}

export async function updatePipeline(
  payload: UpdatePipelinePayload
): Promise<ApiEnvelope<PipelineData>> {
  return callApi("/api/v1/pipelines/update", {
    token: await token(),
    body: payload,
  });
}

// The only sales endpoint with no signed-in user: it authenticates with the static client secret.
export async function createInboundLead(
  payload: InboundLeadPayload
): Promise<ApiEnvelope<InboundLeadData>> {
  return callApi("/api/v1/pipelines/create-inbound", {
    token: clientSecret(),
    body: payload,
  });
}

export async function deletePipeline(id: number): Promise<ApiEnvelope<null>> {
  return callApi("/api/v1/pipelines/delete", {
    token: await token(),
    body: { id },
  });
}
