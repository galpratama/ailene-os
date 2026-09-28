"use client";

import type { ListMeetingsOptions, MeetingData } from "@/apis/meetings";
import { requireApiData } from "@/lib/api-result";
import { listMeetings } from "@/lib/actions";
import { useQuery } from "@tanstack/react-query";

const PAGE_SIZE = 100;

// The calendar shows every meeting in its window, but the API caps a page at 100 — so walk all pages.
export function useMeetingList(
  filters: Omit<ListMeetingsOptions, "page" | "page_size">,
  enabled: boolean
) {
  return useQuery<MeetingData[]>({
    queryKey: ["meetings", "list", filters],
    queryFn: async () => {
      const first = requireApiData(
        await listMeetings({ ...filters, page: 1, page_size: PAGE_SIZE })
      );
      const rest = await Promise.all(
        Array.from({ length: Math.max(first.metapaging.total_page - 1, 0) }, (_, i) =>
          listMeetings({ ...filters, page: i + 2, page_size: PAGE_SIZE })
        )
      );
      return [...first.list, ...rest.flatMap((page) => requireApiData(page).list)];
    },
    enabled,
  });
}
