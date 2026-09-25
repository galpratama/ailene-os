import "server-only";

import {
  STATUS_BAD_REQUEST,
  STATUS_CONFLICT,
  STATUS_CREATED,
  STATUS_FORBIDDEN,
  STATUS_INTERNAL_SERVER_ERROR,
  STATUS_NOT_FOUND,
  STATUS_NO_CONTENT,
  STATUS_OK,
  STATUS_UNAUTHORIZED,
  type StatusName,
} from "@/lib/status_code";

export type Metapaging = {
  total_data: number;
  total_page: number;
  current_page: number;
  page_size: number;
};

// Every list endpoint answers with the same `list` + `metapaging` wrapper, never a bare array.
export type ApiList<T> = {
  list: T[];
  metapaging: Metapaging;
};

export type ApiEnvelope<T = unknown> = {
  success?: boolean;
  code?: number;
  status?: StatusName;
  message?: string;
  data?: T;
};

function statusNameFromCode(code: number): StatusName {
  switch (code) {
    case 200:
      return STATUS_OK;
    case 201:
      return STATUS_CREATED;
    case 204:
      return STATUS_NO_CONTENT;
    case 400:
      return STATUS_BAD_REQUEST;
    case 401:
      return STATUS_UNAUTHORIZED;
    case 403:
      return STATUS_FORBIDDEN;
    case 404:
      return STATUS_NOT_FOUND;
    case 409:
      return STATUS_CONFLICT;
    default:
      return STATUS_INTERNAL_SERVER_ERROR;
  }
}

// Endpoints with no per-user credential yet are gated by the shared client secret instead.
export function clientSecret() {
  const secret = process.env.CLIENT_SECRET;
  if (!secret) {
    throw new Error("CLIENT_SECRET is not configured");
  }
  return secret;
}

export async function callApi<T = unknown>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    token?: string;
    revalidate?: number;
    // Defaults to the identity/sales API; other services (e.g. the LMS) pass their own.
    baseUrl?: string;
  } = {}
): Promise<ApiEnvelope<T>> {
  const baseUrl = options.baseUrl ?? process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("BASE_URL is not configured");
  }

  const { method = "POST", body, token, revalidate } = options;

  const response = await fetch(new URL(path, baseUrl).toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    // Per-user data must never be cached; only public lookups opt into revalidation.
    ...(revalidate === undefined
      ? { cache: "no-store" as const }
      : { next: { revalidate } }),
  });

  const data = (await response
    .json()
    .catch(() => null)) as ApiEnvelope<T> | null;

  if (!data) {
    return {
      code: response.status,
      status: statusNameFromCode(response.status),
      message: "Invalid response from server",
    };
  }

  // Fall back to the real HTTP status so callers don't misread a 2xx as a failure.
  return {
    ...data,
    status: data.status ?? statusNameFromCode(response.status),
  };
}
