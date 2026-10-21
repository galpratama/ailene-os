import type {
  ArticleData,
  ArticleStatus,
  CreateArticlePayload,
  UpdateArticlePayload,
} from "@/apis/articles";
import { SITE_URL } from "@/lib/site";

export const ARTICLE_STATUS_OPTIONS: { value: ArticleStatus; label: string }[] =
  [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "unpublished", label: "Unpublished" },
  ];

// Preserve unchanged HTML, attribution, and timestamp precision when updating article metadata.
export function buildArticleUpdatePayload(
  article: ArticleData,
  values: CreateArticlePayload
): UpdateArticlePayload {
  const original: CreateArticlePayload = {
    title: article.title,
    insight: article.insight,
    image_url: article.image_url,
    body_content: article.body_content,
    status: article.status,
    category_id: article.category.id,
    keywords: article.keywords,
    author_id: article.author.id,
    reviewer_id: article.reviewer.id,
    published_at: article.published_at,
  };
  const changes: UpdateArticlePayload = { id: article.id };
  for (const key of Object.keys(original) as (keyof CreateArticlePayload)[]) {
    if (values[key] !== undefined && values[key] !== original[key]) {
      Object.assign(changes, { [key]: values[key] });
    }
  }
  return changes;
}

// Match the API's slug rules when linking headings from the returned table of contents.
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// The id is what identifies an article; the slug is cosmetic and gets corrected by a redirect.
export function articlePath(slug: string, id: number) {
  return `/articles/${slug}/${id}`;
}

export function articleURL(slug: string, id: number) {
  return `${SITE_URL}${articlePath(slug, id)}`;
}

// Pinned to Jakarta time so the server render and the browser agree on the text.
export function formatArticleDate(
  iso: string,
  options: { withTime?: boolean; locale?: string } = {}
) {
  return new Intl.DateTimeFormat(options.locale ?? "en-GB", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: options.withTime ? "short" : "long",
    year: "numeric",
    ...(options.withTime
      ? { hour: "2-digit", minute: "2-digit", hour12: false }
      : {}),
  }).format(new Date(iso));
}
