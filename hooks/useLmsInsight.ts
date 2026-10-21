"use client";

import type { ApiEnvelope } from "@/apis/api";
import type { LmsInsightsFilter } from "@/apis/lms";
import { requireApiData } from "@/lib/api-result";
import { useQuery } from "@tanstack/react-query";

// Every insight is keyed by section + project + group, so switching the group filter never shows stale numbers.
export function useLmsInsight<T>(
  section: string,
  filter: LmsInsightsFilter,
  sessionToken: string,
  fetcher: (filter: LmsInsightsFilter) => Promise<ApiEnvelope<T>>,
) {
  return useQuery({
    queryKey: ["lms-insights", section, filter.project_id, filter.group_id],
    queryFn: async () => requireApiData(await fetcher(filter)),
    enabled: !!sessionToken,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
}
