"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import ArticleCategoryFormOS from "@/components/forms/ArticleCategoryFormOS";
import ArticleStatusLabel from "@/components/labels/ArticleStatusLabel";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import AppPaginationOS from "@/components/navigations/AppPaginationOS";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import type { ArticleCategoryData, ArticleListItem } from "@/apis/articles";
import { deleteArticle } from "@/lib/actions";
import { ARTICLE_STATUS_OPTIONS, articleURL, formatArticleDate } from "@/lib/article";
import { isSuccessStatus } from "@/lib/status_code";
import { ExternalLink, FilePlus, Pencil, Search, Tags, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { showErrorToast } from "@/lib/toast";

const statusOptions: AppSelectOption[] = [
  { value: "", label: "All statuses" },
  ...ARTICLE_STATUS_OPTIONS,
];

export default function ArticlesPageOS({
  articles,
  categories,
  page,
  totalPages,
  initialKeyword,
  initialStatus,
  initialCategory,
  loadError,
}: {
  articles: ArticleListItem[];
  categories: ArticleCategoryData[];
  page: number;
  totalPages: number;
  initialKeyword: string;
  initialStatus: string;
  initialCategory: string;
  loadError: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [deleting, setDeleting] = useState<ArticleListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Adjust state during render when the server hands back a new keyword, rather than syncing in an effect.
  const [seenKeyword, setSeenKeyword] = useState(initialKeyword);
  const [keyword, setKeyword] = useState(initialKeyword);
  if (initialKeyword !== seenKeyword) {
    setSeenKeyword(initialKeyword);
    setKeyword(initialKeyword);
  }

  function pushParams(next: Record<string, string>, resetPage = true) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    if (resetPage) params.set("page", "1");
    startTransition(() => router.push(`?${params.toString()}`));
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (keyword.trim() === initialKeyword) return;
      pushParams({ keyword: keyword.trim() });
    }, 400);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const categoryOptions: AppSelectOption[] = [
    { value: "", label: "All categories" },
    ...categories.map((category) => ({ value: String(category.id), label: category.name })),
  ];

  async function confirmDelete() {
    if (!deleting) return;
    setIsDeleting(true);
    const result = await deleteArticle(deleting.id);
    setIsDeleting(false);
    setDeleting(null);
    if (!isSuccessStatus(result.status)) {
      return showErrorToast(result.message ?? "Failed to delete the article.");
    }
    router.refresh();
  }

  return (
    <div className="px-4 py-6 flex flex-col gap-5 sm:px-8">
      <PageHeaderOS
        title="Articles"
        description="Write and manage the SEO articles published on the Ailene website."
        action={{
          label: "New article",
          icon: FilePlus,
          onClick: () => router.push("/articles/create"),
        }}
      >
        <AppButton variant="outline" size="sm" onClick={() => setIsCategoriesOpen(true)}>
          <Tags size={13} />
          Categories
        </AppButton>
      </PageHeaderOS>

      <div className="flex flex-wrap items-center gap-3">
        <AppInput
          inputId="articles-search"
          icon={<Search size={14} />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search articles by title..."
          className="max-w-full sm:max-w-sm"
        />
        <div className="w-full max-w-48">
          <AppSelect
            selectId="articles-status-filter"
            placeholder="Filter by status"
            value={initialStatus}
            options={statusOptions}
            onChange={(value) => pushParams({ status: (value as string) ?? "" })}
          />
        </div>
        <div className="w-full max-w-52">
          <AppSelect
            selectId="articles-category-filter"
            placeholder="Filter by category"
            value={initialCategory}
            options={categoryOptions}
            onChange={(value) => pushParams({ category: value ? String(value) : "" })}
          />
        </div>
      </div>


      <div
        className={`overflow-hidden rounded-xl border border-line bg-card-bg ${isPending ? "opacity-60" : ""}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-240 text-sm">
            <thead>
              <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-5 py-3">Article</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Author</th>
                <th className="px-5 py-3">Publish date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr
                  key={article.id}
                  className="border-b border-line-soft last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative aspect-video w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-zinc-800">
                        <Image
                          src={article.image_url}
                          alt={article.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-2 font-semibold text-gray-900 dark:text-zinc-100">
                          {article.title}
                        </p>
                        <p className="truncate text-xs text-gray-400">/{article.slug_url}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">
                    {article.category.name}
                  </td>
                  <td className="px-5 py-3.5">
                    <ArticleStatusLabel status={article.status} />
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">
                    {article.author.full_name}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500 dark:text-zinc-400">
                    {formatArticleDate(article.published_at, { withTime: true })}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {article.status === "published" && (
                        <AppButton
                          variant="ghost"
                          size="iconSm"
                          title="View on website"
                          href={articleURL(article.slug_url, article.id)}
                        >
                          <ExternalLink size={13} />
                        </AppButton>
                      )}
                      <AppButton
                        variant="ghost"
                        size="iconSm"
                        title="Edit article"
                        href={`/articles/${article.id}`}
                      >
                        <Pencil size={13} />
                      </AppButton>
                      <AppButton
                        variant="ghost"
                        size="iconSm"
                        title="Delete article"
                        onClick={() => setDeleting(article)}
                      >
                        <Trash2 size={13} />
                      </AppButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {articles.length === 0 && (
            <p
              className={`text-sm text-center py-10 ${loadError ? "text-merah" : "text-gray-400 dark:text-zinc-500"}`}
            >
              {loadError ??
                (initialKeyword ? `No articles found for "${initialKeyword}"` : "No articles yet.")}
            </p>
          )}
        </div>
      </div>

      <AppPaginationOS
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(next) => pushParams({ page: String(next) }, false)}
      />

      <ArticleCategoryFormOS
        categories={categories}
        isOpen={isCategoriesOpen}
        onClose={() => setIsCategoriesOpen(false)}
      />

      <AlertConfirmationOS
        isOpen={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete article?"
        message={`"${deleting?.title ?? ""}" will be permanently deleted. To just hide it from the website, edit it and set the status to Unpublished.`}
        confirmLabel="Delete"
        destructive
        isPending={isDeleting}
      />
    </div>
  );
}
