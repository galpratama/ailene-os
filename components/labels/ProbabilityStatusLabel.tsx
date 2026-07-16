import Label, { LabelVariant } from "@/components/labels/Label";
import type { B2BProbabilityStatusEnum } from "@prisma/client";
import { Flame, LucideIcon, Snowflake, Thermometer } from "lucide-react";

const probabilityStatusStyles: Record<
  B2BProbabilityStatusEnum,
  { variant: LabelVariant; icon: LucideIcon; label: string }
> = {
  COLD: { variant: "biru", icon: Snowflake, label: "Cold" },
  WARM: { variant: "kuning", icon: Thermometer, label: "Warm" },
  HOT: { variant: "merah", icon: Flame, label: "Hot" },
};

export default function ProbabilityStatusLabel({
  status,
}: {
  status: B2BProbabilityStatusEnum;
}) {
  const { variant, icon: Icon, label } = probabilityStatusStyles[status];

  return (
    <Label variant={variant}>
      <Icon size={12} />
      {label}
    </Label>
  );
}
