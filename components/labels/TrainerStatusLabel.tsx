import type { TrainerStatusEnum } from "@prisma/client";
import Label, { type LabelVariant } from "./Label";

const statusConfig: Record<
  TrainerStatusEnum,
  { label: string; variant: LabelVariant }
> = {
  ACTIVE: { label: "Active", variant: "hijau" },
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
