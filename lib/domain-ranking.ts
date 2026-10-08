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
