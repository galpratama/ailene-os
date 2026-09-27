import { listArticleCategories, listArticles, type ArticleStatus } from "@/apis/articles";
import ArticlesPageOS from "@/components/pages/ArticlesPageOS";
import { isSuccessStatus } from "@/lib/status_code";

const PAGE_SIZE = 20;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    keyword?: string;
    status?: string;
    category?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const keyword = params.keyword?.trim() ?? "";
  const status = params.status ?? "";
  const category = params.category ?? "";
  const page = Number(params.page ?? "1") || 1;

  const [articles, categories] = await Promise.all([
    listArticles({
      page,
      page_size: PAGE_SIZE,
      keyword: keyword || undefined,
      status: (status || undefined) as ArticleStatus | undefined,
      category_id: category ? Number(category) : undefined,
    }),
    listArticleCategories({ page: 1, page_size: 100 }),
  ]);

  return (
    <ArticlesPageOS
      articles={articles.data?.list ?? []}
      categories={categories.data?.list ?? []}
      page={page}
      totalPages={articles.data?.metapaging.total_page ?? 1}
      loadError={
        isSuccessStatus(articles.status)
          ? null
          : (articles.message ?? "Failed to load articles.")
      }
      initialKeyword={keyword}
      initialStatus={status}
      initialCategory={category}
    />
  );
}
