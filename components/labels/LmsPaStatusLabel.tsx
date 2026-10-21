import Label, { LabelVariant } from "@/components/labels/Label";
import type { LmsPaBand, LmsPaStatus } from "@/apis/lms";

const styles: Record<LmsPaStatus, { label: string; variant: LabelVariant }> = {
  not_started: { label: "Not started", variant: "gray" },
  submitted: { label: "Scoring", variant: "kuning" },
  scored: { label: "Scored", variant: "hijau" },
};

// A scored member shows their band instead of the bare status.
export default function LmsPaStatusLabel({
  status,
  band,
  meetsTarget,
}: {
  status: LmsPaStatus;
  band: LmsPaBand | null;
  meetsTarget: boolean;
}) {
  if (status === "scored" && band) {
    return (
      <Label variant={meetsTarget ? "hijau" : "oranye"}>
        Band {band.band}
        {band.name ? ` · ${band.name}` : ""}
      </Label>
    );
  }
  const { label, variant } = styles[status];
  return <Label variant={variant}>{label}</Label>;
}
