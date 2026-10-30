import { sealUnreadNotificationCount } from "@/apis/realtime";
import { getSessionToken } from "@/apis/session";
import { NextResponse } from "next/server";

// A Route Handler, not a server action: actions run one at a time, so renewal would queue behind writes.
export async function POST() {
  const sealedQuery = await sealUnreadNotificationCount(await getSessionToken());
  if (!sealedQuery) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(sealedQuery, { headers: { "Cache-Control": "no-store" } });
}
