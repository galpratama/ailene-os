import Label, { LabelVariant } from "@/components/labels/Label";
import { Lock, LucideIcon, Shield, UserCog, UserRound } from "lucide-react";

// Role is a DB lookup table, not an enum, so this keys off the role name string.
const roleStyles: Record<
  string,
  { variant: LabelVariant; icon: LucideIcon }
> = {
  "Super Admin": { variant: "merah", icon: Lock },
  Administrator: { variant: "oranye", icon: Shield },
  Manager: { variant: "ungu", icon: UserCog },
  Staff: { variant: "biru", icon: UserRound },
  "Business Development": { variant: "toska", icon: UserRound },
  Trainer: { variant: "hijau", icon: UserRound },
  "General User": { variant: "gray", icon: UserRound },
};

export default function AccessRoleLabel({ roleName }: { roleName: string }) {
  const { variant, icon: Icon } = roleStyles[roleName] ?? {
    variant: "gray" as const,
    icon: UserRound,
  };

  return (
    <Label variant={variant}>
      <Icon size={12} />
      {roleName}
    </Label>
  );
}
