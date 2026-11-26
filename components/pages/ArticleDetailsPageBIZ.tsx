import type { ArticleData, ArticleListItem } from "@/apis/articles";
import AppButton from "@/components/buttons/AppButton";
import ArticleCardBIZ from "@/components/elements/ArticleCardBIZ";
import HeroGlowV2BIZ from "@/components/heroes/HeroGlowV2BIZ";
import PageMargin from "@/components/layouts/PageMargin";
import FooterHomeBIZ from "@/components/navigations/FooterHomeBIZ";
import HeaderV2BIZ from "@/components/navigations/HeaderV2BIZ";
import ArticleBodyBIZ from "@/components/pages/ArticleBodyBIZ";
import { articleURL, formatArticleDate, slugify } from "@/lib/article";
import { WHATSAPP_URL } from "@/lib/site";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import { ArrowLeft, ArrowUpRight, Clock } from "lucide-react";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

const articleBodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-article-body",
  display: "swap",
});

function shareLinks(title: string, url: string) {
  const text = encodeURIComponent(`${title}. Baca selengkapnya di ${url}`);
  const encodedUrl = encodeURIComponent(url);
  return [
    { label: "WhatsApp", href: `https://wa.me/?text=${text}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodedUrl}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
  ];
}

function AuthorAvatar({ name, avatar }: { name: string; avatar: string | null }) {
  if (avatar) {
    return <Image src={avatar} alt={name} width={40} height={40} className="size-10 rounded-full object-cover" />;
  }
  return (
    <span className="flex size-10 items-center justify-center rounded-full bg-biz-mint text-sm font-bold text-biz-forest">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export default function ArticleDetailsPageBIZ({ article, related }: { article: ArticleData; related: ArticleListItem[] }) {
  const url = articleURL(article.slug_url, article.id);
  const summary = article.insight
    .split(/\.\s+/)
    .map((sentence) => sentence.trim().replace(/\.$/, ""))
    .filter(Boolean);
  const toc = article.table_of_contents.filter((entry) => entry.level > 1);

  return (
    <div className="min-h-screen bg-biz-paper text-biz-ink [&_[id]]:scroll-mt-24">
      <HeaderV2BIZ page="articles" />
      <main>
        <section className="relative isolate overflow-hidden bg-biz-paper-end pt-7 pb-12 sm:pt-10 sm:pb-18">
          <HeroGlowV2BIZ />
          <PageMargin>
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-biz-muted">
              <Link href="/" className="hover:text-biz-forest">Beranda</Link>
              <span aria-hidden="true">/</span>
              <Link href="/articles" className="hover:text-biz-forest">Artikel</Link>
              <span aria-hidden="true">/</span>
              <span className="text-biz-forest">{article.category.name}</span>
            </nav>

            <div className="mt-10 max-w-225">
              <Link href={`/articles?category=${article.category.id}`} className="inline-flex min-h-9 items-center rounded-full border border-biz-line bg-white px-3 text-xs font-semibold text-biz-forest-light transition-colors hover:border-biz-forest-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-biz-forest">
                {article.category.name}
              </Link>
              <h1 id={slugify(article.title)} className="mt-5 text-[clamp(2.4rem,5.4vw,5rem)] leading-[0.98] font-medium tracking-[-0.065em] text-balance text-biz-forest">
                {article.title}
              </h1>
              <p className="mt-6 max-w-180 text-base leading-[1.7] text-biz-copy sm:text-lg">{article.insight}</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-biz-line pt-5 text-sm text-biz-muted">
                <AuthorAvatar name={article.author.full_name} avatar={article.author.avatar} />
                <span className="font-medium text-biz-forest">{article.author.full_name}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={article.published_at}>{formatArticleDate(article.published_at, { locale: "id-ID" })}</time>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1"><Clock size={15} aria-hidden="true" />{article.reading_time} menit baca</span>
              </div>
            </div>

            <div className="relative mt-9 aspect-video max-h-145 overflow-hidden rounded-2xl bg-biz-sage sm:mt-12">
              <Image src={article.image_url} alt={article.title} fill priority sizes="(min-width: 1280px) 1240px, 100vw" className="object-cover" />
            </div>
          </PageMargin>
        </section>

        <section className="bg-white py-12 sm:py-18">
          <PageMargin className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16">
            <article className="min-w-0 max-w-190">
              {summary.length > 0 && (
                <section className="mb-10 border-l-4 border-biz-lime bg-biz-panel-soft px-5 py-6 sm:px-7">
                  <h2 className="text-xs font-semibold tracking-[0.14em] text-biz-forest-light uppercase">Inti artikel</h2>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-[1.7] text-biz-copy">
                    {summary.map((sentence, index) => <li key={`${sentence}-${index}`}>{sentence}.</li>)}
                  </ul>
                </section>
              )}
              <ArticleBodyBIZ content={article.body_content} className={`${articleBodyFont.variable} article-prose article-prose-biz text-[17px] text-biz-copy`} />
              <div className="mt-10 border-t border-biz-line pt-6">
                <p className="text-sm font-medium text-biz-forest">Bagikan artikel ini</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {shareLinks(article.title, url).map((link) => (
                    <AppButton key={link.label} variant="white" size="md" href={link.href}>{link.label}</AppButton>
                  ))}
                </div>
              </div>
            </article>

            <aside className="lg:sticky lg:top-24">
              {toc.length > 0 && (
                <nav aria-label="Daftar isi" className="border-t border-biz-line pt-5">
                  <h2 className="text-xs font-semibold tracking-[0.14em] text-biz-forest-light uppercase">Di artikel ini</h2>
                  <ol className="mt-4 space-y-1 border-l border-biz-line">
                    {toc.map((entry) => (
                      <li key={`${entry.id}-${entry.name}`}>
                        <a href={`#${entry.id}`} className={`block py-1.5 pr-2 text-sm leading-snug text-biz-copy hover:text-biz-forest focus-visible:outline-2 focus-visible:outline-biz-forest ${entry.level > 2 ? "pl-7" : "pl-4"}`}>
                          {entry.name}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
              <div className="mt-8 rounded-2xl bg-biz-forest p-6 text-white">
                <p className="text-xl leading-snug font-medium tracking-[-0.035em]">Bawa AI ke pekerjaan tim Anda.</p>
                <p className="mt-3 text-sm leading-[1.7] text-white/75">Bahas kebutuhan training dan adopsi AI bersama Ailene.</p>
                <AppButton variant="lime" size="cta" href={WHATSAPP_URL} className="mt-5 w-full justify-center">
                  <IconBrandWhatsapp size={17} aria-hidden="true" /> Konsultasi gratis
                </AppButton>
              </div>
            </aside>
          </PageMargin>
        </section>

        {related.length > 0 && (
          <section className="bg-biz-paper py-14 sm:py-20">
            <PageMargin>
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-biz-forest-light">Lanjut membaca</p>
                  <h2 className="mt-2 text-[clamp(2rem,4vw,3rem)] leading-tight font-medium tracking-[-0.05em] text-biz-forest">Artikel lainnya</h2>
                </div>
                <Link href="/articles" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-biz-forest underline decoration-biz-lime decoration-2 underline-offset-4 hover:decoration-biz-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-biz-forest">
                  Semua artikel <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {related.map((item) => <ArticleCardBIZ key={item.id} article={item} />)}
              </div>
            </PageMargin>
          </section>
        )}
        <div className="bg-biz-paper py-6 text-center">
          <Link href="/articles" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-biz-forest hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-biz-forest">
            <ArrowLeft size={17} aria-hidden="true" /> Kembali ke semua artikel
          </Link>
        </div>
      </main>
      <FooterHomeBIZ isHome={false} />
    </div>
  );
}
