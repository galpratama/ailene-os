import Label, { LabelVariant } from "@/components/labels/Label";
import type { UserStatus } from "@/apis/users";
import {
  Archive,
  Ban,
  CheckCircle2,
  LucideIcon,
  MailQuestion,
  PauseCircle,
} from "lucide-react";

const statusStyles: Record<
  UserStatus,
  { variant: LabelVariant; icon: LucideIcon; label: string }
> = {
  INVITED: { variant: "biru", icon: MailQuestion, label: "Invited" },
  ACTIVE: { variant: "hijau", icon: CheckCircle2, label: "Active" },
  SUSPENDED: { variant: "kuning", icon: PauseCircle, label: "Suspended" },
  DEACTIVATED: { variant: "oranye", icon: Ban, label: "Deactivated" },
  ARCHIVED: { variant: "gray", icon: Archive, label: "Archived" },
};

export default function UserStatusLabel({
  status,
}: {
  status: UserStatus;
}) {
  const { variant, icon: Icon, label } = statusStyles[status];

  return (
    <Label variant={variant}>
      <Icon size={12} />
      {label}
    </Label>
  );
}
