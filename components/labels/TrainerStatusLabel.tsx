import type { TrainerStatusEnum } from "@prisma/client";
import Label, { type LabelVariant } from "./Label";

const statusConfig: Record<
  TrainerStatusEnum,
  { label: string; variant: LabelVariant }
> = {
  CANDIDATE: { label: "Candidate", variant: "biru" },
  CERTIFIED: { label: "Certified", variant: "hijau" },
  ACTIVE: { label: "Active", variant: "oranye" },
  REMEDIAL: { label: "Remedial", variant: "kuning" },
  INACTIVE: { label: "Inactive", variant: "gray" },
};

export default function TrainerStatusLabel({
  status,
}: {
  status: TrainerStatusEnum;
}) {
  const config = statusConfig[status];
  return <Label variant={config.variant}>{config.label}</Label>;
}
