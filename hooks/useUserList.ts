"use client";

import type { UserEntry, UserStatus } from "@/apis/users";
import { requireApiData } from "@/lib/api-result";
import { listUsers } from "@/lib/actions";
import { useQuery } from "@tanstack/react-query";

// Stable reference so callers don't re-render on every miss.
const EMPTY: UserEntry[] = [];

// User pickers only offer active accounts; the API caps a page at 100.
export function useUserList(enabled: boolean, status: UserStatus = "ACTIVE") {
  const { data } = useQuery({
    queryKey: ["users", "roster", status],
    queryFn: async () =>
      requireApiData(await listUsers({ page: 1, page_size: 100, status })).list,
    enabled,
    // The roster barely changes, so every picker after the first opens from cache.
    staleTime: 5 * 60 * 1000,
  });

  return data ?? EMPTY;
}
