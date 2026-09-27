import AppButton from "@/components/buttons/AppButton";
import PageMargin from "@/components/layouts/PageMargin";
import FooterBIZ from "@/components/navigations/FooterBIZ";
import HeaderBIZ from "@/components/navigations/HeaderBIZ";
import type { ArticleData, ArticleListItem } from "@/apis/articles";
import { articlePath, articleURL, formatArticleDate, slugify } from "@/lib/article";
import { WHATSAPP_URL } from "@/lib/site";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
    return (
      <Image
        src={avatar}
        alt={name}
        width={40}
        height={40}
        className="size-10 rounded-full object-cover"
      />
    );
  }
  return (
    <span className="flex size-10 items-center justify-center rounded-full bg-biz-mint text-sm font-bold text-biz-forest">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export default function ArticleDetailsPageBIZ({
  article,
  related,
}: {
  article: ArticleData;
  related: ArticleListItem[];
}) {
  const url = articleURL(article.slug_url, article.id);
  // The summary is written as a few sentences; each becomes one bullet, as on the Sevenpreneur insights.
  const summary = article.insight
    .split(/\.\s+/)
    .map((sentence) => sentence.trim().replace(/\.$/, ""))
    .filter(Boolean);
  const toc = article.table_of_contents.filter((entry) => entry.level > 1);

  return (
    <div className="min-h-screen bg-off text-ink">
      <HeaderBIZ />
      <main>
        <PageMargin className="flex flex-col gap-10 py-10 lg:flex-row lg:gap-14 lg:py-14">
          <article className="flex min-w-0 flex-[2.5] flex-col gap-6">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-ink-soft">
              <Link href="/" className="hover:text-ink">Home</Link>
              <span>/</span>
              <Link href="/articles" className="hover:text-ink">Artikel</Link>
              <span>/</span>
              <Link href={`/articles?category=${article.category.id}`} className="hover:text-ink">
                {article.category.name}
              </Link>
            </nav>

            <div className="flex flex-col gap-4">
              <span className="w-fit rounded-full bg-biz-mint px-3 py-1 text-sm font-semibold text-biz-forest">
                {article.category.name}
              </span>
              <h1
                id={slugify(article.title)}
                className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl"
              >
                {article.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-y border-ink-line py-3 text-sm text-ink-soft">
              <AuthorAvatar name={article.author.full_name} avatar={article.author.avatar} />
              <span className="font-semibold text-ink">{article.author.full_name}</span>
              <span>·</span>
              <time dateTime={article.published_at}>
                {formatArticleDate(article.published_at, { locale: "id-ID" })}
              </time>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {article.reading_time} menit baca
              </span>
            </div>

            <div className="relative aspect-video overflow-hidden rounded-2xl bg-biz-panel">
              <Image
                src={article.image_url}
                alt={article.title}
                fill
                priority
                className="object-cover"
              />
            </div>

            <section className="rounded-2xl border border-biz-line bg-biz-panel-soft p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-biz-forest">
                <Sparkles size={18} />
                Ringkasan Artikel
              </h2>
              <ul className="mt-3 flex list-outside list-disc flex-col gap-1.5 pl-5 text-base leading-relaxed text-biz-copy">
                {summary.map((sentence) => (
                  <li key={sentence}>{sentence}.</li>
                ))}
              </ul>
            </section>

            {article.body_content.map((section) => (
              <section key={section.index_order} className="flex scroll-mt-24 flex-col gap-3">
                {section.sub_heading && (
                  <h2
                    id={slugify(section.sub_heading)}
                    className="scroll-mt-24 pt-2 text-2xl font-bold leading-snug"
                  >
                    {section.sub_heading}
                  </h2>
                )}
                {section.image_path && (
                  <figure className="flex flex-col gap-2 py-2">
                    <Image
                      src={section.image_path}
                      alt={section.image_desc ?? section.sub_heading ?? article.title}
                      width={1200}
                      height={675}
                      className="w-full rounded-xl object-cover"
                    />
                    {section.image_desc && (
                      <figcaption className="text-sm text-ink-soft">{section.image_desc}</figcaption>
                    )}
                  </figure>
                )}
                {section.content && (
                  <div
                    className="article-prose text-[17px] text-biz-copy"
                    // Sanitized by the API on save (tag/attribute allowlist, no scripts or event handlers).
                    dangerouslySetInnerHTML={{ __html: section.content }}
                  />
                )}
              </section>
            ))}

            <div className="flex flex-wrap items-center gap-3 border-t border-ink-line pt-6">
              <span className="text-sm font-semibold">Bagikan</span>
              {shareLinks(article.title, url).map((link) => (
                <AppButton key={link.label} variant="white" size="sm" href={link.href}>
                  {link.label}
                </AppButton>
              ))}
            </div>
          </article>

          <aside className="flex flex-1 flex-col gap-5 lg:max-w-80">
            <div className="flex flex-col gap-5 lg:sticky lg:top-24">
              {toc.length > 0 && (
                <nav
                  aria-label="Daftar isi"
                  className="rounded-2xl border border-biz-line bg-white p-5"
                >
                  <h2 className="text-base font-bold text-biz-forest">Daftar Isi</h2>
                  <ol className="mt-3 flex flex-col gap-1 border-l border-biz-line">
                    {toc.map((entry) => (
                      <li key={`${entry.id}-${entry.name}`}>
                        <a
                          href={`#${entry.id}`}
                          className={`block py-1 pr-2 text-sm leading-snug text-ink-soft hover:text-ink ${entry.level > 2 ? "pl-7" : "pl-4"}`}
                        >
                          {entry.name}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              <div className="rounded-2xl bg-biz-forest p-5 text-white">
                <p className="text-lg font-bold leading-snug">
                  Mau tim kamu benar-benar memakai AI di pekerjaan sehari-hari?
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Ailene membantu organisasi dari AI training sampai adopsi yang terukur.
                </p>
                <AppButton variant="lime" size="md" href={WHATSAPP_URL} className="mt-4 w-full justify-center">
                  Konsultasi gratis
                  <ArrowRight size={15} />
                </AppButton>
              </div>
            </div>
          </aside>
        </PageMargin>

        {related.length > 0 && (
          <section className="border-t border-ink-line bg-white py-12">
            <PageMargin className="flex flex-col gap-6">
              <h2 className="text-2xl font-extrabold">Artikel lainnya</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={articlePath(item.slug_url, item.id)}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-biz-line bg-off"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col gap-2 p-4">
                      <span className="text-xs font-semibold text-claude">{item.category.name}</span>
                      <h3 className="line-clamp-2 font-bold leading-snug group-hover:underline">
                        {item.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </PageMargin>
          </section>
        )}
      </main>
      <FooterBIZ />
    </div>
  );
}
