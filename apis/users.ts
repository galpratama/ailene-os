import "server-only";

import { callApi, type ApiEnvelope, type ApiList } from "./api";
import { getSessionToken } from "./session";

export type UserRole = "administrator" | "member";

export type UserStatus =
  | "invited"
  | "active"
  | "suspended"
  | "deactivated"
  | "archived";

export type UserDataScope = "own" | "team" | "global";

export type UserJobFunction =
  | "bd"
  | "sales"
  | "operations"
  | "curriculum"
  | "finance"
  | "it";

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

export async function listUsers(
  options: ListUsersOptions = {}
): Promise<ApiEnvelope<ApiList<UserEntry>>> {
  return callApi("/api/v2/users", {
    token: await getSessionToken(),
    body: options,
  });
}

export async function getUserDetails(id: string): Promise<ApiEnvelope<UserDetail>> {
  return callApi("/api/v2/users/details", {
    token: await getSessionToken(),
    body: { id },
  });
}

export async function inviteUser(
  payload: InviteUserPayload
): Promise<ApiEnvelope<UserMutated>> {
  return callApi("/api/v2/users/invite", {
    token: await getSessionToken(),
    body: payload,
  });
}

export async function updateUser(
  payload: UpdateUserPayload
): Promise<ApiEnvelope<UserMutated>> {
  return callApi("/api/v2/users/update", {
    token: await getSessionToken(),
    body: payload,
  });
}

export async function updateUserStatus(payload: {
  id: string;
  status: UserStatus;
  reason?: string;
}): Promise<ApiEnvelope<null>> {
  return callApi("/api/v2/users/update/status", {
    token: await getSessionToken(),
    body: payload,
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
  return callApi("/api/v2/users/update/reassign-ownership", {
    token: await getSessionToken(),
    body: payload,
  });
}
