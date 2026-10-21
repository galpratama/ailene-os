"use client";

import type { PipelineStageEntry } from "@/apis/sales";
import { useSession } from "@/contexts/SessionContext";
import { listPipelineStages } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { useQuery } from "@tanstack/react-query";

const EMPTY: PipelineStageEntry[] = [];

export function usePipelineStages(enabled = true) {
  const session = useSession();
  const query = useQuery({
    queryKey: ["sales", "pipeline-stages"],
    queryFn: async () => requireApiData(await listPipelineStages()),
    enabled: enabled && !!session,
    staleTime: 60_000,
  });
  return { ...query, stages: query.data ?? EMPTY };
}
