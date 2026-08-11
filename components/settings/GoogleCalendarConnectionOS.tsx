"use client";

import AppButton from "@/components/buttons/AppButton";
import { trpc } from "@/trpc/client";
import { useGoogleLogin } from "@react-oauth/google";
import { CalendarCheck2, Loader2, Unlink } from "lucide-react";
import { useState } from "react";

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";

export default function GoogleCalendarConnectionOS({
  sessionToken,
}: {
  sessionToken: string;
}) {
  const utils = trpc.useUtils();
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = trpc.read.integrations.googleCalendarConnection.useQuery(
    undefined,
    { enabled: !!sessionToken }
  );

  const connect = trpc.create.integrations.googleCalendarConnection.useMutation({
    onSuccess: () => {
      setError(null);
      utils.read.integrations.googleCalendarConnection.invalidate();
    },
    onError: (err) => setError(err.message),
  });

  const disconnect = trpc.delete.integrations.googleCalendarConnection.useMutation({
    onSuccess: () => utils.read.integrations.googleCalendarConnection.invalidate(),
  });

  // "auth-code" (offline access) — required to get a refresh_token for push
  // sync, unlike the login flow's implicit access_token which is never stored.
  const startConnect = useGoogleLogin({
    flow: "auth-code",
    scope: CALENDAR_SCOPE,
    onSuccess: (response) => {
      setError(null);
      connect.mutate({ code: response.code, redirect_uri: "postmessage" });
    },
    onError: () =>
      setError("Google Calendar connection was cancelled or failed."),
  });

  const connection = data?.connection;

  return (
    <section className="max-w-180 rounded-xl border border-gray-300 bg-card-bg p-5">
      <h3 className="font-bold text-gray-900 dark:text-zinc-100">
        Google Calendar
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Connect your Google Calendar so scheduling a meeting here also
        creates or updates the event on your calendar.
      </p>

      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <CalendarCheck2
            size={16}
            className={connection ? "text-hijau" : "text-gray-400"}
          />
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
              {isLoading
                ? "Checking..."
                : connection
                  ? "Connected"
                  : "Not connected"}
            </p>
            {connection && (
              <p className="text-xs text-gray-500">
                Since{" "}
                {new Date(connection.connected_at).toLocaleDateString(
                  "id-ID"
                )}
              </p>
            )}
          </div>
        </div>

        {connection ? (
          <AppButton
            type="button"
            variant="outline"
            size="sm"
            disabled={disconnect.isPending}
            onClick={() => disconnect.mutate()}
          >
            {disconnect.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Unlink size={14} />
            )}
            Disconnect
          </AppButton>
        ) : (
          <AppButton
            type="button"
            size="sm"
            disabled={connect.isPending}
            onClick={() => startConnect()}
          >
            {connect.isPending && (
              <Loader2 size={14} className="animate-spin" />
            )}
            Connect
          </AppButton>
        )}
      </div>
    </section>
  );
}
