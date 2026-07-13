import type { TrainerApplicationStatusEnum } from "@prisma/client";
import Label, { type LabelVariant } from "./Label";

const statusConfig: Record<
  TrainerApplicationStatusEnum,
  { label: string; variant: LabelVariant }
> = {
  APPLIED: { label: "Applied", variant: "gray" },
  SHORTLISTED: { label: "Shortlisted", variant: "biru" },
  REJECTED: { label: "Rejected", variant: "merah" },
  SELECTED: { label: "Selected", variant: "hijau" },
};

export default function TrainerApplicationStatusLabel({
  status,
}: {
  status: TrainerApplicationStatusEnum;
}) {
  const config = statusConfig[status];
  return <Label variant={config.variant}>{config.label}</Label>;
}
