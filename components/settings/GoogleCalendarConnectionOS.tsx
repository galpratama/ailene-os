"use client";

import AppButton from "@/components/buttons/AppButton";
import {
  GOOGLE_CALENDAR_CONNECTION_KEY,
  useGoogleCalendarConnection,
} from "@/hooks/useGoogleCalendarConnection";
import { connectGoogleCalendar, disconnectGoogleCalendar } from "@/lib/actions";
import { requireApiData, requireApiSuccess } from "@/lib/api-result";
import { showErrorToast } from "@/lib/toast";
import { useGoogleLogin } from "@react-oauth/google";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarCheck2, Loader2, Unlink } from "lucide-react";
import { toast } from "sonner";

// calendar.events covers creating events and the Google Meet link attached to them.
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";

export default function GoogleCalendarConnectionOS({
  sessionToken,
}: {
  sessionToken: string;
}) {
  const queryClient = useQueryClient();
  const { data: connection, isLoading } = useGoogleCalendarConnection(!!sessionToken);

  async function refreshConnection() {
    await queryClient.invalidateQueries({ queryKey: GOOGLE_CALENDAR_CONNECTION_KEY });
  }

  const connect = useMutation({
    mutationFn: async (code: string) =>
      requireApiData(await connectGoogleCalendar({ code, redirect_uri: "postmessage" })),
    onSuccess: async () => {
      toast.success("Google Calendar connected.");
      await refreshConnection();
    },
    onError: (error) => showErrorToast(error),
  });

  const disconnect = useMutation({
    mutationFn: async () => requireApiSuccess(await disconnectGoogleCalendar()),
    onSuccess: refreshConnection,
    onError: (error) => showErrorToast(error),
  });

  // "auth-code" (offline access) is what yields a refresh token; the API exchanges the code server-side.
  const startConnect = useGoogleLogin({
    flow: "auth-code",
    scope: CALENDAR_SCOPE,
    select_account: true,
    onSuccess: (response) => connect.mutate(response.code),
    onError: () => showErrorToast("Google Calendar connection was cancelled or failed."),
  });

  const isConnected = connection?.connected ?? false;

  return (
    <section className="max-w-180 rounded-xl border border-gray-300 bg-card-bg p-5">
      <h3 className="font-bold text-gray-900 dark:text-zinc-100">
        Google Calendar
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Connect your own Google Calendar. Meetings you organize are added to it
        and kept up to date, and you can give a meeting a Google Meet link.
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <CalendarCheck2
            size={16}
            className={isConnected ? "text-hijau" : "text-gray-400"}
          />
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
              {isLoading ? "Checking..." : isConnected ? "Connected" : "Not connected"}
            </p>
            {isConnected && connection?.connected_at && (
              <p className="text-xs text-gray-500">
                Since {new Date(connection.connected_at).toLocaleDateString("id-ID")}
              </p>
            )}
          </div>
        </div>

        {isConnected ? (
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
            disabled={connect.isPending || isLoading}
            onClick={() => startConnect()}
          >
            {connect.isPending && <Loader2 size={14} className="animate-spin" />}
            Connect
          </AppButton>
        )}
      </div>
    </section>
  );
}
