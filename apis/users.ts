import "server-only";

import { callApi, type ApiEnvelope, type ApiList } from "./api";
import { getSessionToken } from "./session";

export type UserRole = "ADMINISTRATOR" | "MEMBER";

export type UserStatus =
  | "INVITED"
  | "ACTIVE"
  | "SUSPENDED"
  | "DEACTIVATED"
  | "ARCHIVED";

export type UserDataScope = "OWN" | "TEAM" | "GLOBAL";

export type UserJobFunction =
  | "BD"
  | "SALES"
  | "OPERATIONS"
  | "CURRICULUM"
  | "FINANCE"
  | "IT";

export type UserEntry = {
  id: string;
  full_name: string;
  email: string;
  avatar: string | null;
  role: UserRole;
  team_id: number | null;
  team_name: string | null;
  job_function: UserJobFunction | null;
  data_scope: UserDataScope;
  status: UserStatus;
  created_at: string;
  last_login: string | null;
};

export type UserOwnership = {
  pipelines_owned: number;
  actions_assigned: number;
};

// `users/details` returns the user flat with `ownership` nested inside it, not a `{ user, ownership }` pair.
export type UserDetail = UserEntry & { ownership: UserOwnership };

// The invite/update responses carry every user field except the joined `team_name`.
export type UserMutated = Omit<UserEntry, "team_name">;

export type ListUsersOptions = {
  roles?: UserRole[];
  team_id?: number;
  status?: UserStatus;
  page?: number;
  page_size?: number;
  keyword?: string;
};

export type InviteUserPayload = {
  full_name: string;
  email: string;
  role: UserRole;
  team_id?: number | null;
  job_function?: UserJobFunction | null;
  data_scope?: UserDataScope;
};

export type UpdateUserPayload = {
  id: string;
  role?: UserRole;
  team_id?: number | null;
  job_function?: UserJobFunction | null;
  data_scope?: UserDataScope;
  reason?: string;
};

// The API speaks the DB spelling (`own`), the app compares against Prisma's enum name (`OWN`) — bridged here, not at the call sites.
type ApiEnums = {
  role: string;
  job_function: string | null;
  data_scope: string;
  status: string;
};

type ApiUserEntry = Omit<UserEntry, keyof ApiEnums> & ApiEnums;
type ApiUserDetail = Omit<UserDetail, keyof ApiEnums> & ApiEnums;
type ApiUserMutated = Omit<UserMutated, keyof ApiEnums> & ApiEnums;

function up<T extends string>(value: string): T;
function up<T extends string>(value: string | null): T | null;
function up<T extends string>(value: string | null): T | null {
  return value === null ? null : (value.toUpperCase() as T);
}

function down(value: string | null | undefined) {
  return value === null || value === undefined ? value : value.toLowerCase();
}

function toUserEntry<T extends ApiEnums>(entry: T) {
  return {
    ...entry,
    role: up<UserRole>(entry.role),
    job_function: up<UserJobFunction>(entry.job_function),
    data_scope: up<UserDataScope>(entry.data_scope),
    status: up<UserStatus>(entry.status),
  };
}

export async function listUsers(
  options: ListUsersOptions = {}
): Promise<ApiEnvelope<ApiList<UserEntry>>> {
  const result = await callApi<ApiList<ApiUserEntry>>("/api/v1/users", {
    token: await getSessionToken(),
    body: {
      ...options,
      roles: options.roles?.map((role) => role.toLowerCase()),
      status: down(options.status),
    },
  });

  if (!result.data) return result as ApiEnvelope<never>;

  return {
    ...result,
    data: {
      list: result.data.list.map(toUserEntry),
      metapaging: result.data.metapaging,
    },
  };
}

export async function getUserDetails(
  id: string
): Promise<ApiEnvelope<UserDetail>> {
  const result = await callApi<ApiUserDetail>("/api/v1/users/details", {
    token: await getSessionToken(),
    body: { id },
  });

  if (!result.data) return result as ApiEnvelope<never>;

  return { ...result, data: toUserEntry(result.data) };
}

export async function inviteUser(
  payload: InviteUserPayload
): Promise<ApiEnvelope<UserMutated>> {
  const result = await callApi<ApiUserMutated>("/api/v1/users/invite", {
    token: await getSessionToken(),
    body: {
      ...payload,
      role: down(payload.role),
      job_function: down(payload.job_function),
      data_scope: down(payload.data_scope),
    },
  });

  if (!result.data) return result as ApiEnvelope<never>;

  return { ...result, data: toUserEntry(result.data) };
}

export async function updateUser(
  payload: UpdateUserPayload
): Promise<ApiEnvelope<UserMutated>> {
  const result = await callApi<ApiUserMutated>("/api/v1/users/update", {
    token: await getSessionToken(),
    body: {
      ...payload,
      role: down(payload.role),
      job_function: down(payload.job_function),
      data_scope: down(payload.data_scope),
    },
  });

  if (!result.data) return result as ApiEnvelope<never>;

  return { ...result, data: toUserEntry(result.data) };
}

export async function updateUserStatus(payload: {
  id: string;
  status: UserStatus;
  reason?: string;
}): Promise<ApiEnvelope<null>> {
  return callApi("/api/v1/users/update/status", {
    token: await getSessionToken(),
    body: { ...payload, status: down(payload.status) },
  });
}

export async function reassignOwnership(payload: {
  from_user_id: string;
  to_user_id: string;
  reason: string;
}): Promise<
  ApiEnvelope<{
    reassigned: { pipelines: number; actions: number; meetings: number };
  }>
> {
  return callApi("/api/v1/users/update/reassign-ownership", {
    token: await getSessionToken(),
    body: payload,
  });
}
