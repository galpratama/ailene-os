import Label, { LabelVariant } from "@/components/labels/Label";
import type { B2BMeetingStatusEnum } from "@prisma/client";
import { CalendarClock, CheckCircle2, LucideIcon, UserX, XCircle } from "lucide-react";

const statusStyles: Record<
  B2BMeetingStatusEnum,
  { variant: LabelVariant; icon: LucideIcon; label: string }
> = {
  SCHEDULED: { variant: "biru", icon: CalendarClock, label: "Scheduled" },
  HELD: { variant: "hijau", icon: CheckCircle2, label: "Held" },
  CANCELLED: { variant: "gray", icon: XCircle, label: "Cancelled" },
  NO_SHOW: { variant: "merah", icon: UserX, label: "No Show" },
};

export default function MeetingStatusLabel({
  status,
}: {
  status: B2BMeetingStatusEnum;
}) {
  const { variant, icon: Icon, label } = statusStyles[status];

  return (
    <Label variant={variant}>
      <Icon size={12} />
      {label}
    </Label>
  );
}
