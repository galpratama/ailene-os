import type { TrainerLevelEnum } from "@prisma/client";
import Label, { type LabelVariant } from "./Label";

const levelConfig: Record<
  TrainerLevelEnum,
  { label: string; variant: LabelVariant }
> = {
  APPRENTICE: { label: "Apprentice", variant: "gray" },
  CERTIFIED: { label: "Certified Trainer", variant: "biru" },
  SENIOR: { label: "Senior / Specialist", variant: "pink" },
  LEAD: { label: "Lead Trainer", variant: "oranye" },
};

export default function TrainerLevelLabel({
  level,
}: {
  level: TrainerLevelEnum;
}) {
  const config = levelConfig[level];
  return <Label variant={config.variant}>{config.label}</Label>;
}
