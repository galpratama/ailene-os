"use server";

import {
  createAction as createActionApi,
  getActionDetails as getActionDetailsApi,
  getActionSummary as getActionSummaryApi,
  listActions as listActionsApi,
  updateAction as updateActionApi,
  type CreateActionPayload,
  type ListActionsOptions,
  type UpdateActionPayload,
} from "@/apis/actions";
import { loginWithGoogle as loginWithGoogleApi } from "@/apis/auth";
import {
  createLmsGroup as createLmsGroupApi,
  deleteLmsGroup as deleteLmsGroupApi,
  deleteLmsMember as deleteLmsMemberApi,
  inviteLmsMember as inviteLmsMemberApi,
  updateLmsGroup as updateLmsGroupApi,
  updateLmsMember as updateLmsMemberApi,
  type InviteLmsMemberPayload,
  type UpdateLmsMemberPayload,
} from "@/apis/lms";
import { listIndustries as listIndustriesApi, type ListIndustriesOptions } from "@/apis/lookup";
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
  listPipelineWeeks as listPipelineWeeksApi,
  updateCompany as updateCompanyApi,
  updateContact as updateContactApi,
  updatePipeline as updatePipelineApi,
  type CompanyForm,
  type ContactForm,
  type CreatePipelinePayload,
  type InboundLeadPayload,
  type ListCompaniesOptions,
  type ListPipelinesOptions,
  type PipelineWeekOptions,
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

export async function listIndustries(options: ListIndustriesOptions = {}) {
  return listIndustriesApi(options);
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

export async function listPipelineWeeks(options: PipelineWeekOptions) {
  return listPipelineWeeksApi(options);
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

export async function listActions(options: ListActionsOptions = {}) {
  return listActionsApi(options);
}

export async function getActionSummary() {
  return getActionSummaryApi();
}

export async function getActionDetails(id: number) {
  return getActionDetailsApi(id);
}

export async function createAction(payload: CreateActionPayload) {
  return createActionApi(payload);
}

export async function updateAction(payload: UpdateActionPayload) {
  return updateActionApi(payload);
}

export async function createLmsGroup(payload: {
  project_id: string;
  name: string;
}) {
  return createLmsGroupApi(payload);
}

export async function updateLmsGroup(payload: {
  project_id: string;
  group_id: number;
  name: string;
}) {
  return updateLmsGroupApi(payload);
}

export async function deleteLmsGroup(payload: {
  project_id: string;
  group_id: number;
}) {
  return deleteLmsGroupApi(payload);
}

export async function inviteLmsMember(payload: InviteLmsMemberPayload) {
  return inviteLmsMemberApi(payload);
}

export async function updateLmsMember(payload: UpdateLmsMemberPayload) {
  return updateLmsMemberApi(payload);
}

export async function deleteLmsMember(payload: {
  project_id: string;
  access_id: string;
}) {
  return deleteLmsMemberApi(payload);
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
