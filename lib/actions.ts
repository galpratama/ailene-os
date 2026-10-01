"use server";

import {
  createAction as createActionApi,
  deleteAction as deleteActionApi,
  getActionDetails as getActionDetailsApi,
  getActionSummary as getActionSummaryApi,
  listActions as listActionsApi,
  updateAction as updateActionApi,
  type CreateActionPayload,
  type ListActionsOptions,
  type UpdateActionPayload,
} from "@/apis/actions";
import {
  createArticle as createArticleApi,
  createArticleCategory as createArticleCategoryApi,
  deleteArticle as deleteArticleApi,
  deleteArticleCategory as deleteArticleCategoryApi,
  getArticleDetails as getArticleDetailsApi,
  listArticleCategories as listArticleCategoriesApi,
  updateArticle as updateArticleApi,
  updateArticleCategory as updateArticleCategoryApi,
  type ArticleCategoryPayload,
  type CreateArticlePayload,
  type UpdateArticlePayload,
} from "@/apis/articles";
import {
  getMarketingChannels as getMarketingChannelsApi,
  getMarketingEngagement as getMarketingEngagementApi,
  getMarketingOverview as getMarketingOverviewApi,
  getMetaAdsAudience as getMetaAdsAudienceApi,
  getMetaAdsCampaigns as getMetaAdsCampaignsApi,
  getMetaAdsCreatives as getMetaAdsCreativesApi,
  getMetaAdsOverview as getMetaAdsOverviewApi,
  getTrackingFunnel as getTrackingFunnelApi,
  getTrackingOverview as getTrackingOverviewApi,
  getTrackingSources as getTrackingSourcesApi,
  type AnalyticsPeriodPayload,
  type TrackingPeriodPayload,
} from "@/apis/analytics";
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
import {
  createQuotation as createQuotationApi,
  decideQuotation as decideQuotationApi,
  getQuotationDetails as getQuotationDetailsApi,
  getQuotationSummary as getQuotationSummaryApi,
  listQuotations as listQuotationsApi,
  submitQuotation as submitQuotationApi,
  updateQuotation as updateQuotationApi,
  updateQuotationOutcome as updateQuotationOutcomeApi,
  type CreateQuotationPayload,
  type DecideQuotationPayload,
  type ListQuotationsOptions,
  type QuotationOutcomeStatus,
  type UpdateQuotationPayload,
} from "@/apis/quotations";
import {
  connectGoogleCalendar as connectGoogleCalendarApi,
  createMeeting as createMeetingApi,
  deleteMeeting as deleteMeetingApi,
  disconnectGoogleCalendar as disconnectGoogleCalendarApi,
  getGoogleCalendarConnection as getGoogleCalendarConnectionApi,
  getMeetingDetails as getMeetingDetailsApi,
  listMeetings as listMeetingsApi,
  updateMeeting as updateMeetingApi,
  type CreateMeetingPayload,
  type ListMeetingsOptions,
  type UpdateMeetingPayload,
} from "@/apis/meetings";
import {
  getUnreadNotificationCount as getUnreadNotificationCountApi,
  listNotifications as listNotificationsApi,
  markAllNotificationsRead as markAllNotificationsReadApi,
  markNotificationRead as markNotificationReadApi,
  type ListNotificationsOptions,
} from "@/apis/notifications";
import { logoutUser as logoutUserApi } from "@/apis/session";
import {
  applyAsTrainer as applyAsTrainerApi,
  createTrainer as createTrainerApi,
  createTrainerSpecialization as createTrainerSpecializationApi,
  deleteTrainerSpecialization as deleteTrainerSpecializationApi,
  getTrainerDetails as getTrainerDetailsApi,
  getTrainerSummary as getTrainerSummaryApi,
  listSpecializationOptions as listSpecializationOptionsApi,
  listTrainerSpecializations as listTrainerSpecializationsApi,
  listTrainers as listTrainersApi,
  updateCertificationStep as updateCertificationStepApi,
  updateScreeningScore as updateScreeningScoreApi,
  updateScreeningStep as updateScreeningStepApi,
  updateTrainer as updateTrainerApi,
  type CertificationStatus,
  type CertificationStep,
  type CreateTrainerPayload,
  type ListTrainersOptions,
  type ScreeningScorePayload,
  type ScreeningStatus,
  type ScreeningStep,
  type TrainerApplicationPayload,
  type UpdateTrainerPayload,
} from "@/apis/trainers";
import { createTeam as createTeamApi, listTeams as listTeamsApi } from "@/apis/teams";
import {
  listTrendingKeywords as listTrendingKeywordsApi,
  refreshTrendingKeywords as refreshTrendingKeywordsApi,
  type ListTrendingKeywordsOptions,
} from "@/apis/trending-keywords";
import {
  createSignal as createSignalApi,
  deleteSignal as deleteSignalApi,
  listSignals as listSignalsApi,
  updateSignal as updateSignalApi,
  type CreateSignalPayload,
  type ListSignalsOptions,
  type UpdateSignalPayload,
} from "@/apis/signals";
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
  getPipelineAnalytics as getPipelineAnalyticsApi,
  getPipelineHomeSummary as getPipelineHomeSummaryApi,
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

