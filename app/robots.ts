import { SITE_URL } from "@/lib/site";
import type { MetadataRoute } from "next";
import { headers } from "next/headers";

// Retrieval bots fetch a page to cite it, so letting them in is how we show up.
const AI_SEARCH_BOTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Claude-User",
  "Google-Extended",
  "Applebot-Extended",
];

// Training-only crawlers: no retrieval benefit, so they stay out.
const AI_TRAINING_BOTS = [
  "GPTBot",
  "CCBot",
  "ClaudeBot",
  "anthropic-ai",
  "Bytespider",
  "Meta-ExternalAgent",
  "Amazonbot",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host") ?? "";
  const isMarketingHost = !host.startsWith("os.") && !host.startsWith("api.");

  if (!isMarketingHost) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/auth/"] },
      ...AI_SEARCH_BOTS.map((userAgent) => ({ userAgent, allow: "/" })),
      ...AI_TRAINING_BOTS.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
