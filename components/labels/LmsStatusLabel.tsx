import type { StatusEnum } from "@prisma/client";
import Label, { type LabelVariant } from "./Label";

const statusConfig: Record<StatusEnum, { label: string; variant: LabelVariant }> = {
  ACTIVE: { label: "Active", variant: "hijau" },
  INACTIVE: { label: "Inactive", variant: "gray" },
};

export default function LmsStatusLabel({ status }: { status: StatusEnum }) {
  const config = statusConfig[status];
  return <Label variant={config.variant}>{config.label}</Label>;
}
