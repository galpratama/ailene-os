import "server-only";

import { callApi, type ApiEnvelope, type ApiList } from "./api";
import { getSessionToken } from "./session";

export type TeamEntry = {
  id: number;
  name: string;
  user_count: number;
};

export type ListTeamsOptions = {
  page?: number;
  page_size?: number;
};

export async function listTeams(
  options: ListTeamsOptions = {}
): Promise<ApiEnvelope<ApiList<TeamEntry>>> {
  return callApi("/api/v1/teams", {
    token: await getSessionToken(),
    body: options,
  });
}

// `teams/create` is the one mutation the API wraps in an object instead of returning the entity flat.
export async function createTeam(
  name: string
): Promise<ApiEnvelope<{ team: TeamEntry }>> {
  return callApi("/api/v1/teams/create", {
    token: await getSessionToken(),
    body: { name },
  });
}
