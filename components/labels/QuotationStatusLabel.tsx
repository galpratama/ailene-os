import Label, { LabelVariant } from "@/components/labels/Label";
import type { B2BQuotationStatusEnum } from "@prisma/client";
import {
  CheckCircle2,
  CircleDot,
  Eye,
  FileEdit,
  LucideIcon,
  Send,
  ThumbsDown,
  TimerOff,
} from "lucide-react";

const statusStyles: Record<
  B2BQuotationStatusEnum,
  { variant: LabelVariant; icon: LucideIcon; label: string }
> = {
  DRAFT: { variant: "gray", icon: FileEdit, label: "Draft" },
  MANAGER_REVIEW: { variant: "kuning", icon: Eye, label: "Manager Review" },
  NEEDS_REVISION: { variant: "oranye", icon: CircleDot, label: "Needs Revision" },
  APPROVED: { variant: "biru", icon: CheckCircle2, label: "Approved" },
  SENT: { variant: "ungu", icon: Send, label: "Sent" },
  ACCEPTED: { variant: "hijau", icon: CheckCircle2, label: "Accepted" },
  REJECTED: { variant: "merah", icon: ThumbsDown, label: "Rejected" },
  EXPIRED: { variant: "gray", icon: TimerOff, label: "Expired" },
};

export default function QuotationStatusLabel({
  status,
}: {
  status: B2BQuotationStatusEnum;
}) {
  const { variant, icon: Icon, label } = statusStyles[status];

  return (
    <Label variant={variant}>
      <Icon size={12} />
      {label}
    </Label>
  );
}
