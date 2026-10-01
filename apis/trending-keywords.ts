import "server-only";

import { callApi, type ApiEnvelope, type ApiList } from "./api";
import { getSessionToken } from "./session";

export type TrendingKeywordKind = "rising" | "top";

export type TrendingKeywordData = {
  id: number;
  captured_on: string;
  seed_keyword: string;
  keyword: string;
  kind: TrendingKeywordKind;
  rank: number;
  // Rising: growth percentage (Breakout carries Google's large value). Top: relative interest 0-100.
  score: number;
  score_label: string;
  created_at: string;
};

export type ListTrendingKeywordsOptions = {
  // YYYY-MM-DD in Asia/Jakarta; omitted means the most recent capture day.
  captured_on?: string;
  seed_keyword?: string;
  kind?: TrendingKeywordKind;
  keyword?: string;
  page?: number;
  page_size?: number;
};

export type TrendingKeywordsRefreshResult = {
  captured_on: string;
  keyword_count: number;
  captured_seeds: string[];
  failed_seeds: string[];
};

export async function listTrendingKeywords(
  options: ListTrendingKeywordsOptions = {}
): Promise<ApiEnvelope<ApiList<TrendingKeywordData>>> {
  return callApi("/api/v1/trending-keywords", {
    token: await getSessionToken(),
    body: options,
  });
}

// Administrator only; spends one SerpApi search per seed from the monthly quota.
export async function refreshTrendingKeywords(): Promise<
  ApiEnvelope<TrendingKeywordsRefreshResult>
> {
  return callApi("/api/v1/trending-keywords/refresh", {
    token: await getSessionToken(),
  });
}
