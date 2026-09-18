import type { LeadSource, PipelinePhase, PipelineStage } from "@/apis/sales";

export const PIPELINE_STAGES_BY_PHASE: Record<PipelinePhase, PipelineStage[]> = {
  sdr: [
    "lead_identified",
    "triaging",
    "attempting",
    "engaged",
    "qualified",
    "meeting_booked",
    "disqualified",
  ],
  bdr: [
    "discovery_done",
    "proposal_negotiation",
    "closed_won",
    "closed_lost",
  ],
};

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  lead_identified: "Lead Identified",
  triaging: "Triaging",
  attempting: "Attempting",
  engaged: "Engaged",
  qualified: "Qualified",
  meeting_booked: "Meeting Booked",
  disqualified: "Disqualified",
  discovery_done: "Discovery Done",
  proposal_negotiation: "Proposal Negotiation",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

export const PIPELINE_STAGE_DOTS: Record<PipelineStage, string> = {
  lead_identified: "bg-gray-400",
  triaging: "bg-biru",
  attempting: "bg-biru",
  engaged: "bg-toska",
  qualified: "bg-ungu",
  meeting_booked: "bg-pink",
  disqualified: "bg-merah",
  discovery_done: "bg-kuning",
  proposal_negotiation: "bg-pink",
  closed_won: "bg-hijau",
  closed_lost: "bg-merah",
};

export function pipelineStageOptions(phase?: PipelinePhase) {
  const stages = phase
    ? PIPELINE_STAGES_BY_PHASE[phase]
    : [...PIPELINE_STAGES_BY_PHASE.sdr, ...PIPELINE_STAGES_BY_PHASE.bdr];
  return stages.map((value) => ({ value, label: PIPELINE_STAGE_LABELS[value] }));
}

export function isStageCompatibleWithLeadSource(
  stage: PipelineStage,
  leadSource: LeadSource
) {
  if (stage === "triaging") return leadSource === "inbound";
  if (stage === "attempting") return leadSource === "outbound";
  return true;
}
