import { SITE_URL } from "@/lib/site";
import type { MetadataRoute } from "next";

// Bumped manually: a build-time date would claim every page changed on every deploy.
const CONTENT_UPDATED_AT = new Date("2026-09-04");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: CONTENT_UPDATED_AT,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/join-trainer`,
      lastModified: CONTENT_UPDATED_AT,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
