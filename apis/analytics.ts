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

// --- Marketing site (GA4 biz property) ---

type MarketingMetrics = {
  users: number;
  sessions: number;
  page_views: number;
  cta_clicks: number;
  leads: number;
};

type FeatureSchema = { available: boolean; message: string | null };

export type MarketingOverview = {
  property_id: string;
  period: ReportPeriod;
  metadata: { timezone: string; generated_at: string };
  feature_schema: FeatureSchema;
  summary: {
    current: MarketingMetrics;
    previous: MarketingMetrics;
    changes: { [K in keyof MarketingMetrics]: number | null };
  };
  daily: { date: string; sessions: number; users: number; leads: number }[];
};

export type MarketingEngagement = {
  period: ReportPeriod;
  feature_schema: FeatureSchema;
  funnel: {
    key: string;
    label: string;
    hint: string;
    count: number;
    users: number;
    drop_off: number;
    drop_off_rate: number | null;
    from_previous_rate: number | null;
    from_entry_rate: number | null;
  }[];
  blocks: {
    id: string;
    label: string;
    position: number;
    views: number;
    view_users: number;
    clicks: number;
    leads: number;
    click_through_rate: number | null;
  }[];
  scroll_depth: {
    id: string;
    label: string;
    position: number;
    views: number;
    viewers: number;
    clicks: number;
    reach_rate: number | null;
  }[];
  cta_breakdown: {
    feature: string;
    label: string;
    clicks: number;
    users: number;
    is_lead: boolean;
  }[];
};

export type MarketingChannels = {
  period: ReportPeriod;
  channels: {
    channel: string;
    source_medium: string;
    sessions: number;
    users: number;
    engaged_sessions: number;
    engagement_rate: number | null;
  }[];
};

// --- Meta Ads ---

export type MetaMetrics = {
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  link_clicks: number;
  landing_page_views: number;
  results: number;
  ctr: number | null;
  link_ctr: number | null;
  cpc: number | null;
  cost_per_link_click: number | null;
  cpm: number | null;
  cpp: number | null;
  frequency: number | null;
  cost_per_result: number | null;
  result_rate: number | null;
};

// Every Meta section answers configured: false (and nothing but the period) until the account is connected.
type MetaSection<T> =
  | { configured: false; period: ReportPeriod }
  | ({ configured: true; period: ReportPeriod } & T);

export type MetaAdsOverview = MetaSection<{
  account: { id: string; name: string; currency: string; timezone: string };
  metadata: { generated_at: string; attribution: string };
  summary: {
    current: MetaMetrics;
    previous: MetaMetrics;
    changes: {
      spend: number | null;
      impressions: number | null;
      reach: number | null;
      clicks: number | null;
      link_clicks: number | null;
      results: number | null;
      ctr: number | null;
      cpc: number | null;
      cpm: number | null;
      cost_per_result: number | null;
    };
  };
  daily: {
    date: string;
    spend: number;
    impressions: number;
    reach: number;
    clicks: number;
    link_clicks: number;
    results: number;
    cpm: number;
    cpc: number;
    ctr: number;
    cost_per_result: number;
  }[];
  result_mix: {
    key: string;
    label: string;
    results: number;
    cost_per_result: number | null;
  }[];
}>;

export type MetaAdsCampaigns = MetaSection<{
  campaigns: (MetaMetrics & { id: string; name: string; objective: string })[];
}>;

export type MetaCreative = MetaMetrics & {
  id: string;
  name: string;
  campaign: string;
  adset: string;
  thumbnail_url: string | null;
  headline: string | null;
  status: string | null;
  quality_ranking: string | null;
  engagement_ranking: string | null;
  conversion_ranking: string | null;
};

export type MetaAdsCreatives = MetaSection<{
  min_ranking_impressions: number;
  creatives: MetaCreative[];
  highlights: {
    best_cost_per_result: string | null;
    best_link_ctr: string | null;
    best_result_rate: string | null;
    top_spend: string | null;
  };
}>;

export type MetaAdsAudience = MetaSection<{
  placements: (MetaMetrics & { key: string; platform: string; label: string })[];
  demographics: (MetaMetrics & {
    key: string;
    platform: string;
    label: string;
    age: string;
    gender: string;
  })[];
}>;

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

export async function getMarketingOverview(payload: AnalyticsPeriodPayload) {
  return post<MarketingOverview>("marketing/overview", payload);
}

export async function getMarketingEngagement(payload: AnalyticsPeriodPayload) {
  return post<MarketingEngagement>("marketing/engagement", payload);
}

export async function getMarketingChannels(payload: AnalyticsPeriodPayload) {
  return post<MarketingChannels>("marketing/channels", payload);
}

export async function getMetaAdsOverview(payload: AnalyticsPeriodPayload) {
  return post<MetaAdsOverview>("meta-ads/overview", payload);
}

export async function getMetaAdsCampaigns(payload: AnalyticsPeriodPayload) {
  return post<MetaAdsCampaigns>("meta-ads/campaigns", payload);
}

export async function getMetaAdsCreatives(payload: AnalyticsPeriodPayload) {
  return post<MetaAdsCreatives>("meta-ads/creatives", payload);
}

export async function getMetaAdsAudience(payload: AnalyticsPeriodPayload) {
  return post<MetaAdsAudience>("meta-ads/audience", payload);
}
