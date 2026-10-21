"use client";

import type { UserEntry, UserStatus } from "@/apis/users";
import { requireApiData } from "@/lib/api-result";
import { listUsers } from "@/lib/actions";
import { useQuery } from "@tanstack/react-query";

// Stable reference so callers don't re-render on every miss.
const EMPTY: UserEntry[] = [];

// User pickers only offer active accounts; the API caps a page at 100.
export function useUserList(enabled: boolean, status: UserStatus = "active") {
  const { data } = useQuery({
    queryKey: ["users", "roster", status],
    queryFn: async () => {
      const first = requireApiData(await listUsers({ page: 1, page_size: 100, status }));
      const rest = await Promise.all(
        Array.from({ length: Math.max(first.metapaging.total_page - 1, 0) }, (_, i) =>
          listUsers({ page: i + 2, page_size: 100, status })
        )
      );
      return [...first.list, ...rest.flatMap((page) => requireApiData(page).list)];
    },
    enabled,
    // The roster barely changes, so every picker after the first opens from cache.
    staleTime: 5 * 60 * 1000,
  });

  return data ?? EMPTY;
}
