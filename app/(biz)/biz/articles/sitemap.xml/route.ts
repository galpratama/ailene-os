import { listPublishedArticles } from "@/apis/articles";
import { articlePath } from "@/lib/article";
import { collectPages, urlsetResponse } from "@/lib/sitemap";

// This route fetches on request rather than becoming a build-time snapshot of the article catalog.
export const dynamic = "force-dynamic";

export async function GET() {
  const articles = await collectPages(async (page, pageSize) => {
    const result = await listPublishedArticles({ page, page_size: pageSize });
    return {
      list: result.data?.list ?? [],
      totalPage: result.data?.metapaging.total_page ?? 1,
    };
  });

  return urlsetResponse(
    articles.map((article) => ({
      path: articlePath(article.slug_url, article.id),
      lastModified: article.updated_at,
      images: article.image_url ? [article.image_url] : undefined,
    }))
  );
}
