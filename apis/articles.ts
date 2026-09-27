import "server-only";

import { callApi, clientSecret, type ApiEnvelope, type ApiList } from "./api";
import { getSessionToken } from "./session";

export type ArticleStatus = "draft" | "published" | "unpublished";
export type ArticleCategoryStatus = "active" | "inactive";

export type ArticleCategoryData = {
  id: number;
  name: string;
  slug: string;
  status: ArticleCategoryStatus;
  created_at: string;
};

export type ArticleCategoryRef = {
  id: number;
  name: string;
  slug: string;
};

export type ArticlePerson = {
  id: string;
  full_name: string;
  avatar: string | null;
};

// One body block: an optional sub-heading, then rich-text HTML and/or an image.
export type ArticleSection = {
  index_order: number;
  sub_heading: string | null;
  image_path: string | null;
  image_desc: string | null;
  content: string | null;
};

export type ArticleTocEntry = {
  level: number;
  name: string;
  id: string;
};

export type ArticleListItem = {
  id: number;
  title: string;
  insight: string;
  image_url: string;
  status: ArticleStatus;
  category: ArticleCategoryRef;
  keywords: string;
  author: ArticlePerson;
  reviewer: ArticlePerson;
  slug_url: string;
  published_at: string;
  updated_at: string;
};

export type ArticleData = ArticleListItem & {
  body_content: ArticleSection[];
  reading_time: number;
  table_of_contents: ArticleTocEntry[];
  created_at: string;
};

export type ListArticlesOptions = {
  keyword?: string;
  // Only honored for OS sessions; the public site always gets published articles.
  status?: ArticleStatus;
  category_id?: number;
  page?: number;
  page_size?: number;
};

// Omitted slug_url is derived from the title by the API.
export type CreateArticlePayload = {
  title: string;
  insight: string;
  image_url: string;
  body_content: ArticleSection[];
  status: ArticleStatus;
  category_id: number;
  keywords: string;
  author_id: string;
  reviewer_id: string;
  slug_url?: string | null;
  published_at: string;
};

// A full replace: every editable field is sent, including the unchanged ones.
export type UpdateArticlePayload = CreateArticlePayload & { id: number };

export type ArticleCategoryPayload = {
  name: string;
  slug?: string | null;
  status: ArticleCategoryStatus;
};

async function token() {
  return getSessionToken();
}

export async function listArticleCategories(
  options: { page?: number; page_size?: number } = {}
): Promise<ApiEnvelope<ApiList<ArticleCategoryData>>> {
  return callApi("/api/v1/article-categories", {
    token: await token(),
    body: options,
  });
}

export async function createArticleCategory(
  payload: ArticleCategoryPayload
): Promise<ApiEnvelope<ArticleCategoryData>> {
  return callApi("/api/v1/article-categories/create", {
    token: await token(),
    body: payload,
  });
}

export async function updateArticleCategory(
  payload: ArticleCategoryPayload & { id: number }
): Promise<ApiEnvelope<ArticleCategoryData>> {
  return callApi("/api/v1/article-categories/update", {
    token: await token(),
    body: payload,
  });
}

export async function deleteArticleCategory(id: number): Promise<ApiEnvelope<null>> {
  return callApi("/api/v1/article-categories/delete", {
    token: await token(),
    body: { id },
  });
}

export async function listArticles(
  options: ListArticlesOptions = {}
): Promise<ApiEnvelope<ApiList<ArticleListItem>>> {
  return callApi("/api/v1/articles", {
    token: await token(),
    body: options,
  });
}

export async function getArticleDetails(id: number): Promise<ApiEnvelope<ArticleData>> {
  return callApi("/api/v1/articles/details", {
    token: await token(),
    body: { id },
  });
}

export async function createArticle(
  payload: CreateArticlePayload
): Promise<ApiEnvelope<ArticleData>> {
  return callApi("/api/v1/articles/create", {
    token: await token(),
    body: payload,
  });
}

export async function updateArticle(
  payload: UpdateArticlePayload
): Promise<ApiEnvelope<ArticleData>> {
  return callApi("/api/v1/articles/update", {
    token: await token(),
    body: payload,
  });
}

export async function deleteArticle(id: number): Promise<ApiEnvelope<null>> {
  return callApi("/api/v1/articles/delete", {
    token: await token(),
    body: { id },
  });
}

// Public biz site: the client secret only ever sees published articles and active categories.
const PUBLIC_REVALIDATE_SECONDS = 300;

export async function listPublishedArticles(
  options: Omit<ListArticlesOptions, "status"> = {}
): Promise<ApiEnvelope<ApiList<ArticleListItem>>> {
  return callApi("/api/v1/articles", {
    token: clientSecret(),
    body: options,
    revalidate: PUBLIC_REVALIDATE_SECONDS,
  });
}

export async function getPublishedArticle(id: number): Promise<ApiEnvelope<ArticleData>> {
  return callApi("/api/v1/articles/details", {
    token: clientSecret(),
    body: { id },
    revalidate: PUBLIC_REVALIDATE_SECONDS,
  });
}

export async function listActiveArticleCategories(): Promise<
  ApiEnvelope<ApiList<ArticleCategoryData>>
> {
  return callApi("/api/v1/article-categories", {
    token: clientSecret(),
    body: { page: 1, page_size: 100 },
    revalidate: PUBLIC_REVALIDATE_SECONDS,
  });
}
