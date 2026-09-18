import type { ApiEnvelope } from "@/apis/api";
import { isSuccessStatus } from "@/lib/status_code";

export function requireApiData<T>(result: ApiEnvelope<T>): T {
  if (!isSuccessStatus(result.status) || result.data === undefined) {
    throw new Error(result.message ?? "The API request failed.");
  }
  return result.data;
}

export function requireApiSuccess(result: ApiEnvelope<unknown>) {
  if (!isSuccessStatus(result.status)) {
    throw new Error(result.message ?? "The API request failed.");
  }
}
