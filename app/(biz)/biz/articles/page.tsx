import { listActiveArticleCategories, listPublishedArticles } from "@/apis/articles";
import ArticlesPageBIZ from "@/components/pages/ArticlesPageBIZ";
import JsonLd from "@/components/seo/JsonLd";
import { articlesIndexGraph } from "@/lib/structured-data";
import type { Metadata } from "next";

const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: "Artikel — Insight AI untuk Tim Kerja",
  description:
    "Artikel dan panduan praktis Ailene tentang memakai AI di pekerjaan sehari-hari, prompt engineering, dan adopsi AI di organisasi.",
  alternates: { canonical: "/articles" },
  openGraph: {
    url: "/articles",
    title: "Artikel Ailene",
    description: "Panduan praktis memakai AI di pekerjaan sehari-hari.",
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const categoryId = Number(params.category) || null;
  const page = Math.max(Number(params.page) || 1, 1);

  const [articles, categories] = await Promise.all([
    listPublishedArticles({
      page,
      page_size: PAGE_SIZE,
      category_id: categoryId ?? undefined,
    }),
    listActiveArticleCategories(),
  ]);

  return (
    <>
      <JsonLd graph={articlesIndexGraph()} />
      <ArticlesPageBIZ
        articles={articles.data?.list ?? []}
        categories={categories.data?.list ?? []}
        activeCategoryId={categoryId}
        page={page}
        totalPages={articles.data?.metapaging.total_page ?? 1}
      />
    </>
  );
}