export async function getPipelineHomeSummary() {
  return getPipelineHomeSummaryApi();
}

export async function getPipelineAnalytics() {
  return getPipelineAnalyticsApi();
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

export async function deleteAction(id: number) {
  return deleteActionApi(id);
}

export async function getTrackingOverview(payload: TrackingPeriodPayload) {
  return getTrackingOverviewApi(payload);
}

export async function getTrackingFunnel(payload: TrackingPeriodPayload) {
  return getTrackingFunnelApi(payload);
}

export async function getTrackingSources(payload: TrackingPeriodPayload) {
  return getTrackingSourcesApi(payload);
}

export async function getMarketingOverview(payload: AnalyticsPeriodPayload) {
  return getMarketingOverviewApi(payload);
}

export async function getMarketingEngagement(payload: AnalyticsPeriodPayload) {
  return getMarketingEngagementApi(payload);
}

export async function getMarketingChannels(payload: AnalyticsPeriodPayload) {
  return getMarketingChannelsApi(payload);
}

export async function getMetaAdsOverview(payload: AnalyticsPeriodPayload) {
  return getMetaAdsOverviewApi(payload);
}

export async function getMetaAdsCampaigns(payload: AnalyticsPeriodPayload) {
  return getMetaAdsCampaignsApi(payload);
}

export async function getMetaAdsCreatives(payload: AnalyticsPeriodPayload) {
  return getMetaAdsCreativesApi(payload);
}

export async function getMetaAdsAudience(payload: AnalyticsPeriodPayload) {
  return getMetaAdsAudienceApi(payload);
}

export async function listMeetings(options: ListMeetingsOptions) {
  return listMeetingsApi(options);
}

export async function getMeetingDetails(id: number) {
  return getMeetingDetailsApi(id);
}

export async function createMeeting(payload: CreateMeetingPayload) {
  return createMeetingApi(payload);
}

export async function updateMeeting(payload: UpdateMeetingPayload) {
  return updateMeetingApi(payload);
}

export async function deleteMeeting(id: number) {
  return deleteMeetingApi(id);
}

export async function getGoogleCalendarConnection() {
  return getGoogleCalendarConnectionApi();
}

export async function connectGoogleCalendar(payload: { code: string; redirect_uri: string }) {
  return connectGoogleCalendarApi(payload);
}

export async function disconnectGoogleCalendar() {
  return disconnectGoogleCalendarApi();
}

export async function listTrainers(options: ListTrainersOptions = {}) {
  return listTrainersApi(options);
}

export async function getTrainerSummary() {
  return getTrainerSummaryApi();
}

export async function getTrainerDetails(id: string) {
  return getTrainerDetailsApi(id);
}

export async function createTrainer(payload: CreateTrainerPayload) {
  return createTrainerApi(payload);
}

export async function updateTrainer(payload: UpdateTrainerPayload) {
  return updateTrainerApi(payload);
}

export async function updateScreeningStep(payload: {
  trainer_id: string;
  step: ScreeningStep;
  status: ScreeningStatus;
}) {
  return updateScreeningStepApi(payload);
}

export async function updateScreeningScore(payload: ScreeningScorePayload) {
  return updateScreeningScoreApi(payload);
}

export async function updateCertificationStep(payload: {
  trainer_id: string;
  step: CertificationStep;
  status: CertificationStatus;
}) {
  return updateCertificationStepApi(payload);
}

export async function listTrainerSpecializations() {
  return listTrainerSpecializationsApi();
}

export async function createTrainerSpecialization(name: string) {
  return createTrainerSpecializationApi(name);
}

export async function deleteTrainerSpecialization(id: number) {
  return deleteTrainerSpecializationApi(id);
}

export async function listSpecializationOptions() {
  return listSpecializationOptionsApi();
}

// Public landing page: the API's error wording is passed through, since it is written for the applicant.
export async function applyAsTrainer(payload: TrainerApplicationPayload) {
  return applyAsTrainerApi(payload);
}

export async function listNotifications(options: ListNotificationsOptions = {}) {
  return listNotificationsApi(options);
}

export async function getUnreadNotificationCount() {
  return getUnreadNotificationCountApi();
}

export async function markNotificationRead(id: number) {
  return markNotificationReadApi(id);
}

export async function markAllNotificationsRead() {
  return markAllNotificationsReadApi();
}

export async function listQuotations(options: ListQuotationsOptions = {}) {
  return listQuotationsApi(options);
}

export async function getQuotationSummary() {
  return getQuotationSummaryApi();
}

export async function getQuotationDetails(id: number) {
  return getQuotationDetailsApi(id);
}

export async function createQuotation(payload: CreateQuotationPayload) {
  return createQuotationApi(payload);
}

export async function updateQuotation(payload: UpdateQuotationPayload) {
  return updateQuotationApi(payload);
}

export async function submitQuotation(id: number) {
  return submitQuotationApi(id);
}

export async function decideQuotation(payload: DecideQuotationPayload) {
  return decideQuotationApi(payload);
}

export async function updateQuotationOutcome(payload: {
  id: number;
  status: QuotationOutcomeStatus;
}) {
  return updateQuotationOutcomeApi(payload);
}

export async function listArticleCategories() {
  return listArticleCategoriesApi({ page: 1, page_size: 100 });
}

export async function createArticleCategory(payload: ArticleCategoryPayload) {
  return createArticleCategoryApi(payload);
}

export async function updateArticleCategory(
  payload: ArticleCategoryPayload & { id: number }
) {
  return updateArticleCategoryApi(payload);
}

export async function deleteArticleCategory(id: number) {
  return deleteArticleCategoryApi(id);
}

export async function getArticleDetails(id: number) {
  return getArticleDetailsApi(id);
}

export async function createArticle(payload: CreateArticlePayload) {
  return createArticleApi(payload);
}

export async function updateArticle(payload: UpdateArticlePayload) {
  return updateArticleApi(payload);
}

export async function deleteArticle(id: number) {
  return deleteArticleApi(id);
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

export async function listTrendingKeywords(options: ListTrendingKeywordsOptions = {}) {
  return listTrendingKeywordsApi(options);
}

export async function refreshTrendingKeywords() {
  return refreshTrendingKeywordsApi();
}

export async function listSignals(options: ListSignalsOptions = {}) {
  return listSignalsApi(options);
}

export async function createSignal(payload: CreateSignalPayload) {
  return createSignalApi(payload);
}

export async function updateSignal(payload: UpdateSignalPayload) {
  return updateSignalApi(payload);
}

export async function deleteSignal(id: number) {
  return deleteSignalApi(id);
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
