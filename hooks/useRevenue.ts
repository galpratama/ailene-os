"use client";

import type { ApiEnvelope } from "@/apis/api";
import { requireApiData } from "@/lib/api-result";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

// Every revenue view reads one endpoint under ["revenue", name, ...params] and keeps the last data while a new period loads.
export function useRevenue<T>(name: string, params: unknown, fetcher: () => Promise<ApiEnvelope<T>>, enabled = true) {
  return useQuery({
    queryKey: ["revenue", name, params],
    queryFn: async () => requireApiData(await fetcher()),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}
