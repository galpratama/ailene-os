import type { TrainerStage } from "@/apis/trainers";
import Label, { type LabelVariant } from "./Label";

const stageConfig: Record<
  TrainerStage,
  { label: string; variant: LabelVariant }
> = {
  candidate: { label: "Candidate", variant: "biru" },
  qualified: { label: "Qualified", variant: "kuning" },
  not_qualified: { label: "Not qualified", variant: "merah" },
  eligible: { label: "Eligible", variant: "hijau" },
  not_eligible: { label: "Not eligible", variant: "merah" },
};

export default function TrainerStageLabel({
  stage,
}: {
  stage: TrainerStage;
}) {
  const config = stageConfig[stage];
  return <Label variant={config.variant}>{config.label}</Label>;
}
