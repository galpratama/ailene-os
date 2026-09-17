import "server-only";

import { callApi, type ApiEnvelope } from "./api";
import { getSessionToken } from "./session";

export type TeamEntry = {
  id: number;
  name: string;
  user_count: number;
};

export async function listTeams(): Promise<ApiEnvelope<{ list: TeamEntry[] }>> {
  return callApi("/api/v1/teams", { token: await getSessionToken() });
}

export async function createTeam(
  name: string
): Promise<ApiEnvelope<{ team: TeamEntry }>> {
  return callApi("/api/v1/teams/create", {
    token: await getSessionToken(),
    body: { name },
  });
}
