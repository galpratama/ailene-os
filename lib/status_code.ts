// This file only contains some HTTP status codes.

// 2xx //

export const STATUS_OK = "OK" as const; // 200 OK
export const STATUS_CREATED = "CREATED" as const; // 201 Created
export const STATUS_NO_CONTENT = "NO_CONTENT" as const; // 204 No Content

// 4xx //

export const STATUS_BAD_REQUEST = "BAD_REQUEST" as const; // 400 Bad Request
export const STATUS_UNAUTHORIZED = "UNAUTHORIZED" as const; // 401 Unauthorized
export const STATUS_FORBIDDEN = "FORBIDDEN" as const; // 403 Forbidden
export const STATUS_NOT_FOUND = "NOT_FOUND" as const; // 404 Not Found
export const STATUS_CONFLICT = "CONFLICT" as const; // 409 Conflict

// 5xx //

export const STATUS_INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR" as const; // 500 Internal Server Error

// The `status` field every ailene-os-api response carries, success or error.
export type StatusName =
  | typeof STATUS_OK
  | typeof STATUS_CREATED
  | typeof STATUS_NO_CONTENT
  | typeof STATUS_BAD_REQUEST
  | typeof STATUS_UNAUTHORIZED
  | typeof STATUS_FORBIDDEN
  | typeof STATUS_NOT_FOUND
  | typeof STATUS_CONFLICT
  | typeof STATUS_INTERNAL_SERVER_ERROR;

const SUCCESS_STATUSES: ReadonlySet<StatusName> = new Set([
  STATUS_OK,
  STATUS_CREATED,
  STATUS_NO_CONTENT,
]);

export function isSuccessStatus(status?: StatusName): boolean {
  return status !== undefined && SUCCESS_STATUSES.has(status);
}
