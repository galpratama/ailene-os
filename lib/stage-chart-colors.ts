// Mirrors StageLabel's variant mapping, as raw colors since recharts doesn't resolve Tailwind classes.
export const STAGE_CHART_COLORS: Record<string, string> = {
  lead_identified: "#9ca3af",
  triaging: "var(--biru)",
  attempting: "var(--biru)",
  engaged: "var(--toska)",
  qualified: "var(--ungu)",
  meeting_booked: "var(--ungu)",
  discovery_done: "var(--pink)",
  proposal_negotiation: "var(--kuning)",
  closed_won: "var(--hijau)",
  closed_lost: "var(--merah)",
};
