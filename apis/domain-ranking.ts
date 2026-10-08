import "server-only";

import { callApi, type ApiEnvelope, type ApiList } from "./api";
import { getSessionToken } from "./session";

export type RankingSource = "tranco" | "majestic" | "crux" | "radar";
export type RankPosition = { rank: number | null; rank_bucket: number | null };
export type SourceData = {
  id: RankingSource | "openpagerank";
  name: string;
  kind: "rank" | "bucket" | "score";
  url: string;
  update_frequency: "daily" | "monthly";
  lists: { country: string; as_of_date: string }[];
  last_run: { status: "running" | "success" | "failed"; started_at: string; finished_at: string | null; rows_loaded: number | null } | null;
  last_success_at: string | null;
};
export type RankingEntry = RankPosition & { domain: string };
export type RankingResult = {
  source: RankingSource;
  country: string;
  as_of_date: string | null;
  list: RankingEntry[];
  next_cursor: string | null;
};
export type RankingOptions = {
  source: RankingSource;
  country?: string;
  q?: string;
  tld?: string;
  limit?: number;
  cursor?: string;
};
export type DomainOverview = {
  domain: string;
  registrable_domain: string;
  tld: string;
  is_tracked: boolean;
  first_seen_at: string | null;
  ranks: (RankPosition & { source: RankingSource; country: string; as_of_date: string })[];
  authority: { source: string; score: number; date: string }[];
  composite: { score: number; components: Record<string, number>; date: string } | null;
  tracked_keywords: number;
};
export type DomainHistory = {
  domain: string;
  start_date: string;
  end_date: string;
  ranks: { source: RankingSource; country: string; points: (RankPosition & { date: string })[] }[];
  authority: { source: string; points: { date: string; score: number }[] }[];
  composite: { date: string; score: number }[];
};
export type TrackedDomain = {
  domain: string;
  // Older API deployments omit this field until the rank endpoint is rolled out.
  tracked_rank?: number | null;
  tld: string;
  first_seen_at: string | null;
  composite_score: number | null;
  composite_date: string | null;
  authority_score: number | null;
  tranco_rank: number | null;
  crux_bucket: number | null;
  tracked_keywords: number;
};
export type TrackedOptions = {
  q?: string;
  tld?: string;
  sort?: "composite" | "authority" | "tranco" | "crux" | "domain" | "newest";
  page?: number;
  page_size?: number;
};

async function post<T>(path: string, body?: unknown): Promise<ApiEnvelope<T>> {
  return callApi(path, { token: await getSessionToken(), ...(body === undefined ? {} : { body }) });
}

export function listRankingSources() {
  return post<ApiList<SourceData>>( "/api/v1/domain-ranking/sources");
}

export function listDomainRankings(options: RankingOptions) {
  return post<RankingResult>("/api/v1/domain-ranking/rankings", options);
}

export function getDomainOverview(domain: string) {
  return post<DomainOverview>("/api/v1/domain-ranking/domains/details", { domain });
}

export function getDomainHistory(domain: string) {
  return post<DomainHistory>("/api/v1/domain-ranking/domains/history", { domain });
}

export function compareDomains(domains: string[]) {
  return post<ApiList<{ domain: string; found: boolean; overview: DomainOverview | null }>>(
    "/api/v1/domain-ranking/domains/compare", { domains }
  );
}

export function listTrackedDomains(options: TrackedOptions = {}) {
  return post<ApiList<TrackedDomain>>( "/api/v1/domain-ranking/tracked", options);
}
