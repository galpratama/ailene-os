"use client";

import type { TaskData, ListTasksOptions } from "@/apis/tasks";
import { requireApiData } from "@/lib/api-result";
import { listTasks } from "@/lib/actions";
import { useQuery } from "@tanstack/react-query";

const PAGE_SIZE = 100;

// Boards and the calendar need every matching task, but the API caps a page at 100 — so walk all pages.
export function useTaskList(
  filters: Omit<ListTasksOptions, "page" | "page_size">,
  enabled: boolean
) {
  return useQuery<TaskData[]>({
    queryKey: ["tasks", "list", filters],
    queryFn: async () => {
      const first = requireApiData(
        await listTasks({ ...filters, page: 1, page_size: PAGE_SIZE })
      );
      const rest = await Promise.all(
        Array.from({ length: Math.max(first.metapaging.total_page - 1, 0) }, (_, i) =>
          listTasks({ ...filters, page: i + 2, page_size: PAGE_SIZE })
        )
      );
      return [...first.list, ...rest.flatMap((page) => requireApiData(page).list)];
    },
    enabled,
  });
}
