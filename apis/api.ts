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

export async function callApi<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {}
): Promise<ApiEnvelope<T>> {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error("BASE_URL is not configured");
  }

  const { method = "POST", body, token } = options;

  const response = await fetch(new URL(path, baseUrl).toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
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
