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
  getTrackingFunnel,
  getTrackingOverview,
  getTrackingSources,
} from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { useQueries, type UseQueryResult } from "@tanstack/react-query";

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

// One query per API section, surfaced as the single dashboard object the page renders.
function useDashboard<T>(
  name: string,
  payload: object,
  enabled: boolean,
  sections: (() => Promise<ApiEnvelope<unknown>>)[],
  merge: (parts: unknown[]) => T
) {
  return useQueries({
    queries: sections.map((load, index) => ({
      queryKey: ["analytics", name, index, payload],
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
    [
      () => getTrackingOverview(payload),
      () => getTrackingFunnel(payload),
      () => getTrackingSources(payload),
    ],
    ([overview, funnel, sources]) => ({
      ...(funnel as TrackingFunnel),
      ...(sources as TrackingSources),
      ...(overview as TrackingOverview),
    })
  );
}

export function useMarketingDashboard(payload: AnalyticsPeriodPayload, enabled: boolean) {
  return useDashboard<MarketingDashboard>(
    "marketing",
    payload,
    enabled,
    [
      () => getMarketingOverview(payload),
      () => getMarketingEngagement(payload),
      () => getMarketingChannels(payload),
    ],
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
    [
      () => getMetaAdsOverview(payload),
      () => getMetaAdsCampaigns(payload),
      () => getMetaAdsCreatives(payload),
      () => getMetaAdsAudience(payload),
    ],
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
