import type { ArticleCategoryData, ArticleListItem } from "@/apis/articles";
import AppButton from "@/components/buttons/AppButton";
import ArticleCardBIZ from "@/components/elements/ArticleCardBIZ";
import HeroGlowV2BIZ from "@/components/heroes/HeroGlowV2BIZ";
import PageMargin from "@/components/layouts/PageMargin";
import FooterHomeBIZ from "@/components/navigations/FooterHomeBIZ";
import HeaderV2BIZ from "@/components/navigations/HeaderV2BIZ";
import { BIZ_ARTICLE_PAGE_SIZE } from "@/lib/article";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
  const chips = [{ id: null as number | null, name: "Semua artikel" }, ...categories];
  // Full API pages leave twelve cards after the lead; shorter last pages use the grid only.
  const featured = articles.length === BIZ_ARTICLE_PAGE_SIZE ? articles[0] : null;
  const remaining = featured ? articles.slice(1) : articles;

  return (
    <div className="min-h-screen bg-biz-paper text-biz-ink">
      <HeaderV2BIZ page="articles" />
      <main>
        <section className="relative isolate overflow-hidden bg-biz-paper-end py-16 sm:py-22">
          <HeroGlowV2BIZ />
          <PageMargin className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:items-end lg:gap-16">
            <div>
              <p className="text-sm font-medium text-biz-forest-light">Wawasan / Artikel</p>
              <h1 className="mt-4 max-w-190 text-[clamp(2.8rem,5.8vw,5.25rem)] leading-[0.94] font-medium tracking-[-0.065em] text-balance text-biz-forest">
                Ide AI yang bisa dibawa ke pekerjaan.
              </h1>
            </div>
            <p className="max-w-125 text-base leading-[1.7] text-biz-copy sm:text-lg">
              Panduan praktis untuk memakai AI dengan lebih cerdas dan aman, dari tugas harian sampai adopsi di seluruh tim.
            </p>
          </PageMargin>
        </section>

        <section aria-labelledby="article-list-title" className="bg-biz-paper py-12 sm:py-18">
          <PageMargin>
            <div className="flex flex-col gap-5 border-b border-biz-line pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-medium text-biz-forest-light">Jelajahi wawasan</p>
                <h2 id="article-list-title" className="mt-2 text-[clamp(1.9rem,3.5vw,2.8rem)] leading-tight font-medium tracking-[-0.05em] text-biz-forest">
                  {activeCategoryId ? categories.find((category) => category.id === activeCategoryId)?.name ?? "Artikel" : "Artikel terbaru"}
                </h2>
              </div>
              {totalPages > 1 && <p className="text-sm text-biz-muted">Halaman {page} dari {totalPages}</p>}
            </div>

            {categories.length > 0 && (
              <nav aria-label="Kategori artikel" className="mt-6 flex flex-wrap gap-2">
                {chips.map((chip) => {
                  const isActive = chip.id === activeCategoryId;
                  return (
                    <Link
                      key={chip.id ?? "all"}
                      href={pageHref(1, chip.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-biz-forest ${isActive ? "border-biz-forest bg-biz-forest text-white" : "border-biz-line bg-white text-biz-copy hover:border-biz-forest-light hover:text-biz-forest"}`}
                    >
                      {chip.name}
                    </Link>
                  );
                })}
              </nav>
            )}

            {articles.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-biz-line bg-white px-6 py-16 text-center">
                <h3 className="text-2xl font-medium text-biz-forest">{activeCategoryId ? "Belum ada artikel di kategori ini." : "Belum ada artikel yang terbit."}</h3>
                <p className="mt-2 text-biz-copy">{activeCategoryId ? "Coba lihat semua artikel untuk menemukan topik lain." : "Artikel baru akan muncul di sini setelah terbit."}</p>
                {activeCategoryId && <AppButton href="/articles" variant="forest" size="cta" className="mt-6">Lihat semua artikel</AppButton>}
              </div>
            ) : (
              <div className="mt-8">
                {featured && (
                  <div className="mb-10">
                    <p className="mb-4 text-xs font-semibold tracking-[0.14em] text-biz-muted uppercase">Bacaan utama</p>
                    <ArticleCardBIZ article={featured} featured />
                  </div>
                )}
                {remaining.length > 0 && (
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                    {remaining.map((article) => <ArticleCardBIZ key={article.id} article={article} />)}
                  </div>
                )}
              </div>
            )}

            {totalPages > 1 && (
              <nav aria-label="Halaman artikel" className="mt-12 flex flex-wrap items-center justify-center gap-3">
                {page > 1 && (
                  <AppButton variant="white" size="cta" href={pageHref(page - 1, activeCategoryId)}>
                    <ArrowLeft size={17} aria-hidden="true" /> Sebelumnya
                  </AppButton>
                )}
                <span className="px-2 text-sm text-biz-muted">{page} / {totalPages}</span>
                {page < totalPages && (
                  <AppButton variant="forest" size="cta" href={pageHref(page + 1, activeCategoryId)}>
                    Berikutnya <ArrowRight size={17} aria-hidden="true" />
                  </AppButton>
                )}
              </nav>
            )}
          </PageMargin>
        </section>
      </main>
      <FooterHomeBIZ isHome={false} />
    </div>
  );
}
