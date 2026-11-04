import "server-only";

import { callApi, type ApiEnvelope } from "./api";
import { getSessionToken } from "./session";

export type ReportPeriod = {
  start_date: string;
  end_date: string;
  previous_start_date: string;
  previous_end_date: string;
  days: number;
};

export type AnalyticsPeriodPayload = { start_date: string; end_date: string };

export type WarehouseAnalyticsPayload = AnalyticsPeriodPayload & {
  host?: string;
  channel?: string;
  campaign_id?: string;
};

// --- Product sites (GA4 "Tracking") ---

export type TrackingWebsiteId =
  | "jagohermes.com"
  | "kelasclaude.com"
  | "belajarvibecoding.com"
  | "belajarkoding.com";

export type TrackingPeriodPayload = AnalyticsPeriodPayload & {
  website?: TrackingWebsiteId;
};

type TrackingMetrics = {
  users: number;
  sessions: number;
  page_views: number;
  purchases: number;
  revenue: number;
};

export type TrackingOverview = {
  property_id: string;
  period: ReportPeriod;
  metadata: { timezone: string; currency: string; generated_at: string };
  summary: {
    current: TrackingMetrics;
    previous: TrackingMetrics;
    changes: { [K in keyof TrackingMetrics]: number | null };
  };
  daily: { date: string; sessions: number; users: number; revenue: number }[];
};

export type TrackingFunnel = {
  period: ReportPeriod;
  funnel: {
    event: string;
    label: string;
    count: number;
    users: number;
    from_previous_rate: number | null;
    from_entry_rate: number | null;
  }[];
};

export type TrackingSources = {
  period: ReportPeriod;
  websites: (TrackingMetrics & {
    id: string;
    label: string;
    session_to_purchase_rate: number | null;
  })[];
  channels: {
    channel: string;
    source_medium: string;
    sessions: number;
    users: number;
    purchases: number;
    revenue: number;
  }[];
};

type TrackingTraffic = {
  sessions: number;
  users: number;
  purchases: number;
  revenue: number;
};

// Product-site sessions whose GA4 sessionSource is ailene.id; referrer-less visits land in (direct) and are absent.
export type TrackingAileneReferrals = TrackingOverview & {
  websites: TrackingSources["websites"];
  landing_pages: (TrackingTraffic & {
    website: TrackingWebsiteId;
    landing_page: string;
  })[];
  sources: (TrackingTraffic & {
    source: string;
    medium: string;
    campaign: string;
    content: string;
  })[];
};

async function post<T>(path: string, body: unknown): Promise<ApiEnvelope<T>> {
  return callApi(`/api/v1/analytics/${path}`, { token: await getSessionToken(), body });
}

export async function getTrackingOverview(payload: TrackingPeriodPayload) {
  return post<TrackingOverview>("tracking/overview", payload);
}

export async function getTrackingFunnel(payload: TrackingPeriodPayload) {
  return post<TrackingFunnel>("tracking/funnel", payload);
}

export async function getTrackingSources(payload: TrackingPeriodPayload) {
  return post<TrackingSources>("tracking/sources", payload);
}

export async function getTrackingAileneReferrals(payload: TrackingPeriodPayload) {
  return post<TrackingAileneReferrals>("tracking/ailene-referrals", payload);
}

export type WarehouseMetricSet = {
  spend_idr: number;
  total_leads: number;
  cpl_idr: number | null;
  sessions: number;
  engaged_rate: number | null;
  conversion_rate: number | null;
};

export type WarehouseFunnelStep = {
  lane: "paid" | "web" | "outcome";
  key: string;
  label: string;
  value: number;
  from_previous_rate: number | null;
};

export type WarehouseChannel = {
  channel: string;
  spend_idr: number;
  sessions: number;
  total_leads: number;
  engaged_rate: number | null;
  conversion_rate: number | null;
  cpl_idr: number | null;
};

export type WarehouseLandingPage = {
  landing_page: string;
  sessions: number;
  users: number;
  engaged_rate: number | null;
  average_engagement_seconds: number | null;
  key_events: number;
  conversion_rate: number | null;
  paid_share: number | null;
  seo_clicks: number;
  seo_average_position: number | null;
  mobile_sessions: number;
  desktop_sessions: number;
  mobile_engaged_rate: number | null;
  desktop_engaged_rate: number | null;
  ad_spend_idr: number;
};

