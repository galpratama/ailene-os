import type { B2BStageEnum } from "@prisma/client";

// Mirrors StageLabel's variant mapping, as raw colors since recharts doesn't resolve Tailwind classes.
export const STAGE_CHART_COLORS: Record<B2BStageEnum, string> = {
  LEAD_IDENTIFIED: "#9ca3af",
  CONTACTED: "var(--biru)",
  REPLIED: "var(--biru)",
  SHOW_INTEREST: "var(--toska)",
  MEETING_BOOKED: "var(--ungu)",
  NEGOTIATION: "var(--pink)",
  VERBAL_COMMIT: "var(--kuning)",
  CLOSED_WON: "var(--hijau)",
  CLOSED_LOST: "var(--merah)",
  ON_HOLD: "var(--oranye)",
};
