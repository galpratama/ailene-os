"use client";

import type { IndustryEntry } from "@/apis/lookup";
import { requireApiData } from "@/lib/api-result";
import { listIndustries } from "@/lib/actions";
import { useQuery } from "@tanstack/react-query";

// Stable reference so callers don't re-render on every miss.
const EMPTY: IndustryEntry[] = [];

// Industry pickers want the whole lookup in one go; the API caps a page at 100.
export function useIndustryList(enabled: boolean) {
  const { data } = useQuery({
    queryKey: ["lookup", "industries"],
    queryFn: async () =>
      requireApiData(await listIndustries({ page: 1, page_size: 100 })).list,
    enabled,
    // Industries barely change, so every picker after the first opens from cache.
    staleTime: 60 * 60 * 1000,
  });

  return data ?? EMPTY;
}
