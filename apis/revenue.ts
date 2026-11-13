import "server-only";

import { callApi, type ApiEnvelope, type Metapaging } from "./api";
import type { ReportPeriod } from "./analytics";
import { getSessionToken } from "./session";

// Revenue engine reports live on the analytics module: `ailene-os-apis/docs/api/analytics.md`, "Revenue engine".

export type RevenuePeriodPayload = { start_date: string; end_date: string };

export type LeadGroup = "inbound_organic" | "inbound_paid" | "inbound_unknown" | "outbound_referral" | "outbound_outreach";

export type RevenueGap = { code: string; message: string };

export type CountChange = { current: number; previous: number; change: number | null };

export type RevenueOverview = {
  period: ReportPeriod;
  timezone: string;
  currency: string;
  revenue_closed: CountChange;
  closings: CountChange;
  sqls: CountChange;
  leads: CountChange;
  // Invoice payments whose paid_date falls in the period.
  cash_collected: CountChange;
  paid_cost_per_sql: { spend_idr: number | null; sqls: number; value_idr: number | null; channels: string[] };
  monthly: { month: string; partial: boolean; leads: number; sqls: number; closings: number; revenue_closed: number }[];
  insights: { code: string; severity: string; value: number }[];
  data_gaps: RevenueGap[];
};

export type RevenueFunnelStep = {
  step: "lead" | "sql" | "meeting" | "quotation" | "won";
  count: number;
  previous: number;
  change: number | null;
  from_previous_rate: number | null;
};

export type RevenueFunnel = {
  period: ReportPeriod;
  steps: RevenueFunnelStep[];
  weakest_step: string | null;
  data_gaps: RevenueGap[];
};

export type RevenueSourceGroup = {
  group: LeadGroup;
  leads: number;
  sqls: number;
  sql_rate: number | null;
  meetings: number;
  won: number;
  revenue: number;
};

export type RevenueSourceChannel = Omit<RevenueSourceGroup, "group"> & {
  group: LeadGroup;
  lead_channel: string | null;
  ad_spend_idr: number | null;
  cost_per_sql_idr: number | null;
};

// Mirrors pipelines.intake_method_enum; null in the database is reported as unclassified.
export type IntakeMethod = "website_form" | "meta_form" | "manual";

export type RevenueIntake = Record<IntakeMethod | "unclassified", number>;

export type RevenueSources = {
  period: ReportPeriod;
  groups: RevenueSourceGroup[];
  channels: RevenueSourceChannel[];
  intake: RevenueIntake;
  data_gaps: RevenueGap[];
};

export type RevenueWeeklySources = {
  timezone: string;
  weeks: { week_start: string; partial: boolean; total: number; groups: Record<LeadGroup, number> }[];
};

export type RevenueWeeklyTrend = {
  period: ReportPeriod;
  timezone: string;
  weeks: {
    week_start: string;
    partial: boolean;
    leads: number;
    sqls: { total: number; groups: Record<LeadGroup, number> };
    meetings: number;
    meetings_held: number;
    quotations: number;
    won: number;
    won_value: number;
  }[];
  data_gaps: RevenueGap[];
};

// Daily facts the pivot tab rolls up by any row and column on the client.
export type RevenuePivotActivityCell = {
  date: string;
  lead_group: LeadGroup;
  lead_channel: string | null;
  sales_owner_id: string | null;
  leads: number;
  sqls: number;
  meetings: number;
  meetings_held: number;
  quotations: number;
  won: number;
  won_value: number;
};

export type RevenuePivotDealCell = {
  date: string;
  stage_code: string;
  lead_group: LeadGroup;
  sales_owner_id: string | null;
  deals: number;
  value: number;
  weighted_value: number;
};

export type RevenuePivot = {
  period: ReportPeriod;
  timezone: string;
  owners: RevenueNamedRef[];
  stages: { code: string; name: string; phase: string; sort_order: number; is_terminal: boolean }[];
  activity: RevenuePivotActivityCell[];
  deals: RevenuePivotDealCell[];
  data_gaps: RevenueGap[];
};

export type RevenueLeadFlow = {
  period: ReportPeriod;
  leads: number;
  nodes: { id: string; label: string; column: number; count: number }[];
  links: { source: string; target: string; count: number; origin: LeadGroup }[];
};

export type RevenueCampaignRow = {
  key: string;
  source: "meta_ad" | "utm" | "none";
  campaign: string | null;
  campaign_id: string | null;
  lead_channel: string | null;
  leads: number;
  sqls: number;
  sql_rate: number | null;
  meetings: number;
  ad_spend_idr: number | null;
  cost_per_sql_idr: number | null;
};

