import type { TrainerStatus } from "@/apis/trainers";
import Label, { type LabelVariant } from "./Label";

const statusConfig: Record<
  TrainerStatus,
  { label: string; variant: LabelVariant }
> = {
  active: { label: "Active", variant: "hijau" },
  inactive: { label: "Inactive", variant: "gray" },
};

export default function TrainerStatusLabel({
  status,
}: {
  status: TrainerStatus;
}) {
  const config = statusConfig[status];
  return <Label variant={config.variant}>{config.label}</Label>;
}
