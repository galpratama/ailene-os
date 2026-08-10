import Label, { LabelVariant } from "@/components/labels/Label";
import type { OrganizationStatusEnum } from "@prisma/client";
import { Archive, Target, UserCheck } from "lucide-react";
import { LucideIcon } from "lucide-react";

const statusStyles: Record<
  OrganizationStatusEnum,
  { variant: LabelVariant; icon: LucideIcon; label: string }
> = {
  PROSPECT: { variant: "biru", icon: Target, label: "Prospect" },
  CUSTOMER: { variant: "hijau", icon: UserCheck, label: "Customer" },
  ARCHIVED: { variant: "gray", icon: Archive, label: "Archived" },
};

export default function OrganizationStatusLabel({
  status,
}: {
  status: OrganizationStatusEnum;
}) {
  const { variant, icon: Icon, label } = statusStyles[status];

  return (
    <Label variant={variant}>
      <Icon size={12} />
      {label}
    </Label>
  );
}
