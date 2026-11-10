import { CASE_STUDY_PUBLISHED, HUTAMA_KARYA_CASE_PATH } from "@/lib/biz-case-studies";
import { urlsetResponse } from "@/lib/sitemap";

const CONTENT_UPDATED_AT = new Date("2026-09-28");

// Stable public pages; dynamic article URLs belong in the dedicated articles sitemap.
export function GET() {
  return urlsetResponse([
    { path: "/", lastModified: CONTENT_UPDATED_AT },
    { path: "/articles", lastModified: CONTENT_UPDATED_AT },
    { path: "/join-trainer", lastModified: CONTENT_UPDATED_AT },
    { path: "/framework", lastModified: new Date("2026-11-06") },
    { path: "/specialist", lastModified: new Date("2026-11-09") },
    ...(CASE_STUDY_PUBLISHED ? [{ path: HUTAMA_KARYA_CASE_PATH, lastModified: new Date("2026-11-09") }] : []),
  ]);
}
