import type { RankPosition, RankingSource } from "@/apis/domain-ranking";

export const RANKING_SOURCE_NAMES: Record<RankingSource, string> = {
  tranco: "Tranco",
  majestic: "Majestic Million",
  crux: "Chrome UX Report",
  radar: "Cloudflare Radar",
};

export function formatRank(value: RankPosition): string {
  if (value.rank !== null) return `#${value.rank.toLocaleString("en-US")}`;
  if (value.rank_bucket !== null) return `Top ${value.rank_bucket.toLocaleString("en-US")}`;
  return "—";
}

export function formatRankingDate(value: string | null): string {
  if (!value) return "No data yet";
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  });
}

export function normalizeDomainLookup(value: string): string {
  const input = value.trim();
  if (!input) return "";
  try {
    return new URL(input.includes("://") ? input : `https://${input}`).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return input.toLowerCase().replace(/^www\./, "");
  }
}

export type RankingDataSourceDoc = {
  // Matches `id` from domain-ranking/sources; Serper has no ingest entry there.
  id: RankingSource | "openpagerank" | "serper";
  name: string;
  provider: string;
  url: string;
  logoDomain?: string;
  collects: string;
  frequency?: string;
  tables: string[];
  usedFor: string[];
  compositeWeight: number | null;
};

// Mirrors the domain-ranking-tool ingest jobs and composite weights.
export const RANKING_DATA_SOURCES: RankingDataSourceDoc[] = [
  {
    id: "tranco",
    name: "Tranco",
    provider: "Public list, no API key",
    url: "https://tranco-list.eu",
    collects: "Daily worldwide rank of the top one million websites.",
    frequency: "Daily",
    tables: ["rank_latest", "rank_history"],
    usedFor: ["35% of the composite score", "Worldwide rank on the domain overview and its trend chart"],
    compositeWeight: 35,
  },
  {
    id: "crux",
    name: "Chrome UX Report",
    provider: "Google BigQuery (GCP)",
    url: "https://developer.chrome.com/docs/crux",
    logoDomain: "cloud.google.com",
    collects: "Website popularity bands based on real Chrome visitors, worldwide and for Indonesia.",
    frequency: "Monthly",
    tables: ["rank_latest (crux)"],
    usedFor: ["25% of the composite score, using Indonesia data when available", "The strongest signal for the Indonesian market"],
    compositeWeight: 25,
  },
  {
    id: "radar",
    name: "Cloudflare Radar",
    provider: "Cloudflare API",
    url: "https://radar.cloudflare.com",
    logoDomain: "radar.cloudflare.com",
    collects: "Exact top 100 ranks worldwide and for Indonesia, plus worldwide popularity bands.",
    frequency: "Daily top 100 · weekly bands",
    tables: ["rank_latest (radar)"],
    usedFor: ["20% of the composite score"],
    compositeWeight: 20,
  },
  {
    id: "openpagerank",
    name: "Open PageRank",
    provider: "Keywords Everywhere",
    url: "https://www.domcop.com/openpagerank",
    logoDomain: "openpagerank.com",
    collects: "Backlink-based authority score from 0 to 10, for tracked domains only.",
    frequency: "Monthly",
    tables: ["authority_scores"],
    usedFor: ["20% of the composite score", "The signal most often available for small websites"],
    compositeWeight: 20,
  },
  {
    id: "majestic",
    name: "Majestic Million",
    provider: "Public list, no API key",
    url: "https://majestic.com/reports/majestic-million",
    logoDomain: "majestic.com",
    collects: "Website rank based on referring backlinks.",
    tables: ["rank_latest (majestic)"],
    usedFor: ["Shown for reference only; not part of the composite score"],
    compositeWeight: null,
  },
  {
    id: "serper",
    name: "Serper",
    provider: "Google Search API",
    url: "https://serper.dev",
    logoDomain: "serper.dev",
    collects: "Google position of each tracked keyword.",
    frequency: "Weekly",
    tables: ["serp_positions"],
    usedFor: ["Comparing keyword positions against competitors", "Discovering competitors", "Not part of the composite score"],
    compositeWeight: null,
  },
];
