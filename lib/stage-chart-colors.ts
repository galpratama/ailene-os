// Mirrors StageLabel's variant mapping, as raw colors since recharts doesn't resolve Tailwind classes.
export const STAGE_CHART_COLORS: Record<string, string> = {
  lead_identified: "var(--color-gray-400)",
  triaging: "var(--biru)",
  attempting: "var(--biru)",
  engaged: "var(--toska)",
  qualified: "var(--ungu)",
  scheduling_meeting: "var(--oranye)",
  meeting_booked: "var(--ungu)",
  discovery_done: "var(--pink)",
  proposal_negotiation: "var(--kuning)",
  closed_won: "var(--hijau)",
  closed_lost: "var(--merah)",
};

export function stageChartColor(stage: string) {
  return STAGE_CHART_COLORS[stage] ?? "var(--claude)";
}
