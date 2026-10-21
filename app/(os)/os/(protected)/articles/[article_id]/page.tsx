import { getArticleDetails, listArticleCategories } from "@/apis/articles";
import { listUsers } from "@/apis/users";
import ArticleEditorPageOS from "@/components/pages/ArticleEditorPageOS";
import { isSuccessStatus } from "@/lib/status_code";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ article_id: string }>;
}) {
  const { article_id } = await params;
  const articleId = Number(article_id);
  if (!Number.isInteger(articleId) || articleId < 1) notFound();

  const [article, categories, users] = await Promise.all([
    getArticleDetails(articleId),
    listArticleCategories({ page: 1, page_size: 100 }),
    // Offer active staff as new choices; the editor retains the article's current attribution too.
    listUsers({ page: 1, page_size: 100, status: "active" }),
  ]);
  if (!isSuccessStatus(article.status) || !article.data) notFound();

  return (
    <ArticleEditorPageOS
      article={article.data}
      categories={categories.data?.list ?? []}
      users={users.data?.list ?? []}
    />
  );
}
