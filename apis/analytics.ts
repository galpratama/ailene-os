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

export async function getTrackingAileneReferrals(payload: TrackingPeriodPayload) {
  return post<TrackingAileneReferrals>("tracking/ailene-referrals", payload);
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

export type WarehouseMetricSet = {
  spend_idr: number;
  total_leads: number;
  cpl_idr: number | null;
  sessions: number;
  engaged_rate: number | null;
  conversion_rate: number | null;
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
  summary: {
    current: WarehouseMetricSet;
    previous: WarehouseMetricSet;
    changes: { [K in keyof WarehouseMetricSet]: number | null };
  };
  daily: { date: string; spend_idr: number; total_leads: number; sessions: number }[];
  funnel: { key: string; label: string; value: number; from_previous_rate: number | null }[];
  channels: { channel: string; spend_idr: number; sessions: number; total_leads: number; conversion_rate: number | null }[];
  landing_pages: {
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
  }[];
  ads: {
    id: string;
    name: string;
    campaign_id: string;
    campaign: string;
    adset: string;
    thumbnail_url: string | null;
    headline: string | null;
    call_to_action: string | null;
    destination_url: string | null;
    spend_idr: number;
    impressions: number;
    link_clicks: number;
    landing_page_views: number;
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
  seo_daily: { date: string; clicks: number; impressions: number; ctr: number | null; average_position: number | null }[];
  seo_queries: { query: string; clicks: number; impressions: number; ctr: number | null; average_position: number | null; branded: boolean }[];
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
    device: string;
    region: string;
    new_vs_returning: string;
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
    started_at: string;
    finished_at: string | null;
  }[];
  data_gaps: { code: string; message: string }[];
};

export async function getWarehouseAnalytics(payload: WarehouseAnalyticsPayload) {
  return post<WarehouseAnalytics>("warehouse/dashboard", payload);
}
