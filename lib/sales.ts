import type { LeadSource, PipelinePhase, PipelineStage, PipelineStageDefinition } from "@/apis/sales";

export function orderedPipelineStages(catalog: readonly PipelineStageDefinition[]) {
  return [...catalog].sort((a, b) =>
    (a.phase === b.phase ? 0 : a.phase === "sdr" ? -1 : 1) || a.sort_order - b.sort_order || a.code.localeCompare(b.code)
  );
}

// BDR keeps the system meeting hand-off stage visible alongside its own catalog stages.
export function leadsPageStages(catalog: readonly PipelineStageDefinition[], phase: PipelinePhase) {
  const ordered = orderedPipelineStages(catalog);
  const own = ordered.filter((entry) => entry.phase === phase);
  const handoff = phase === "bdr" ? ordered.filter((entry) => entry.code === "meeting_booked" && entry.phase !== phase) : [];
  return [...handoff, ...own].map((entry) => entry.code);
}

export function pipelinePhaseOf(stage: PipelineStage, catalog: readonly PipelineStageDefinition[]) {
  return catalog.find((entry) => entry.code === stage)?.phase;
}

export function pipelineStageName(stage: PipelineStage, catalog: readonly PipelineStageDefinition[]) {
  return catalog.find((entry) => entry.code === stage)?.name ?? stage;
}

export function pipelineStageOptions(catalog: readonly PipelineStageDefinition[], phase?: PipelinePhase) {
  return orderedPipelineStages(catalog)
    .filter((entry) => !phase || entry.phase === phase)
    .map((entry) => ({ value: entry.code, label: entry.name }));
}

export function isStageCompatibleWithLeadSource(
  stage: PipelineStage,
  leadSource: LeadSource
) {
  if (stage === "triaging") return leadSource === "inbound";
  if (stage === "attempting") return leadSource === "outbound";
  return true;
}
