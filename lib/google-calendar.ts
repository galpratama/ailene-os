import LogError from "@/lib/prisma-log-error";
import type { B2BMeeting, GoogleCalendarConnection, PrismaClient } from "@prisma/client";

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const CALENDAR_EVENTS_ENDPOINT = (calendarId: string, eventId?: string) =>
  `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events${eventId ? `/${eventId}` : ""}`;
// Meetings don't carry an explicit end time — this fixed duration is the
// simplest reasonable default for a one-way push sync.
const DEFAULT_MEETING_DURATION_MINUTES = 30;

type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
};

// Exchanges the one-time auth code from the "Connect Google Calendar" button
// for a refresh_token (offline access) + access_token. redirect_uri must match
// what the frontend used to obtain the code — "postmessage" for the popup flow.
export async function exchangeGoogleAuthCode(code: string, redirectUri: string) {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!response.ok) {
    throw new Error(`Google token exchange failed: ${await response.text()}`);
  }
  return (await response.json()) as TokenResponse;
}

async function refreshGoogleAccessToken(refreshToken: string) {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) {
    throw new Error(`Google token refresh failed: ${await response.text()}`);
  }
  return (await response.json()) as TokenResponse;
}

// Refreshed 60s before actual expiry to absorb request latency.
async function getValidAccessToken(
  prisma: PrismaClient,
  connection: GoogleCalendarConnection
) {
  const hasValidCachedToken =
    connection.access_token &&
    connection.token_expiry &&
    connection.token_expiry.getTime() - 60_000 > Date.now();
  if (hasValidCachedToken) return connection.access_token!;

  const refreshed = await refreshGoogleAccessToken(connection.refresh_token);
  await prisma.googleCalendarConnection.update({
    where: { user_id: connection.user_id },
    data: {
      access_token: refreshed.access_token,
      token_expiry: new Date(Date.now() + refreshed.expires_in * 1000),
    },
  });
  return refreshed.access_token;
}

function toGoogleEventPayload(
  meeting: Pick<
    B2BMeeting,
    "scheduled_at" | "location_or_link" | "notes" | "pipeline_id"
  > & { pipeline_name: string; company_name: string }
) {
  const start = meeting.scheduled_at;
  const end = new Date(
    start.getTime() + DEFAULT_MEETING_DURATION_MINUTES * 60_000
  );
  return {
    summary: `${meeting.company_name} - ${meeting.pipeline_name}`,
    description: meeting.notes ?? undefined,
    location: meeting.location_or_link ?? undefined,
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
  };
}

// Best-effort push of a Meeting into its organizer's connected Google Calendar —
// never throws, since a sync failure shouldn't block the meeting create/update
// itself (see B2BMeeting.google_sync_status/google_sync_error). No-ops if the
// organizer hasn't connected a calendar.
export async function pushMeetingToGoogleCalendar(
  prisma: PrismaClient,
  meeting: Pick<
    B2BMeeting,
    | "id"
    | "organizer_id"
    | "scheduled_at"
    | "location_or_link"
    | "notes"
    | "pipeline_id"
    | "status"
    | "google_event_id"
  > & { pipeline_name: string; company_name: string }
) {
  const connection = await prisma.googleCalendarConnection.findUnique({
    where: { user_id: meeting.organizer_id },
  });
  if (!connection) return;

  try {
    const accessToken = await getValidAccessToken(prisma, connection);
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    if (meeting.status === "CANCELLED" && meeting.google_event_id) {
      await fetch(
        CALENDAR_EVENTS_ENDPOINT(connection.google_calendar_id, meeting.google_event_id),
        { method: "DELETE", headers }
      );
      await prisma.b2BMeeting.update({
        where: { id: meeting.id },
        data: {
          google_event_id: null,
          google_sync_status: "SYNCED",
          google_sync_error: null,
          last_synced_at: new Date(),
        },
      });
      return;
    }

    const payload = toGoogleEventPayload(meeting);
    const response = meeting.google_event_id
      ? await fetch(
          CALENDAR_EVENTS_ENDPOINT(connection.google_calendar_id, meeting.google_event_id),
          { method: "PATCH", headers, body: JSON.stringify(payload) }
        )
      : await fetch(CALENDAR_EVENTS_ENDPOINT(connection.google_calendar_id), {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

    if (!response.ok) {
      throw new Error(await response.text());
    }
    const event = (await response.json()) as { id: string };

    await prisma.b2BMeeting.update({
      where: { id: meeting.id },
      data: {
        google_event_id: event.id,
        google_sync_status: "SYNCED",
        google_sync_error: null,
        last_synced_at: new Date(),
      },
    });
  } catch (error) {
    await LogError("pushMeetingToGoogleCalendar", error);
    await prisma.b2BMeeting.update({
      where: { id: meeting.id },
      data: {
        google_sync_status: "SYNC_FAILED",
        google_sync_error: error instanceof Error ? error.message : "Unknown error",
        last_synced_at: new Date(),
      },
    });
  }
}

// Best-effort removal of a Meeting's Google Calendar event — called right
// before the B2BMeeting row itself is deleted, so failures are only logged.
export async function deleteMeetingFromGoogleCalendar(
  prisma: PrismaClient,
  meeting: Pick<B2BMeeting, "organizer_id" | "google_event_id">
) {
  if (!meeting.google_event_id) return;

  const connection = await prisma.googleCalendarConnection.findUnique({
    where: { user_id: meeting.organizer_id },
  });
  if (!connection) return;

  try {
    const accessToken = await getValidAccessToken(prisma, connection);
    await fetch(
      CALENDAR_EVENTS_ENDPOINT(connection.google_calendar_id, meeting.google_event_id),
      { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }
    );
  } catch (error) {
    await LogError("deleteMeetingFromGoogleCalendar", error);
  }
}
