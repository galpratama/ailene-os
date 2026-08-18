import { MasterDataEntityTypeEnum, Prisma } from "@prisma/client";

const TIMELINE_LIMIT = 50;

// Shared shape for any record's timeline, whatever table each entry actually came from — one renderer fits all sources.
export interface TimelineEntry {
  id: string;
  field_changed: string;
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
  actor_name: string;
  created_at: Date;
}

// Generic field-change history, shared by any entity in MasterDataEntityTypeEnum (Organization, Contact).
export async function getMasterDataTimeline(
  prisma: Prisma.TransactionClient,
  entityType: MasterDataEntityTypeEnum,
  entityId: number
): Promise<TimelineEntry[]> {
  const rows = await prisma.masterDataAuditLog.findMany({
    where: { target_entity_type: entityType, target_entity_id: entityId },
    include: { actor: { select: { full_name: true } } },
    orderBy: { created_at: "desc" },
    take: TIMELINE_LIMIT,
  });
  return rows.map((entry) => ({
    id: `field-${entry.id}`,
    field_changed: entry.field_changed,
    old_value: entry.old_value,
    new_value: entry.new_value,
    reason: entry.reason,
    actor_name: entry.actor.full_name,
    created_at: entry.created_at,
  }));
}

// Merges stage-change and ownership-reassignment history for one pipeline into one chronological feed.
export async function getPipelineTimeline(
  prisma: Prisma.TransactionClient,
  pipelineId: number
): Promise<TimelineEntry[]> {
  const [stageHistory, reassignments] = await Promise.all([
    prisma.b2BPipelineStageHistory.findMany({
      where: { pipeline_id: pipelineId },
      include: { changed_by: { select: { full_name: true } } },
      orderBy: { created_at: "desc" },
      take: TIMELINE_LIMIT,
    }),
    prisma.ownershipReassignment.findMany({
      where: { entity_type: "B2B_PIPELINE", entity_id: pipelineId },
      include: {
        actor: { select: { full_name: true } },
        previous_owner: { select: { full_name: true } },
        new_owner: { select: { full_name: true } },
      },
      orderBy: { created_at: "desc" },
      take: TIMELINE_LIMIT,
    }),
  ]);

  const entries: TimelineEntry[] = [
    ...stageHistory.map((entry) => ({
      id: `stage-${entry.id}`,
      field_changed: "stage",
      old_value: entry.from_stage,
      new_value: entry.to_stage as string,
      reason: entry.reason_code,
      actor_name: entry.changed_by.full_name,
      created_at: entry.created_at,
    })),
    ...reassignments.map((entry) => ({
      id: `owner-${entry.id}`,
      field_changed: "owner",
      old_value: entry.previous_owner.full_name,
      new_value: entry.new_owner.full_name,
      reason: entry.reason as string | null,
      actor_name: entry.actor.full_name,
      created_at: entry.created_at,
    })),
  ];

  return entries
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
    .slice(0, TIMELINE_LIMIT);
}