export type RevenueCampaigns = {
  period: ReportPeriod;
  list: RevenueCampaignRow[];
  metapaging: Metapaging;
  data_gaps: RevenueGap[];
};

export type AdVerdict = "no_spend" | "no_leads" | "too_little_data" | "scale" | "keep" | "cut";

export type RevenueAd = {
  ad_id: string;
  ad_name: string | null;
  campaign_id: string | null;
  campaign: string | null;
  destination_kind: "instant_form" | "landing_page" | "unknown";
  spend_idr: number;
  impressions: number;
  link_clicks: number;
  link_ctr: number | null;
  hook_rate: number | null;
  hold_rate: number | null;
  platform_leads: number;
  leads: number;
  sqls: number;
  cost_per_lead_idr: number | null;
  cost_per_sql_idr: number | null;
  verdict: AdVerdict;
};

export type RevenueAds = {
  period: ReportPeriod;
  benchmark_cost_per_sql_idr: number | null;
  ads: RevenueAd[];
  data_gaps: RevenueGap[];
};

export type RevenueSDR = {
  period: ReportPeriod;
  leads: CountChange;
  sqls: CountChange;
  lead_to_sql_rate: number | null;
  previous_lead_to_sql_rate: number | null;
  disqualified: CountChange;
  untraceable: { count: number; rate: number | null };
  data_gaps: RevenueGap[];
};

export type RevenueMeetingWeek = { week_start: string; partial: boolean; booked: number; held: number };

export type RevenueBDR = {
  period: ReportPeriod;
  meetings: CountChange;
  meetings_held: CountChange;
  funnel: { stage_code: string; name: string; phase: string; count: number; previous: number; from_previous_rate: number | null }[];
  meeting_to_quotation_rate: number | null;
  meeting_to_won_rate: number | null;
  meetings_per_week: RevenueMeetingWeek[];
  data_gaps: RevenueGap[];
};

export type RevenueOpenPipelineRow = {
  pipeline_id: number;
  company: { id: number; name: string };
  stage: { code: string; name: string; phase: string };
  value: number;
  value_source: "quotation" | "estimate";
  entered_stage_at: string;
  days_in_stage: number;
  expected_close_date: string | null;
  sales_owner: { id: string; name: string };
  // The stage's win probability (0-1) and value × probability; null while the stage has none.
  probability: number | null;
  weighted_value: number | null;
  next_step: string | null;
  next_step_due: string | null;
};

export type RevenueOutcomeReasons = {
  period: ReportPeriod;
  kind: "disqualified" | "lost";
  total: number;
  unrecorded: number;
  reasons: { code: string | null; label: string; count: number; share: number | null }[];
  data_gaps: RevenueGap[];
};

export type RevenueOpenPipeline = {
  list: RevenueOpenPipelineRow[];
  metapaging: Metapaging;
  totals: { count: number; value: number; weighted_value: number };
  data_gaps: RevenueGap[];
};

export type RevenueOpenPipelinePayload = {
  phase?: "sdr" | "bdr";
  sales_owner_id?: string;
  page?: number;
  page_size?: number;
};

export type RevenueNamedRef = { id: string; name: string };

export type RevenueTeamTasks = {
  today: string;
  open: number;
  overdue: number;
  in_review: number;
  by_person: { assignee: RevenueNamedRef | null; open: number; overdue: number; in_review: number }[];
  list: {
    id: number;
    name: string;
    status: string;
    priority: string;
    start_date: string | null;
    end_date: string | null;
    overdue: boolean;
    assignee: RevenueNamedRef | null;
  }[];
  metapaging: Metapaging;
  data_gaps: RevenueGap[];
};

export type RevenueSourceHealth = {
  source: string;
  via: "warehouse" | "os_database";
  data_through: string | null;
  loaded_at: string | null;
  status: "healthy" | "lagging" | "not_connected";
};

export type RevenueDataHealth = {
  period: ReportPeriod;
  sources: RevenueSourceHealth[];
  leads: number;
  leads_without_channel: number;
  leads_without_attribution: number;
  untraceable_leads: number;
  traceable_lead_rate: number | null;
  data_gaps: RevenueGap[];
};

async function post<T>(path: string, body: unknown): Promise<ApiEnvelope<T>> {
  return callApi(`/api/v1/analytics/${path}`, { token: await getSessionToken(), body });
}

export async function getRevenueOverview(payload: RevenuePeriodPayload) {
  return post<RevenueOverview>("overview", payload);
}

export async function getRevenueFunnel(payload: RevenuePeriodPayload) {
  return post<RevenueFunnel>("funnel", payload);
}

export async function getRevenueSources(payload: RevenuePeriodPayload) {
  return post<RevenueSources>("sources", payload);
}

export async function getRevenueWeeklySources(payload: RevenuePeriodPayload) {
  return post<RevenueWeeklySources>("sources/weekly", payload);
}