export type WarehouseAd = {
  id: string;
  name: string;
  campaign_id: string;
  campaign: string;
  adset: string;
  thumbnail_url: string | null;
  headline: string | null;
  call_to_action: string | null;
  destination_url: string | null;
  destination_kind: "instant_form" | "landing_page" | "unknown";
  destination_path: string | null;
  creative_type: string | null;
  status: string | null;
  spend_idr: number;
  impressions: number;
  frequency: number | null;
  link_clicks: number;
  landing_page_views: number;
  meta_leads: number;
  web_leads: number;
  total_leads: number;
  cpm_idr: number | null;
  link_ctr: number | null;
  hook_rate: number | null;
  hold_rate: number | null;
  landing_rate: number | null;
  web_engaged_rate: number | null;
  cpl_idr: number | null;
  low_n_clicks: boolean;
  low_n_leads: boolean;
  quality_ranking: string | null;
  engagement_ranking: string | null;
  conversion_ranking: string | null;
};

export type WarehouseSEOMetrics = {
  clicks: number;
  impressions: number;
  ctr: number | null;
  average_position: number | null;
};

export type WarehouseAnalytics = {
  period: ReportPeriod;
  timezone: string;
  currency: string;
  generated_at: string;
  filters: {
    hosts: string[];
    channels: string[];
    campaigns: { id: string; name: string }[];
  };
  freshness: { source: string; last_date: string | null; loaded_at: string | null }[];
  coverage: { dataset: string; first_date: string | null; last_date: string | null }[];
  summary: {
    current: WarehouseMetricSet;
    previous: WarehouseMetricSet;
    changes: { [K in keyof WarehouseMetricSet]: number | null };
  };
  daily: { date: string; spend_idr: number; total_leads: number; sessions: number; engaged_sessions: number }[];
  channel_daily: { date: string; channel: string; spend_idr: number; sessions: number; total_leads: number }[];
  funnel: WarehouseFunnelStep[];
  channels: WarehouseChannel[];
  landing_pages: WarehouseLandingPage[];
  ads: WarehouseAd[];
  ad_daily: {
    ad_id: string;
    date: string;
    spend_idr: number;
    impressions: number;
    link_clicks: number;
    frequency: number | null;
    link_ctr: number | null;
  }[];
  meta_audience: {
    breakdown: string;
    segment_1: string;
    segment_2: string | null;
    spend_idr: number;
    impressions: number;
    link_clicks: number;
    leads: number;
    cpl_idr: number | null;
  }[];
  seo_summary: {
    current: WarehouseSEOMetrics;
    previous: WarehouseSEOMetrics;
    changes: { [K in keyof WarehouseSEOMetrics]: number | null };
  };
  seo_branded: { segment: "branded" | "non_branded"; clicks: number; impressions: number }[];
  seo_daily: { date: string; clicks: number; impressions: number; ctr: number | null; average_position: number | null }[];
  seo_queries: {
    query: string;
    clicks: number;
    impressions: number;
    ctr: number | null;
    average_position: number | null;
    branded: boolean;
    quick_win: boolean;
  }[];
  seo_pages: { page: string; clicks: number; impressions: number; ctr: number | null; average_position: number | null }[];
  traffic_sources: {
    channel: string;
    source: string;
    medium: string;
    campaign: string;
    sessions: number;
    users: number;
    engaged_rate: number | null;
    leads: number;
  }[];
  web_audience: {
    dimension: "device" | "region" | "visitor";
    segment: string;
    sessions: number;
    engaged_rate: number | null;
    key_events: number;
  }[];
  utm_issues: { issue: string; sessions: number }[];
  pipeline_runs: {
    run_id: string;
    source: string;
    status: string;
    rows_upserted: number;
    error: string | null;
    window_start: string | null;
    window_end: string | null;
    started_at: string;
    finished_at: string | null;
  }[];
  data_gaps: { code: string; message: string }[];
};

export async function getWarehouseAnalytics(payload: WarehouseAnalyticsPayload) {
  return post<WarehouseAnalytics>("warehouse/dashboard", payload);
}
