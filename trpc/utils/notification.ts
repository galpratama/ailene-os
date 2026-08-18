import {
  NotificationEntityTypeEnum,
  NotificationTypeEnum,
  Prisma,
} from "@prisma/client";

// Fires an in-app notification to each recipient, skipping the actor (don't notify someone about their own action) and de-duplicating IDs.
export async function notifyUsers(
  tx: Prisma.TransactionClient,
  params: {
    userIds: (string | null | undefined)[];
    actorId?: string;
    type: NotificationTypeEnum;
    entityType: NotificationEntityTypeEnum;
    entityId: number;
    message: string;
  }
) {
  const recipients = Array.from(
    new Set(
      params.userIds.filter(
        (id): id is string => !!id && id !== params.actorId
      )
    )
  );
  if (recipients.length === 0) return;

  await tx.notification.createMany({
    data: recipients.map((user_id) => ({
      user_id,
      type: params.type,
      entity_type: params.entityType,
      entity_id: params.entityId,
      message: params.message,
    })),
  });
}