export async function getRevenueWeeklyTrend(payload: RevenuePeriodPayload) {
  return post<RevenueWeeklyTrend>("weekly-trend", payload);
}

export async function getRevenuePivot(payload: RevenuePeriodPayload) {
  return post<RevenuePivot>("pivot", payload);
}

export async function getRevenueLeadFlow(payload: RevenuePeriodPayload) {
  return post<RevenueLeadFlow>("lead-flow", payload);
}

export async function getRevenueCampaigns(payload: RevenuePeriodPayload & { page?: number; page_size?: number }) {
  return post<RevenueCampaigns>("campaigns", payload);
}

export async function getRevenueAds(payload: RevenuePeriodPayload) {
  return post<RevenueAds>("ads", payload);
}

export async function getRevenueSDR(payload: RevenuePeriodPayload) {
  return post<RevenueSDR>("sdr", payload);
}

export async function getRevenueBDR(payload: RevenuePeriodPayload) {
  return post<RevenueBDR>("bdr", payload);
}

export async function getRevenueOutcomeReasons(payload: RevenuePeriodPayload & { kind: "disqualified" | "lost" }) {
  return post<RevenueOutcomeReasons>("outcome-reasons", payload);
}

export async function getRevenueOpenPipeline(payload: RevenueOpenPipelinePayload) {
  return post<RevenueOpenPipeline>("open-pipeline", payload);
}

export async function getRevenueTeamTasks(payload: { team_id?: number; page?: number; page_size?: number }) {
  return post<RevenueTeamTasks>("team-tasks", payload);
}

export async function getRevenueDataHealth(payload: RevenuePeriodPayload) {
  return post<RevenueDataHealth>("data-health", payload);
}

export type RevenuePlanFigures = { leads: number; sqls: number; closings: number; revenue: number };

// Actual ÷ target per figure; a figure is null when its target is 0.
export type RevenuePlanAttainment = { leads: number | null; sqls: number | null; closings: number | null; revenue: number | null };

export type RevenuePlanMonth = {
  month: string;
  partial: boolean;
  actual: RevenuePlanFigures;
  target: RevenuePlanFigures | null;
  attainment: RevenuePlanAttainment | null;
};

export type RevenuePlan = {
  period: ReportPeriod;
  months: RevenuePlanMonth[];
  // targeted_actual, target, and attainment cover only months that have a target.
  totals: {
    actual: RevenuePlanFigures;
    targeted_actual: RevenuePlanFigures;
    target: RevenuePlanFigures | null;
    attainment: RevenuePlanAttainment | null;
    months_with_target: number;
  };
  data_gaps: RevenueGap[];
};

export type RevenueCashFigure = { amount: number; count: number };

export type RevenueOpenInvoice = {
  id: number;
  number: string;
  term: number;
  pipeline_id: number;
  company_id: number;
  company_name: string;
  amount: number;
  outstanding: number;
  invoice_date: string;
  due_date: string | null;
  days_open: number;
  overdue: boolean;
};

// The three receivable figures are snapshots as of `today`; invoiced, cash_collected, and monthly follow the period.
export type RevenueCash = {
  period: ReportPeriod;
  today: string;
  closed_not_invoiced: RevenueCashFigure;
  invoiced_not_paid: RevenueCashFigure;
  open_over_30_days: RevenueCashFigure;
  invoiced: CountChange;
  cash_collected: CountChange;
  monthly: { month: string; partial: boolean; invoiced: number; collected: number }[];
  open_invoices: RevenueOpenInvoice[];
  data_gaps: RevenueGap[];
};

// month is YYYY-MM; updated_at is null right after a create.
export type RevenueTarget = {
  month: string;
  leads: number;
  sqls: number;
  closings: number;
  revenue: number;
  updated_at: string | null;
};

export type RevenueTargetPayload = Omit<RevenueTarget, "updated_at">;

export async function getRevenuePlan(payload: RevenuePeriodPayload) {
  return post<RevenuePlan>("plan", payload);
}

export async function getRevenueCash(payload: RevenuePeriodPayload) {
  return post<RevenueCash>("cash", payload);
}

export async function listRevenueTargets(payload: { start_month?: string; end_month?: string }) {
  return post<{ list: RevenueTarget[] }>("revenue-targets", payload);
}

export async function createRevenueTarget(payload: RevenueTargetPayload) {
  return post<RevenueTarget>("revenue-targets/create", payload);
}

export async function updateRevenueTarget(payload: RevenueTargetPayload) {
  return post<RevenueTarget>("revenue-targets/update", payload);
}

export async function deleteRevenueTarget(month: string) {
  return post<null>("revenue-targets/delete", { month });
}
