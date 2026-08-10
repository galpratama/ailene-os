import { DataScopeEnum, Prisma } from "@prisma/client";

type ScopedActor = {
  id: string;
  team_id: number | null;
  data_scope: DataScopeEnum;
};

// Restricts a B2BPipeline query to what the actor's data_scope allows to see. TEAM with no team assigned falls back to OWN.
export function pipelineDataScopeWhere(
  actor: ScopedActor
): Prisma.B2BPipelineWhereInput {
  if (actor.data_scope === "GLOBAL") return {};
  if (actor.data_scope === "TEAM" && actor.team_id !== null) {
    return { owner: { team_id: actor.team_id } };
  }
  return { owner_id: actor.id };
}

// Same restriction, applied through a B2BAction's parent pipeline (actions have no owner of their own).
export function actionDataScopeWhere(
  actor: ScopedActor
): Prisma.B2BActionWhereInput {
  return { pipeline: pipelineDataScopeWhere(actor) };
}

// For single-record mutations: is this specific pipeline owner within the actor's scope?
export function isOwnerWithinScope(
  actor: ScopedActor,
  ownerId: string,
  ownerTeamId: number | null
): boolean {
  if (actor.data_scope === "GLOBAL") return true;
  if (actor.data_scope === "TEAM" && actor.team_id !== null) {
    return ownerTeamId === actor.team_id;
  }
  return ownerId === actor.id;
}
