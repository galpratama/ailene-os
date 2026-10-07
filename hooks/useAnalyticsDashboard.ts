"use client";

import type {
  AnalyticsPeriodPayload,
  MarketingChannels,
  MarketingEngagement,
  MarketingOverview,
  MetaAdsAudience,
  MetaAdsCampaigns,
  MetaAdsCreatives,
  MetaAdsOverview,
  ReportPeriod,
  TrackingAileneReferrals,
  TrackingFunnel,
  TrackingOverview,
  TrackingPeriodPayload,
  TrackingSources,
} from "@/apis/analytics";
import type { ApiEnvelope } from "@/apis/api";
import {
  getMarketingChannels,
  getMarketingEngagement,
  getMarketingOverview,
  getMetaAdsAudience,
  getMetaAdsCampaigns,
  getMetaAdsCreatives,
  getMetaAdsOverview,
  getTrackingAileneReferrals,
  getTrackingFunnel,
  getTrackingOverview,
  getTrackingSources,
} from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { useQueries, useQuery, type UseQueryResult } from "@tanstack/react-query";

const STALE_TIME = 5 * 60 * 1000;

type Connected<T> = Extract<T, { configured: true }>;

export type TrackingDashboard = TrackingOverview & TrackingFunnel & TrackingSources;
export type MarketingDashboard = MarketingOverview & MarketingEngagement & MarketingChannels;
export type MetaAdsDashboard =
  | { configured: false; period: ReportPeriod }
  | (Omit<Connected<MetaAdsOverview>, "metadata"> &
      Connected<MetaAdsCampaigns> &
      Omit<Connected<MetaAdsCreatives>, "min_ranking_impressions"> &
      Connected<MetaAdsAudience> & {
        metadata: Connected<MetaAdsOverview>["metadata"] & { min_ranking_impressions: number };
      });

function sectionKey(name: string, section: string, payload: object) {
  return ["analytics", name, section, payload];
}

// One query per API section, surfaced as the single dashboard object the page renders.
function useDashboard<T>(
  name: string,
  payload: object,
  enabled: boolean,
  sections: Record<string, () => Promise<ApiEnvelope<unknown>>>,
  merge: (parts: unknown[]) => T
) {
  return useQueries({
    queries: Object.entries(sections).map(([section, load]) => ({
      queryKey: sectionKey(name, section, payload),
      queryFn: async () => requireApiData(await load()),
      enabled,
      staleTime: STALE_TIME,
    })),
    combine: (results: UseQueryResult<unknown>[]) => {
      const failed = results.find((result) => result.isError);
      const ready = results.every((result) => result.data !== undefined);
      return {
        data: ready ? merge(results.map((result) => result.data)) : undefined,
        isLoading: results.some((result) => result.isLoading),
        isFetching: results.some((result) => result.isFetching),
        isError: !!failed,
        error: (failed?.error ?? null) as Error | null,
        refetch: () => Promise.all(results.map((result) => result.refetch())),
      };
    },
  });
}

export function useTrackingDashboard(payload: TrackingPeriodPayload, enabled: boolean) {
  return useDashboard<TrackingDashboard>(
    "tracking",
    payload,
    enabled,
    {
      overview: () => getTrackingOverview(payload),
      funnel: () => getTrackingFunnel(payload),
      sources: () => getTrackingSources(payload),
    },
    ([overview, funnel, sources]) => ({
      ...(funnel as TrackingFunnel),
      ...(sources as TrackingSources),
      ...(overview as TrackingOverview),
    })
  );
}

// Its own query so a failure stays in this panel; the overview shares the dashboard's cache entry for the traffic share.
export function useAileneReferrals(payload: TrackingPeriodPayload, enabled: boolean) {
  const referrals = useQuery<TrackingAileneReferrals>({
    queryKey: sectionKey("tracking", "ailene-referrals", payload),
    queryFn: async () => requireApiData(await getTrackingAileneReferrals(payload)),
    enabled,
    staleTime: STALE_TIME,
  });
  const overview = useQuery<TrackingOverview>({
    queryKey: sectionKey("tracking", "overview", payload),
    queryFn: async () => requireApiData(await getTrackingOverview(payload)),
    enabled,
    staleTime: STALE_TIME,
  });

  return { referrals, totalSessions: overview.data?.summary.current.sessions ?? null };
}

export function useMarketingDashboard(payload: AnalyticsPeriodPayload, enabled: boolean) {
  return useDashboard<MarketingDashboard>(
    "marketing",
    payload,
    enabled,
    {
      overview: () => getMarketingOverview(payload),
      engagement: () => getMarketingEngagement(payload),
      channels: () => getMarketingChannels(payload),
    },
    ([overview, engagement, channels]) => ({
      ...(engagement as MarketingEngagement),
      ...(channels as MarketingChannels),
      ...(overview as MarketingOverview),
    })
  );
}

export function useMetaAdsDashboard(payload: AnalyticsPeriodPayload, enabled: boolean) {
  return useDashboard<MetaAdsDashboard>(
    "meta-ads",
    payload,
    enabled,
    {
      overview: () => getMetaAdsOverview(payload),
      campaigns: () => getMetaAdsCampaigns(payload),
      creatives: () => getMetaAdsCreatives(payload),
      audience: () => getMetaAdsAudience(payload),
    },
    ([overviewPart, campaignsPart, creativesPart, audiencePart]) => {
      const overview = overviewPart as MetaAdsOverview;
      const campaigns = campaignsPart as MetaAdsCampaigns;
      const creatives = creativesPart as MetaAdsCreatives;
      const audience = audiencePart as MetaAdsAudience;
      if (!overview.configured || !campaigns.configured || !creatives.configured || !audience.configured) {
        return { configured: false, period: overview.period };
      }
      const { min_ranking_impressions, ...creativeRest } = creatives;
      return {
        ...campaigns,
        ...creativeRest,
        ...audience,
        ...overview,
        metadata: { ...overview.metadata, min_ranking_impressions },
      };
    }
  );
}
