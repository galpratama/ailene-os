import type { TrainerLevel } from "@/apis/trainers";
import Label, { type LabelVariant } from "./Label";

const levelConfig: Record<
  TrainerLevel,
  { label: string; variant: LabelVariant }
> = {
  junior: { label: "Junior", variant: "gray" },
  senior: { label: "Senior", variant: "biru" },
};

export default function TrainerLevelLabel({
  level,
}: {
  level: TrainerLevel;
}) {
  const config = levelConfig[level];
  return <Label variant={config.variant}>{config.label}</Label>;
}
