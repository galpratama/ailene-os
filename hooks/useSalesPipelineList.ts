"use client";

import type { PipelineData } from "@/apis/sales";
import { listPipelines } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { useQuery } from "@tanstack/react-query";

// Actions, meetings, and quotations now link to the Sales API's `pipelines` table.
// The API scopes each phase separately, so load both phase lists behind one cached query.
export function useSalesPipelineList(enabled: boolean) {
  return useQuery<PipelineData[]>({
    queryKey: ["sales", "pipelines", "all"],
    queryFn: async () => {
      const [sdr, bdr] = await Promise.all([
        listPipelines({ phase: "sdr", page: 1, page_size: 200 }),
        listPipelines({ phase: "bdr", page: 1, page_size: 200 }),
      ]);
      return [...requireApiData(sdr).list, ...requireApiData(bdr).list];
    },
    enabled,
  });
}
