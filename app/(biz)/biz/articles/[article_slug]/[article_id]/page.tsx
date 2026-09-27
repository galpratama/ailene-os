import { getPublishedArticle, listPublishedArticles } from "@/apis/articles";
import ArticleDetailsPageBIZ from "@/components/pages/ArticleDetailsPageBIZ";
import JsonLd from "@/components/seo/JsonLd";
import { articlePath } from "@/lib/article";
import { siteProfile } from "@/lib/site";
import { isSuccessStatus } from "@/lib/status_code";
import { articlePageGraph } from "@/lib/structured-data";
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";

interface ArticlePageProps {
  params: Promise<{ article_slug: string; article_id: string }>;
}

// Shared by generateMetadata and the page so one request makes one API call.
const loadArticle = cache(async (rawId: string) => {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) return null;
  const result = await getPublishedArticle(id);
  return isSuccessStatus(result.status) && result.data ? result.data : null;
});

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { article_id } = await params;
  const article = await loadArticle(article_id);

  if (!article) {
    return { title: "Artikel tidak ditemukan", robots: { index: false, follow: false } };
  }

  const path = articlePath(article.slug_url, article.id);
  return {
    title: article.title,
    description: article.insight,
    keywords: article.keywords,
    authors: [{ name: article.author.full_name }],
    publisher: siteProfile.name,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title: article.title,
      description: article.insight,
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      authors: [article.author.full_name],
      section: article.category.name,
      images: [{ url: article.image_url, width: 1200, height: 675, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.insight,
      images: [article.image_url],
    },
  };
}

export default async function Page({ params }: ArticlePageProps) {
  const { article_slug, article_id } = await params;
  const article = await loadArticle(article_id);
  if (!article) notFound();

  // The id is authoritative; a stale or mistyped slug is corrected to the canonical URL.
  if (article_slug !== article.slug_url) {
    permanentRedirect(articlePath(article.slug_url, article.id));
  }

  const related = await listPublishedArticles({ page: 1, page_size: 4 });
  const others = (related.data?.list ?? []).filter((item) => item.id !== article.id).slice(0, 3);

  return (
    <>
      <JsonLd graph={articlePageGraph(article)} />
      <ArticleDetailsPageBIZ article={article} related={others} />
    </>
  );
}
