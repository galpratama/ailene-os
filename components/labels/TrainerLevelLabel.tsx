import type { TrainerLevelEnum } from "@prisma/client";
import Label, { type LabelVariant } from "./Label";

const levelConfig: Record<
  TrainerLevelEnum,
  { label: string; variant: LabelVariant }
> = {
  JUNIOR: { label: "Junior", variant: "gray" },
  SENIOR: { label: "Senior", variant: "biru" },
};

export default function TrainerLevelLabel({
  level,
}: {
  level: TrainerLevelEnum;
}) {
  const config = levelConfig[level];
  return <Label variant={config.variant}>{config.label}</Label>;
}
