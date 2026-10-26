"use server";

import { getHomeStat as getHomeStatApi } from "@/apis/stat";
import {
  createTask as createTaskApi,
  deleteTask as deleteTaskApi,
  getTaskDetails as getTaskDetailsApi,
  listTasks as listTasksApi,
  updateTask as updateTaskApi,
  type CreateTaskPayload,
  type ListTasksOptions,
  type UpdateTaskPayload,
} from "@/apis/tasks";
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
  getTrackingAileneReferrals as getTrackingAileneReferralsApi,
  getTrackingFunnel as getTrackingFunnelApi,
  getTrackingOverview as getTrackingOverviewApi,
  getTrackingSources as getTrackingSourcesApi,
  type AnalyticsPeriodPayload,
  type TrackingPeriodPayload,
} from "@/apis/analytics";
import { loginWithGoogle as loginWithGoogleApi } from "@/apis/auth";
import {
  getLmsCurriculum as getLmsCurriculumApi,
  createLmsChapter as createLmsChapterApi,
  updateLmsChapter as updateLmsChapterApi,
  deleteLmsChapter as deleteLmsChapterApi,
  createLmsSchedule as createLmsScheduleApi,
  updateLmsSchedule as updateLmsScheduleApi,
  deleteLmsSchedule as deleteLmsScheduleApi,
  createLmsContent as createLmsContentApi,
  updateLmsContent as updateLmsContentApi,
  deleteLmsContent as deleteLmsContentApi,
  type LmsChapterPayload,
  type LmsChapterRef,
  type LmsSchedulePayload,
  type LmsScheduleRef,
  type LmsContentPayload,
  type LmsContentRef,
  createLmsGroup as createLmsGroupApi,
  deleteLmsGroup as deleteLmsGroupApi,
  deleteLmsMember as deleteLmsMemberApi,
  getLmsMember as getLmsMemberApi,
  inviteLmsMember as inviteLmsMemberApi,
  updateLmsGroup as updateLmsGroupApi,
  updateLmsMember as updateLmsMemberApi,
  type InviteLmsMemberPayload,
  getLmsInsightsOverview as getLmsInsightsOverviewApi,
  getLmsPreAssessmentInsights as getLmsPreAssessmentInsightsApi,
  getLmsGuidedInsights as getLmsGuidedInsightsApi,
  getLmsReviewInsights as getLmsReviewInsightsApi,
  getLmsTestInsights as getLmsTestInsightsApi,
  getLmsQuizInsights as getLmsQuizInsightsApi,
  type LmsInsightsFilter,
  type UpdateLmsMemberPayload,
} from "@/apis/lms";
import { listIndustries as listIndustriesApi, type ListIndustriesOptions } from "@/apis/lookup";
import {
  createQuotation as createQuotationApi,
  decideQuotation as decideQuotationApi,
  deleteQuotation as deleteQuotationApi,
  getQuotationDetails as getQuotationDetailsApi,
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
  deleteSignal as deleteSignalApi,
  generateLinkedInSignals as generateLinkedInSignalsApi,
  listSignals as listSignalsApi,
  updateSignal as updateSignalApi,
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
  compareDomains as compareDomainsApi,
  getDomainHistory as getDomainHistoryApi,
  getDomainOverview as getDomainOverviewApi,
  listDomainRankings as listDomainRankingsApi,
  listRankingSources as listRankingSourcesApi,
  listTrackedDomains as listTrackedDomainsApi,
  listKeywordRankings as listKeywordRankingsApi,
  listDomainKeywordRankings as listDomainKeywordRankingsApi,
  trackDomain as trackDomainApi,
  type RankingOptions,
  type TrackedOptions,
  type KeywordOptions,
  type DomainKeywordOptions,
} from "@/apis/domain-ranking";
import {
  createCompany as createCompanyApi,
  createPipelineStage as createPipelineStageApi,
  updatePipelineStage as updatePipelineStageApi,
  reorderPipelineStages as reorderPipelineStagesApi,
  deletePipelineStage as deletePipelineStageApi,
  listPipelineStages as listPipelineStagesApi,
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
  type CreatePipelineStagePayload,
  type UpdatePipelineStagePayload,
  type PipelinePhase,
  type PipelineStage,
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

export async function listRankingSources() {
  return listRankingSourcesApi();
}

export async function listDomainRankings(options: RankingOptions) {
  return listDomainRankingsApi(options);
}

export async function getDomainOverview(domain: string) {
  return getDomainOverviewApi(domain);
}

export async function getDomainHistory(domain: string) {
  return getDomainHistoryApi(domain);
}

export async function compareDomains(domains: string[]) {
  return compareDomainsApi(domains);
}

export async function listTrackedDomains(options: TrackedOptions = {}) {
  return listTrackedDomainsApi(options);
}

export async function listKeywordRankings(options: KeywordOptions = {}) {
  return listKeywordRankingsApi(options);
}

export async function listDomainKeywordRankings(options: DomainKeywordOptions) {
  return listDomainKeywordRankingsApi(options);
}

export async function trackDomain(domain: string) {
  return trackDomainApi(domain);
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

export async function listPipelineStages(options: { phase?: PipelinePhase } = {}) {
  return listPipelineStagesApi(options);
}

export async function createPipelineStage(payload: CreatePipelineStagePayload) {
  return createPipelineStageApi(payload);
}

export async function updatePipelineStage(payload: UpdatePipelineStagePayload) {
  return updatePipelineStageApi(payload);
}

export async function reorderPipelineStages(payload: { phase: PipelinePhase; codes: PipelineStage[] }) {
  return reorderPipelineStagesApi(payload);
}

export async function deletePipelineStage(payload: { code: PipelineStage; transfer_to: PipelineStage }) {
  return deletePipelineStageApi(payload);
}

export async function deleteQuotation(id: number) {
  return deleteQuotationApi(id);
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

export async function listTasks(options: ListTasksOptions = {}) {
  return listTasksApi(options);
}

export async function getTaskDetails(id: number) {
  return getTaskDetailsApi(id);
}

export async function createTask(payload: CreateTaskPayload) {
  return createTaskApi(payload);
}

export async function updateTask(payload: UpdateTaskPayload) {
  return updateTaskApi(payload);
}

export async function deleteTask(id: number) {
  return deleteTaskApi(id);
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

export async function getTrackingAileneReferrals(payload: TrackingPeriodPayload) {
  return getTrackingAileneReferralsApi(payload);
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

export async function getLmsCurriculum(projectId: string) { return getLmsCurriculumApi(projectId); }
export async function getLmsInsightsOverview(filter: LmsInsightsFilter) { return getLmsInsightsOverviewApi(filter); }
export async function getLmsPreAssessmentInsights(filter: LmsInsightsFilter) { return getLmsPreAssessmentInsightsApi(filter); }
export async function getLmsGuidedInsights(filter: LmsInsightsFilter) { return getLmsGuidedInsightsApi(filter); }
export async function getLmsReviewInsights(filter: LmsInsightsFilter) { return getLmsReviewInsightsApi(filter); }
export async function getLmsTestInsights(filter: LmsInsightsFilter) { return getLmsTestInsightsApi(filter); }
export async function getLmsQuizInsights(filter: LmsInsightsFilter) { return getLmsQuizInsightsApi(filter); }
export async function createLmsChapter(payload: LmsChapterPayload) { return createLmsChapterApi(payload); }
export async function updateLmsChapter(payload: LmsChapterPayload & { chapter_id: number }) { return updateLmsChapterApi(payload); }
export async function deleteLmsChapter(payload: LmsChapterRef) { return deleteLmsChapterApi(payload); }
export async function createLmsSchedule(payload: LmsSchedulePayload) { return createLmsScheduleApi(payload); }
export async function updateLmsSchedule(payload: LmsSchedulePayload & { session_id: number }) { return updateLmsScheduleApi(payload); }
export async function deleteLmsSchedule(payload: LmsScheduleRef) { return deleteLmsScheduleApi(payload); }
export async function createLmsContent(payload: LmsContentPayload) { return createLmsContentApi(payload); }
export async function updateLmsContent(payload: LmsContentPayload) { return updateLmsContentApi(payload); }
export async function deleteLmsContent(payload: LmsContentRef) { return deleteLmsContentApi(payload); }

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

export async function getLmsMember(payload: {
  project_id: string;
  access_id: string;
}) {
  return getLmsMemberApi(payload);
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

export async function generateLinkedInSignals() {
  return generateLinkedInSignalsApi();
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

export async function getHomeStat() {
  return getHomeStatApi();
}
