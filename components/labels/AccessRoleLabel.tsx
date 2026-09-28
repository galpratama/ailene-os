import Label, { LabelVariant } from "@/components/labels/Label";
import type { UserRole } from "@/apis/users";
import { LucideIcon, Shield, UserRound } from "lucide-react";

const roleStyles: Record<
  UserRole,
  { label: string; variant: LabelVariant; icon: LucideIcon }
> = {
  ADMINISTRATOR: { label: "Administrator", variant: "oranye", icon: Shield },
  MEMBER: { label: "Member", variant: "gray", icon: UserRound },
};

export default function AccessRoleLabel({ role }: { role: UserRole }) {
  const { label, variant, icon: Icon } = roleStyles[role];

  return (
    <Label variant={variant}>
      <Icon size={12} />
      {label}
    </Label>
  );
}
