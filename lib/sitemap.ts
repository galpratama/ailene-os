import "server-only";

import { SITE_URL } from "@/lib/site";

export type SitemapUrl = {
  path: string;
  lastModified?: string | Date;
  images?: string[];
};

export type SitemapFile = {
  path: string;
  lastModified?: string | Date;
};

const PAGE_SIZE = 100;
const MAX_PAGES = 200;

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path}`;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function lastmodTag(value?: string | Date) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : `<lastmod>${date.toISOString()}</lastmod>`;
}

// Walk every public list page so the articles sitemap never stops at the API's page-size limit.
export async function collectPages<T>(
  fetchPage: (page: number, pageSize: number) => Promise<{ list: T[]; totalPage: number }>,
): Promise<T[]> {
  const first = await fetchPage(1, PAGE_SIZE);
  const totalPage = Math.min(first.totalPage, MAX_PAGES);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, totalPage - 1) }, (_, index) =>
      fetchPage(index + 2, PAGE_SIZE),
    ),
  );
  return [first, ...rest].flatMap((page) => page.list);
}

function xmlResponse(xml: string) {
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

export function urlsetResponse(urls: SitemapUrl[]) {
  const body = urls
    .map((url) => {
      const images = (url.images ?? [])
        .map((image) => `<image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`)
        .join("");
      return `<url><loc>${escapeXml(absoluteUrl(url.path))}</loc>${lastmodTag(url.lastModified)}${images}</url>`;
    })
    .join("");

  return xmlResponse(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${body}</urlset>`,
  );
}

export function sitemapIndexResponse(files: SitemapFile[]) {
  const body = files
    .map((file) => `<sitemap><loc>${escapeXml(absoluteUrl(file.path))}</loc>${lastmodTag(file.lastModified)}</sitemap>`)
    .join("");

  return xmlResponse(
    `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>`,
  );
}
