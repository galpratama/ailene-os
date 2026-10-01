import Label, { LabelVariant } from "@/components/labels/Label";
import type { TrendingKeywordKind } from "@/apis/trending-keywords";
import { Flame, LucideIcon, TrendingUp } from "lucide-react";

const kindStyles: Record<
  TrendingKeywordKind,
  { variant: LabelVariant; icon: LucideIcon; label: string }
> = {
  rising: { variant: "hijau", icon: TrendingUp, label: "Rising" },
  top: { variant: "biru", icon: Flame, label: "Top" },
};

export default function TrendingKindLabel({ kind }: { kind: TrendingKeywordKind }) {
  const { variant, icon: Icon, label } = kindStyles[kind];

  return (
    <Label variant={variant}>
      <Icon size={12} />
      {label}
    </Label>
  );
}
