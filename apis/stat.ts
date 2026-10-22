import "server-only";

import { callApi, type ApiEnvelope } from "./api";
import type { QuotationListItem } from "./quotations";
import type { PipelineStage } from "./sales";
import { getSessionToken } from "./session";
import type { TaskData } from "./tasks";

export type TaskBucket = {
  total: number;
  list: TaskData[];
};

export type TaskSummaryData = {
  today: string;
  my_tasks_today: number;
  approvals: TaskBucket;
  overdue_tasks: TaskBucket;
  due_today_tasks: TaskBucket;
};

export type QuotationSummary = {
  total: number;
  list: QuotationListItem[];
};

export type PipelineHomeSummary = {
  stale_lead_days: number;
  stale_leads: {
    total: number;
    list: {
      id: number;
      company_name: string;
      stage: PipelineStage;
      last_activity_at: string;
      inactive_days: number;
    }[];
  };
};

type StageCount = {
  stage: PipelineStage;
  label: string;
  count: number;
  percentage: number;
};

export type PipelineAnalytics = {
  stage_distribution: StageCount[];
  funnel: StageCount[];
  weekly_conversion: {
    stage: PipelineStage;
    label: string;
    this_week: number;
    trailing_avg: number;
    delta_pct: number | null;
  }[];
  win_rate_this_week: number | null;
  sankey: {
    nodes: { name: string }[];
    links: { source: number; target: number; value: number }[];
  };
  meta: {
    generated_at: string;
    week_window_days: number;
    week_start: string;
    week_end: string;
    trailing_weeks: number;
    trailing_start: string;
    trailing_end: string;
    sankey_window_days: number;
  };
};

export type HomeStat = {
  tasks: TaskSummaryData;
  leads: PipelineHomeSummary;
  quotations: QuotationSummary;
  analytics: PipelineAnalytics;
};

export async function getHomeStat(): Promise<ApiEnvelope<HomeStat>> {
  return callApi("/api/v2/stat", { token: await getSessionToken() });
}
