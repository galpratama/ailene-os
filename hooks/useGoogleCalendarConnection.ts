"use client";

import { requireApiData } from "@/lib/api-result";
import { getGoogleCalendarConnection } from "@/lib/actions";
import { useQuery } from "@tanstack/react-query";

export const GOOGLE_CALENDAR_CONNECTION_KEY = ["google-calendar", "connection"];

// Shared by Settings and the meeting forms, which gate the Google Meet option on it.
export function useGoogleCalendarConnection(enabled: boolean) {
  return useQuery({
    queryKey: GOOGLE_CALENDAR_CONNECTION_KEY,
    queryFn: async () => requireApiData(await getGoogleCalendarConnection()),
    enabled,
  });
}
