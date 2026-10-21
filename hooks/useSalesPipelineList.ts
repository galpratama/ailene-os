"use client";

import type { PipelineData, PipelinePhase } from "@/apis/sales";
import { listPipelines } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { useQuery } from "@tanstack/react-query";

// Tasks and quotations link to the Sales API's `pipelines` table.
// The API scopes each phase separately, so load both phase lists behind one cached query.
export function useSalesPipelineList(enabled: boolean) {
  return useQuery<PipelineData[]>({
    queryKey: ["sales", "pipelines", "all"],
    queryFn: async () => {
      const phases: PipelinePhase[] = ["sdr", "bdr"];
      const lists = await Promise.all(phases.map(async (phase) => {
        const first = requireApiData(await listPipelines({ phase, page: 1, page_size: 100 }));
        const rest = await Promise.all(
          Array.from({ length: Math.max(first.metapaging.total_page - 1, 0) }, (_, i) =>
            listPipelines({ phase, page: i + 2, page_size: 100 }).then(requireApiData)
          )
        );
        return [...first.list, ...rest.flatMap((page) => page.list)];
      }));
      return lists.flat();
    },
    enabled,
  });
}
