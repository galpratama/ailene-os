import { listArticleCategories } from "@/apis/articles";
import { listUsers } from "@/apis/users";
import ArticleEditorPageOS from "@/components/pages/ArticleEditorPageOS";

export default async function Page() {
  const [categories, users] = await Promise.all([
    listArticleCategories({ page: 1, page_size: 100 }),
    listUsers({ page: 1, page_size: 100, status: "ACTIVE" }),
  ]);

  return (
    <ArticleEditorPageOS
      article={null}
      categories={categories.data?.list ?? []}
      users={users.data?.list ?? []}
    />
  );
}
