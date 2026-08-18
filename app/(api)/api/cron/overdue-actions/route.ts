import GetPrismaClient from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Vercel Cron hits this daily (vercel.json) to notify assignees of overdue actions, deduped per day.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse(null, { status: 401 });
  }

  const prisma = GetPrismaClient();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [overdueActions, notifiedToday] = await Promise.all([
    prisma.b2BAction.findMany({
      where: {
        due_date: { lt: startOfToday },
        status: { not: "DONE" },
        assignee_id: { not: null },
      },
      select: { id: true, name: true, assignee_id: true },
    }),
    prisma.notification.findMany({
      where: {
        type: "OVERDUE_NEXT_ACTION",
        entity_type: "B2B_ACTION",
        created_at: { gte: startOfToday },
      },
      select: { entity_id: true },
    }),
  ]);

  const alreadyNotified = new Set(notifiedToday.map((n) => n.entity_id));
  const toNotify = overdueActions.filter((action) => !alreadyNotified.has(action.id));

  if (toNotify.length > 0) {
    await prisma.notification.createMany({
      data: toNotify.map((action) => ({
        user_id: action.assignee_id!,
        type: "OVERDUE_NEXT_ACTION" as const,
        entity_type: "B2B_ACTION" as const,
        entity_id: action.id,
        message: `"${action.name}" is overdue.`,
      })),
    });
  }

  return NextResponse.json({
    status: 200,
    message: "Success",
    notified: toNotify.length,
  });
}
