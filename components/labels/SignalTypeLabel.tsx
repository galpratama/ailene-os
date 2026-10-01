import Label, { LabelVariant } from "@/components/labels/Label";
import type { SignalType } from "@/apis/signals";
import { Building2, Flame, LucideIcon, UserRound } from "lucide-react";

const typeStyles: Record<SignalType, { variant: LabelVariant; icon: LucideIcon; label: string }> = {
  hot_lead: { variant: "merah", icon: Flame, label: "Hot lead" },
  warm_account: { variant: "oranye", icon: Building2, label: "Warm account" },
  decision_maker: { variant: "ungu", icon: UserRound, label: "Decision maker" },
};

export default function SignalTypeLabel({ type }: { type: SignalType }) {
  const { variant, icon: Icon, label } = typeStyles[type];

  return (
    <Label variant={variant}>
      <Icon size={12} />
      {label}
    </Label>
  );
}
