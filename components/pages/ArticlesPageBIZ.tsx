import AppButton from "@/components/buttons/AppButton";
import PageMargin from "@/components/layouts/PageMargin";
import FooterBIZ from "@/components/navigations/FooterBIZ";
import HeaderBIZ from "@/components/navigations/HeaderBIZ";
import type { ArticleCategoryData, ArticleListItem } from "@/apis/articles";
import { articlePath, formatArticleDate } from "@/lib/article";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function pageHref(page: number, categoryId: number | null) {
  const params = new URLSearchParams();
  if (categoryId) params.set("category", String(categoryId));
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/articles?${query}` : "/articles";
}

export default function ArticlesPageBIZ({
  articles,
  categories,
  activeCategoryId,
  page,
  totalPages,
}: {
  articles: ArticleListItem[];
  categories: ArticleCategoryData[];
  activeCategoryId: number | null;
  page: number;
  totalPages: number;
}) {
  const chips = [{ id: null as number | null, name: "Semua" }, ...categories];

  return (
    <div className="min-h-screen bg-off text-ink">
      <HeaderBIZ />
      <main>
        <section className="border-b border-ink-line bg-forest-deep text-white">
          <PageMargin className="py-14 sm:py-18">
            <h1 className="max-w-160 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Artikel & insight AI untuk tim kerja
            </h1>
            <p className="mt-4 max-w-150 text-lg leading-relaxed text-white/70">
              Panduan praktis memakai AI di pekerjaan sehari-hari, dari prompt sampai adopsi di level organisasi.
            </p>
          </PageMargin>
        </section>

        <PageMargin className="flex flex-col gap-8 py-10">
          {categories.length > 0 && (
            <nav aria-label="Kategori artikel" className="flex flex-wrap gap-2">
              {chips.map((chip) => {
                const isActive = chip.id === activeCategoryId;
                return (
                  <Link
                    key={chip.id ?? "all"}
                    href={pageHref(1, chip.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                      isActive
                        ? "border-biz-forest bg-biz-forest text-white"
                        : "border-biz-line bg-white text-ink-soft hover:text-ink"
                    }`}
                  >
                    {chip.name}
                  </Link>
                );
              })}
            </nav>
          )}

          {articles.length === 0 ? (
            <p className="py-16 text-center text-ink-soft">Belum ada artikel di sini.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={articlePath(article.slug_url, article.id)}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-biz-line bg-white"
                >
                  <div className="relative aspect-video overflow-hidden bg-biz-panel">
                    <Image
                      src={article.image_url}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <span className="text-xs font-semibold text-claude">{article.category.name}</span>
                    <h2 className="line-clamp-2 text-lg font-bold leading-snug group-hover:underline">
                      {article.title}
                    </h2>
                    <p className="line-clamp-3 text-sm leading-relaxed text-ink-soft">{article.insight}</p>
                    <p className="mt-auto pt-2 text-xs text-ink-soft">
                      {article.author.full_name} ·{" "}
                      {formatArticleDate(article.published_at, { locale: "id-ID" })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              {page > 1 && (
                <AppButton variant="white" size="md" href={pageHref(page - 1, activeCategoryId)}>
                  <ArrowLeft size={15} />
                  Sebelumnya
                </AppButton>
              )}
              <span className="text-sm text-ink-soft">
                Halaman {page} dari {totalPages}
              </span>
              {page < totalPages && (
                <AppButton variant="white" size="md" href={pageHref(page + 1, activeCategoryId)}>
                  Berikutnya
                  <ArrowRight size={15} />
                </AppButton>
              )}
            </div>
          )}
        </PageMargin>
      </main>
      <FooterBIZ />
    </div>
  );
}
