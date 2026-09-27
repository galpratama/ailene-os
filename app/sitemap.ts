import { listPublishedArticles, type ArticleListItem } from "@/apis/articles";
import { articleURL } from "@/lib/article";
import { SITE_URL } from "@/lib/site";
import type { MetadataRoute } from "next";

// Bumped manually: a build-time date would claim every page changed on every deploy.
const CONTENT_UPDATED_AT = new Date("2026-09-28");

const ARTICLE_PAGE_SIZE = 100;

// Walks every page of published articles; an API failure leaves them out rather than failing the sitemap.
async function publishedArticles(): Promise<ArticleListItem[]> {
  const articles: ArticleListItem[] = [];
  try {
    for (let page = 1; ; page++) {
      const result = await listPublishedArticles({ page, page_size: ARTICLE_PAGE_SIZE });
      if (!result.data) break;
      articles.push(...result.data.list);
      if (page >= result.data.metapaging.total_page) break;
    }
  } catch {
    // Missing CLIENT_SECRET/BASE_URL (e.g. at build) — serve the static entries only.
  }
  return articles;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await publishedArticles();

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
    {
      url: `${SITE_URL}/articles`,
      lastModified: articles[0] ? new Date(articles[0].published_at) : CONTENT_UPDATED_AT,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...articles.map((article) => ({
      url: articleURL(article.slug_url, article.id),
      lastModified: new Date(article.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
