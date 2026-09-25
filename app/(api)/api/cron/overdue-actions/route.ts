import { notifyOverdueActions } from "@/apis/actions";
import { isSuccessStatus } from "@/lib/status_code";
import { NextRequest, NextResponse } from "next/server";

// Vercel Cron hits this daily (vercel.json); the Actions API writes the notifications, deduped per day.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse(null, { status: 401 });
  }

  const result = await notifyOverdueActions();
  if (!isSuccessStatus(result.status)) {
    return NextResponse.json(
      { status: result.code ?? 500, message: result.message ?? "Failed to notify overdue actions" },
      { status: 502 }
    );
  }

  return NextResponse.json({
    status: 200,
    message: "Success",
    notified: result.data?.notified ?? 0,
  });
}
