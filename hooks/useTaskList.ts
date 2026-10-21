"use client";

import type { TaskData, ListTasksOptions } from "@/apis/tasks";
import { requireApiData } from "@/lib/api-result";
import { listTasks } from "@/lib/actions";
import { useQuery } from "@tanstack/react-query";

const PAGE_SIZE = 100;

type TaskFilters = Omit<ListTasksOptions, "page" | "page_size">;

async function fetchTaskPages(filters: TaskFilters): Promise<TaskData[]> {
  const first = requireApiData(
    await listTasks({ ...filters, page: 1, page_size: PAGE_SIZE })
  );
  const rest = await Promise.all(
    Array.from({ length: Math.max(first.metapaging.total_page - 1, 0) }, (_, i) =>
      listTasks({ ...filters, page: i + 2, page_size: PAGE_SIZE })
    )
  );
  return [...first.list, ...rest.flatMap((page) => requireApiData(page).list)];
}

// Boards and the calendar need every matching task, but the API caps a page at 100 — so walk all pages.
export function useTaskList(
  filters: TaskFilters,
  enabled: boolean,
  includeArchived = false
) {
  return useQuery<TaskData[]>({
    queryKey: ["tasks", "list", filters, { includeArchived }],
    queryFn: async () => {
      if (!includeArchived || filters.status) return fetchTaskPages(filters);
      // The API omits archived tasks by default; the calendar also reads their explicit status.
      const [active, archived] = await Promise.all([
        fetchTaskPages(filters),
        fetchTaskPages({ ...filters, status: "archived" }),
      ]);
      // A scheduler run between the reads can put the same task in both results.
      return [...new Map([...active, ...archived].map((task) => [task.id, task])).values()];
    },
    enabled,
  });
}
