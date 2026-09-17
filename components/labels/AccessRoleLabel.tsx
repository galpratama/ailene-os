import Label, { LabelVariant } from "@/components/labels/Label";
import type { UserRoleEnum } from "@prisma/client";
import { LucideIcon, Shield, UserRound } from "lucide-react";

const roleStyles: Record<
  UserRoleEnum,
  { label: string; variant: LabelVariant; icon: LucideIcon }
> = {
  ADMINISTRATOR: { label: "Administrator", variant: "oranye", icon: Shield },
  MEMBER: { label: "Member", variant: "gray", icon: UserRound },
};

export default function AccessRoleLabel({ role }: { role: UserRoleEnum }) {
  const { label, variant, icon: Icon } = roleStyles[role];

  return (
    <Label variant={variant}>
      <Icon size={12} />
      {label}
    </Label>
  );
}
