"use client";

import type { OutcomeKind, OutcomeReason } from "@/apis/sales";
import { useSession } from "@/contexts/SessionContext";
import { listOutcomeReasons } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { useQuery } from "@tanstack/react-query";

const EMPTY: OutcomeReason[] = [];

// Every reason, retired ones included, so an older pipeline's label still resolves; pickers filter to active ones.
export function useOutcomeReasons(enabled = true) {
  const session = useSession();
  const query = useQuery({
    queryKey: ["sales", "outcome-reasons"],
    queryFn: async () => requireApiData(await listOutcomeReasons({ include_inactive: true })),
    enabled: enabled && !!session,
    staleTime: 60_000,
  });
  const reasons = query.data ?? EMPTY;
  return {
    ...query,
    reasons,
    labelOf: (code: string | null | undefined) => reasons.find((reason) => reason.code === code)?.label ?? null,
    optionsFor: (kind: OutcomeKind, keep?: string | null) =>
      reasons.filter((reason) => reason.kind === kind && (reason.active || reason.code === keep)).map((reason) => ({ value: reason.code, label: reason.label })),
  };
}
