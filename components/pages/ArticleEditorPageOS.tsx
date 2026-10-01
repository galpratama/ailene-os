"use client";

import AppButton from "@/components/buttons/AppButton";
import AppImageUpload from "@/components/fields/AppImageUpload";
import AppInput from "@/components/fields/AppInput";
import AppRichTextEditor from "@/components/fields/AppRichTextEditor";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import AppTextArea from "@/components/fields/AppTextArea";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import type {
  ArticleCategoryData,
  ArticleData,
  ArticleStatus,
  CreateArticlePayload,
} from "@/apis/articles";
import type { UserEntry } from "@/apis/users";
import { createArticle, updateArticle } from "@/lib/actions";
import { ARTICLE_STATUS_OPTIONS, articleURL } from "@/lib/article";
import { isSuccessStatus } from "@/lib/status_code";
import { userSelectOption } from "@/lib/user-select-option";
import dayjs from "dayjs";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { showErrorToast } from "@/lib/toast";

const COVER_MAX_BYTES = 1024 * 500;
const DATETIME_LOCAL = "YYYY-MM-DDTHH:mm";

// The editor emits "<p></p>" when cleared, so emptiness is judged by the text and images inside.
function isBlankHtml(html: string) {
  return !/<img/i.test(html) && !html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

export default function ArticleEditorPageOS({
  article,
  categories,
  users,
}: {
  article: ArticleData | null;
  categories: ArticleCategoryData[];
  users: UserEntry[];
}) {
  const router = useRouter();
  const isEdit = article !== null;

  const [title, setTitle] = useState(article?.title ?? "");
  const [imageUrl, setImageUrl] = useState(article?.image_url ?? "");
  const [bodyContent, setBodyContent] = useState(article?.body_content ?? "");
  const [insight, setInsight] = useState(article?.insight ?? "");
  // Rendered in the viewer's timezone, which the server doesn't know, so it is filled in after mount.
  const [publishedAt, setPublishedAt] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPublishedAt(dayjs(article?.published_at).format(DATETIME_LOCAL));
  }, [article?.published_at]);
  const [categoryId, setCategoryId] = useState<number | "">(article?.category.id ?? "");
  const [authorId, setAuthorId] = useState(article?.author.id ?? "");
  const [reviewerId, setReviewerId] = useState(article?.reviewer.id ?? "");
  const [keywords, setKeywords] = useState(article?.keywords ?? "");
  const [slugUrl, setSlugUrl] = useState(article?.slug_url ?? "");
  const [status, setStatus] = useState<ArticleStatus>(article?.status ?? "draft");

  const [submitting, setSubmitting] = useState<ArticleStatus | null>(null);

  const categoryOptions: AppSelectOption[] = categories.map((category) => ({
    value: category.id,
    label: category.status === "active" ? category.name : `${category.name} (inactive)`,
  }));
  const userOptions: AppSelectOption[] = users.map(userSelectOption);

  function validate(): string | null {
    if (!title.trim()) return "Title is required.";
    if (!imageUrl) return "Cover image is required.";
    if (!insight.trim()) return "Content summary is required.";
    if (!publishedAt) return "Publish date is required.";
    if (categoryId === "") return "Category is required.";
    if (!authorId) return "Author is required.";
    if (!reviewerId) return "Reviewer is required.";
    if (!keywords.trim()) return "Keywords are required.";
    if (isBlankHtml(bodyContent)) return "Body content is required.";
    return null;
  }

  async function save(nextStatus: ArticleStatus) {
    const problem = validate();
    if (problem) return showErrorToast(problem);
    setSubmitting(nextStatus);

    const payload: CreateArticlePayload = {
      title: title.trim(),
      insight: insight.trim(),
      image_url: imageUrl,
      body_content: bodyContent,
      status: nextStatus,
      category_id: categoryId as number,
      keywords: keywords.trim(),
      author_id: authorId,
      reviewer_id: reviewerId,
      slug_url: slugUrl.trim() || null,
      published_at: dayjs(publishedAt).toISOString(),
    };

    const result = isEdit
      ? await updateArticle({ ...payload, id: article.id })
      : await createArticle(payload);
    setSubmitting(null);

    if (!isSuccessStatus(result.status)) {
      return showErrorToast(result.message ?? "Failed to save the article.");
    }

    router.push("/articles");
    router.refresh();
  }

  return (
    <div className="px-4 py-6 flex flex-col gap-5 sm:px-8">
      <PageHeaderOS
        title={isEdit ? "Edit article" : "New article"}
        description="Write an SEO article for the Ailene website: optimize the title, summary, keywords, and structure."
      >
        <AppButton variant="ghost" size="sm" href="/articles">
          <ArrowLeft size={13} />
          Back
        </AppButton>
        {isEdit ? (
          <AppButton
            variant="primary"
            size="sm"
            disabled={submitting !== null}
            onClick={() => save(status)}
          >
            {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            Save changes
          </AppButton>
        ) : (
          <>
            <AppButton
              variant="outline"
              size="sm"
              disabled={submitting !== null}
              onClick={() => save("draft")}
            >
              {submitting === "draft" && <Loader2 size={13} className="animate-spin" />}
              Save as draft
            </AppButton>
            <AppButton
              variant="primary"
              size="sm"
              disabled={submitting !== null}
              onClick={() => save("published")}
            >
              {submitting === "published" ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Send size={13} />
              )}
              Publish
            </AppButton>
          </>
        )}
      </PageHeaderOS>


      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <main className="flex min-w-0 flex-2 flex-col gap-5">
          <AppInput
            inputId="article-title"
            label="Title"
            required
            characterLength={255}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Write the article title..."
            className="text-base font-semibold"
          />
          <div className="w-full xl:w-3/5">
            <AppImageUpload
              inputId="article-cover"
              label="Cover image"
              required
              value={imageUrl}
              onChange={setImageUrl}
              folderPath="articles"
              maxBytes={COVER_MAX_BYTES}
              maxSizeLabel="500 KB"
              aspectRatio="16/9"
            />
          </div>

          <AppRichTextEditor
            editorId="article-body-content"
            label="Body content"
            required
            value={bodyContent}
            onChange={setBodyContent}
          />
        </main>

        <aside className="flex flex-1 flex-col gap-4 rounded-xl border border-line bg-card-bg p-4 lg:sticky lg:top-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">
            Metadata settings
          </h3>
          {isEdit && (
            <AppSelect
              selectId="article-status"
              label="Status"
              required
              placeholder="Select status"
              value={status}
              onChange={(v) => setStatus(v as ArticleStatus)}
              options={ARTICLE_STATUS_OPTIONS}
            />
          )}
          <AppTextArea
            textAreaId="article-insight"
            label="Content summary"
            required
            rows={6}
            characterLength={2000}
            value={insight}
            onChange={(e) => setInsight(e.target.value)}
            placeholder="Write a 3-sentence summary of the article's main topic and takeaway. Each sentence becomes one bullet."
          />
          <AppInput
            inputId="article-published-at"
            label="Publish date"
            type="datetime-local"
            required
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
          />
          <AppSelect
            selectId="article-category"
            label="Category"
            required
            placeholder="Choose topic category"
            value={categoryId}
            onChange={(v) => setCategoryId(v === null || v === "" ? "" : Number(v))}
            options={categoryOptions}
          />
          <AppSelect
            selectId="article-author"
            label="Author"
            required
            placeholder="Select author"
            value={authorId}
            onChange={(v) => setAuthorId((v as string) ?? "")}
            options={userOptions}
          />
          <AppSelect
            selectId="article-reviewer"
            label="Reviewer"
            required
            placeholder="Select reviewer"
            value={reviewerId}
            onChange={(v) => setReviewerId((v as string) ?? "")}
            options={userOptions}
          />
          <AppTextArea
            textAreaId="article-keywords"
            label="Keywords"
            required
            rows={3}
            characterLength={500}
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. AI untuk bisnis, prompt engineering, pelatihan AI"
          />
          <div className="flex flex-col gap-1">
            <AppInput
              inputId="article-slug"
              label="URL slug"
              characterLength={255}
              value={slugUrl}
              onChange={(e) => setSlugUrl(e.target.value)}
              placeholder="Generated from the title if empty"
            />
            {isEdit && (
              <p className="break-all pl-1 text-xs text-gray-400">
                {articleURL(article.slug_url, article.id)}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
