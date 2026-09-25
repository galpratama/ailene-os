"use client";

import type { ActionData, ListActionsOptions } from "@/apis/actions";
import { requireApiData } from "@/lib/api-result";
import { listActions } from "@/lib/actions";
import { useQuery } from "@tanstack/react-query";

const PAGE_SIZE = 100;

// Boards and the calendar need every matching action, but the API caps a page at 100 — so walk all pages.
export function useActionList(
  filters: Omit<ListActionsOptions, "page" | "page_size">,
  enabled: boolean
) {
  return useQuery<ActionData[]>({
    queryKey: ["actions", "list", filters],
    queryFn: async () => {
      const first = requireApiData(
        await listActions({ ...filters, page: 1, page_size: PAGE_SIZE })
      );
      const rest = await Promise.all(
        Array.from({ length: Math.max(first.metapaging.total_page - 1, 0) }, (_, i) =>
          listActions({ ...filters, page: i + 2, page_size: PAGE_SIZE })
        )
      );
      return [...first.list, ...rest.flatMap((page) => requireApiData(page).list)];
    },
    enabled,
  });
}
