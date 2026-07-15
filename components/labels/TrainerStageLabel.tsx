import type { TrainerStageEnum } from "@prisma/client";
import Label, { type LabelVariant } from "./Label";

const stageConfig: Record<
  TrainerStageEnum,
  { label: string; variant: LabelVariant }
> = {
  CANDIDATE: { label: "Candidate", variant: "biru" },
  QUALIFIED: { label: "Qualified", variant: "kuning" },
  NOT_QUALIFIED: { label: "Not qualified", variant: "merah" },
  CERTIFIED: { label: "Certified", variant: "hijau" },
  NOT_ELIGIBLE: { label: "Not eligible", variant: "merah" },
};

export default function TrainerStageLabel({
  stage,
}: {
  stage: TrainerStageEnum;
}) {
  const config = stageConfig[stage];
  return <Label variant={config.variant}>{config.label}</Label>;
}
