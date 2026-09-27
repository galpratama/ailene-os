import type { ArticleStatus } from "@/apis/articles";
import { SITE_URL } from "@/lib/site";

export const ARTICLE_STATUS_OPTIONS: { value: ArticleStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "unpublished", label: "Unpublished" },
];

// Same rule as the API's ArticleContent.slugify, so sub-heading anchors match the table-of-contents ids it returns.
export function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// The id is what identifies an article; the slug is cosmetic and gets corrected by a redirect.
export function articlePath(slug: string, id: number) {
  return `/articles/${slug}/${id}`;
}

export function articleURL(slug: string, id: number) {
  return `${SITE_URL}${articlePath(slug, id)}`;
}

// Pinned to Jakarta time so the server render and the browser agree on the text.
export function formatArticleDate(iso: string, options: { withTime?: boolean; locale?: string } = {}) {
  return new Intl.DateTimeFormat(options.locale ?? "en-GB", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: options.withTime ? "short" : "long",
    year: "numeric",
    ...(options.withTime ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}),
  }).format(new Date(iso));
}
