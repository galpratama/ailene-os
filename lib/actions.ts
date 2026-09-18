"use server";

import { loginWithGoogle as loginWithGoogleApi } from "@/apis/auth";
import { logoutUser as logoutUserApi } from "@/apis/session";
import { createTeam as createTeamApi, listTeams as listTeamsApi } from "@/apis/teams";
import {
  getUserDetails as getUserDetailsApi,
  inviteUser as inviteUserApi,
  listUsers as listUsersApi,
  reassignOwnership as reassignOwnershipApi,
  updateUser as updateUserApi,
  updateUserStatus as updateUserStatusApi,
  type InviteUserPayload,
  type ListUsersOptions,
  type UpdateUserPayload,
  type UserStatus,
} from "@/apis/users";
import { isSuccessStatus } from "@/lib/status_code";
import {
  createCompany as createCompanyApi,
  createContact as createContactApi,
  createInboundLead as createInboundLeadApi,
  createPipeline as createPipelineApi,
  deleteCompany as deleteCompanyApi,
  deletePipeline as deletePipelineApi,
  getCompanyDetails as getCompanyDetailsApi,
  getPipelineDetails as getPipelineDetailsApi,
  listCompanies as listCompaniesApi,
  listPipelines as listPipelinesApi,
  updateCompany as updateCompanyApi,
  updateContact as updateContactApi,
  updatePipeline as updatePipelineApi,
  type CompanyForm,
  type ContactForm,
  type CreatePipelinePayload,
  type InboundLeadPayload,
  type ListCompaniesOptions,
  type ListPipelinesOptions,
  type UpdatePipelinePayload,
} from "@/apis/sales";

// The session JWT stays in the httpOnly cookie — the client only learns whether to navigate.
export async function loginWithGoogle(accessToken: string) {
  const result = await loginWithGoogleApi(accessToken);
  return { success: isSuccessStatus(result.status), message: result.message };
}

export async function logoutUser() {
  await logoutUserApi();
}

export async function listUsers(options: ListUsersOptions = {}) {
  return listUsersApi(options);
}

export async function getUserDetails(id: string) {
  return getUserDetailsApi(id);
}

export async function inviteUser(payload: InviteUserPayload) {
  return inviteUserApi(payload);
}

export async function updateUser(payload: UpdateUserPayload) {
  return updateUserApi(payload);
}

export async function updateUserStatus(payload: {
  id: string;
  status: UserStatus;
  reason?: string;
}) {
  return updateUserStatusApi(payload);
}

export async function reassignOwnership(payload: {
  from_user_id: string;
  to_user_id: string;
  reason: string;
}) {
  return reassignOwnershipApi(payload);
}

export async function listTeams() {
  return listTeamsApi();
}

export async function createTeam(name: string) {
  return createTeamApi(name);
}

export async function listCompanies(options: ListCompaniesOptions = {}) {
  return listCompaniesApi(options);
}

export async function getCompanyDetails(id: number) {
  return getCompanyDetailsApi(id);
}

export async function createCompany(company: CompanyForm) {
  return createCompanyApi(company);
}

export async function updateCompany(payload: { id: number; company: CompanyForm }) {
  return updateCompanyApi(payload);
}

export async function deleteCompany(id: number) {
  return deleteCompanyApi(id);
}

export async function createContact(payload: {
  company_id: number;
  contact: ContactForm;
}) {
  return createContactApi(payload);
}

export async function updateContact(payload: {
  id: number;
  company_id: number;
  contact: ContactForm;
}) {
  return updateContactApi(payload);
}

export async function listPipelines(options: ListPipelinesOptions) {
  return listPipelinesApi(options);
}

export async function getPipelineDetails(id: number) {
  return getPipelineDetailsApi(id);
}

export async function createPipeline(payload: CreatePipelinePayload) {
  return createPipelineApi(payload);
}

export async function updatePipeline(payload: UpdatePipelinePayload) {
  return updatePipelineApi(payload);
}

export async function deletePipeline(id: number) {
  return deletePipelineApi(id);
}

// Public landing page: only a classified outcome crosses back, never the API's own wording.
export async function createInboundLead(payload: InboundLeadPayload) {
  const result = await createInboundLeadApi(payload);
  if (isSuccessStatus(result.status)) {
    return { success: true as const };
  }
  return {
    success: false as const,
    duplicateCompany: result.message === "A company with this name already exists.",
  };
}
