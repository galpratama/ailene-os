import { DataScopeEnum, Prisma } from "@prisma/client";

type ScopedActor = {
  id: string;
  team_id: number | null;
  data_scope: DataScopeEnum;
};

// Restricts a Sales API Pipeline query to what the actor's data_scope allows to see.
export function pipelineDataScopeWhere(actor: ScopedActor): Prisma.PipelineWhereInput {
  if (actor.data_scope === "GLOBAL") return {};
  if (actor.data_scope === "TEAM" && actor.team_id !== null) {
    return { sales_owner: { team_id: actor.team_id } };
  }
  return { sales_owner_id: actor.id };
}

// Same restriction, applied through a B2BAction's parent pipeline (actions have no owner of their own).
export function actionDataScopeWhere(
  actor: ScopedActor
): Prisma.B2BActionWhereInput {
  return { pipeline: pipelineDataScopeWhere(actor) };
}

// Same restriction, applied through a B2BMeeting's parent pipeline (meetings have no owner of their own).
export function meetingDataScopeWhere(
  actor: ScopedActor
): Prisma.B2BMeetingWhereInput {
  return { pipeline: pipelineDataScopeWhere(actor) };
}

// Same restriction, applied through a B2BQuotation's parent pipeline (quotations have no owner of their own).
export function quotationDataScopeWhere(
  actor: ScopedActor
): Prisma.B2BQuotationWhereInput {
  return { pipeline: pipelineDataScopeWhere(actor) };
}
