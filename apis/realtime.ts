import "server-only";

import { createRealtime, rawSql, type RealtimeServer, type SealedLiveQuery } from "@neon/realtime/server";

import { NEON_REALTIME_DB } from "@/lib/constants";

export type UnreadNotificationCountRow = { count: number };

// Mirrors the API session check (exact active token, active undeleted owner), so a revoked session drops to zero live.
const UNREAD_NOTIFICATION_COUNT_SQL = `SELECT count(n.id)::int AS count
FROM tokens t
JOIN users u ON u.id = t.user_id AND u.status = 'active' AND u.deleted_at IS NULL
LEFT JOIN notifications n ON n.user_id = t.user_id AND n.read_at IS NULL
WHERE t.token = $1 AND t.is_active`;

let realtime: RealtimeServer<never> | undefined;

// Realtime stays off until both values are set; the bell then falls back to fetching on focus.
export function getRealtimeUrl() {
  return process.env.NEON_REALTIME_SECRET ? process.env.NEON_REALTIME_URL || undefined : undefined;
}

function getRealtime() {
  const secret = process.env.NEON_REALTIME_SECRET;
  if (!secret || !getRealtimeUrl()) return undefined;
  realtime ??= createRealtime<never>({ secret, db: NEON_REALTIME_DB });
  return realtime;
}

// The query only matches the exact stored token, so reading exp without verifying the signature is safe.
function isExpired(token: string) {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1] ?? "", "base64url").toString("utf8"));
    return typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

// Sealing is local encryption, so issuing and renewing this never touches the API or the database.
export async function sealUnreadNotificationCount(
  token: string | undefined
): Promise<SealedLiveQuery<UnreadNotificationCountRow> | null> {
  const server = getRealtime();
  if (!server || !token || isExpired(token)) return null;
  return server.seal({ query: rawSql<UnreadNotificationCountRow>(UNREAD_NOTIFICATION_COUNT_SQL, [token]) });
}
