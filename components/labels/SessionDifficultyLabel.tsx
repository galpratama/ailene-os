import type { B2BClassDifficultyEnum } from "@prisma/client";
import Label, { type LabelVariant } from "./Label";

const difficultyConfig: Record<
  B2BClassDifficultyEnum,
  { label: string; variant: LabelVariant }
> = {
  BEGINNER: { label: "Beginner", variant: "hijau" },
  ADVANCED: { label: "Advanced", variant: "oranye" },
};

export default function SessionDifficultyLabel({
  difficulty,
}: {
  difficulty: B2BClassDifficultyEnum;
}) {
  const config = difficultyConfig[difficulty];
  return <Label variant={config.variant}>{config.label}</Label>;
}
