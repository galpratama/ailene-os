import { urlsetResponse } from "@/lib/sitemap";

const CONTENT_UPDATED_AT = new Date("2026-09-28");

// Stable public pages; dynamic article URLs belong in the dedicated articles sitemap.
export function GET() {
  return urlsetResponse([
    { path: "/", lastModified: CONTENT_UPDATED_AT },
    { path: "/articles", lastModified: CONTENT_UPDATED_AT },
    { path: "/join-trainer", lastModified: CONTENT_UPDATED_AT },
  ]);
}
