import Label, { LabelVariant } from "@/components/labels/Label";
import type { DataScopeEnum } from "@prisma/client";
import { Building2, Globe2, LucideIcon, User, Users } from "lucide-react";

const scopeStyles: Record<
  DataScopeEnum,
  { variant: LabelVariant; icon: LucideIcon; label: string }
> = {
  OWN: { variant: "gray", icon: User, label: "Own data" },
  TEAM: { variant: "biru", icon: Users, label: "Team data" },
  ORGANIZATION: { variant: "ungu", icon: Building2, label: "Organization" },
  GLOBAL: { variant: "hijau", icon: Globe2, label: "All data" },
};

export default function DataScopeLabel({ scope }: { scope: DataScopeEnum }) {
  const { variant, icon: Icon, label } = scopeStyles[scope];

  return (
    <Label variant={variant}>
      <Icon size={12} />
      {label}
    </Label>
  );
}
