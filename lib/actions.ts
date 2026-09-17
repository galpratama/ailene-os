"use server";

import { loginWithGoogle as loginWithGoogleApi } from "@/apis/auth";
import { logoutUser as logoutUserApi } from "@/apis/session";
import { createTeam as createTeamApi, listTeams as listTeamsApi } from "@/apis/teams";
import {
  getUserDetails as getUserDetailsApi,
  inviteUser as inviteUserApi,
  listUsers as listUsersApi,
  reassignOwnership as reassignOwnershipApi,
  updateUser as updateUserApi,
  updateUserStatus as updateUserStatusApi,
  type InviteUserPayload,
  type ListUsersOptions,
  type UpdateUserPayload,
  type UserStatus,
} from "@/apis/users";
import { isSuccessStatus } from "@/lib/status_code";

// The session JWT stays in the httpOnly cookie — the client only learns whether to navigate.
export async function loginWithGoogle(accessToken: string) {
  const result = await loginWithGoogleApi(accessToken);
  return { success: isSuccessStatus(result.status), message: result.message };
}

export async function logoutUser() {
  await logoutUserApi();
}

export async function listUsers(options: ListUsersOptions = {}) {
  return listUsersApi(options);
}

export async function getUserDetails(id: string) {
  return getUserDetailsApi(id);
}

export async function inviteUser(payload: InviteUserPayload) {
  return inviteUserApi(payload);
}

export async function updateUser(payload: UpdateUserPayload) {
  return updateUserApi(payload);
}

export async function updateUserStatus(payload: {
  id: string;
  status: UserStatus;
  reason?: string;
}) {
  return updateUserStatusApi(payload);
}

export async function reassignOwnership(payload: {
  from_user_id: string;
  to_user_id: string;
  reason: string;
}) {
  return reassignOwnershipApi(payload);
}

export async function listTeams() {
  return listTeamsApi();
}

export async function createTeam(name: string) {
  return createTeamApi(name);
}
