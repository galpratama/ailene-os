import type { ArticleListItem } from "@/apis/articles";
import { articlePath, formatArticleDate } from "@/lib/article";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ArticleCardBIZ({ article, featured = false }: { article: ArticleListItem; featured?: boolean }) {
  return (
    <Link
      href={articlePath(article.slug_url, article.id)}
      className={`group overflow-hidden rounded-2xl border border-biz-line bg-white transition-[border-color,box-shadow] hover:border-biz-forest-light/40 hover:shadow-[0_18px_45px_-30px_rgb(1_30_22/0.35)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-biz-forest ${featured ? "grid md:grid-cols-2" : "flex h-full flex-col"}`}
    >
      <div className={`relative overflow-hidden bg-biz-sage ${featured ? "min-h-65 md:min-h-100" : "aspect-video"}`}>
        <Image
          src={article.image_url}
          alt={article.title}
          fill
          priority={featured}
          sizes={featured ? "(min-width: 768px) 45vw, 100vw" : "(min-width: 1024px) 30vw, (min-width: 640px) 48vw, 100vw"}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className={`flex min-w-0 flex-1 flex-col ${featured ? "justify-center p-6 sm:p-9 lg:p-12" : "p-5 sm:p-6"}`}>
        <p className="text-xs font-semibold tracking-[0.1em] text-biz-forest-light uppercase">{article.category.name}</p>
        <h3 className={`mt-3 font-medium tracking-[-0.04em] text-biz-forest text-balance ${featured ? "text-[clamp(1.8rem,3.2vw,3rem)] leading-[1.08]" : "text-[22px] leading-[1.16]"}`}>
          {article.title}
        </h3>
        <p className={`mt-3 leading-[1.7] text-biz-copy ${featured ? "line-clamp-3 text-base" : "line-clamp-2 text-sm"}`}>{article.insight}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <p className="text-xs leading-relaxed text-biz-muted">
            {article.author.full_name} <span aria-hidden="true">·</span>{" "}
            <time dateTime={article.published_at}>{formatArticleDate(article.published_at, { locale: "id-ID" })}</time>
          </p>
          <ArrowUpRight size={20} aria-hidden="true" className="shrink-0 text-biz-forest transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}
