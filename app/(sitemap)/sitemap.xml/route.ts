import { sitemapIndexResponse } from "@/lib/sitemap";

// Each content type has its own live sitemap, so a new published article does not wait for a deploy.
export function GET() {
  return sitemapIndexResponse([
    { path: "/basic/sitemap.xml" },
    { path: "/articles/sitemap.xml" },
  ]);
}
