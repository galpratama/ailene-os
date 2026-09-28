import Label, { LabelVariant } from "@/components/labels/Label";
import type { QuotationStatus } from "@/apis/quotations";
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
  QuotationStatus,
  { variant: LabelVariant; icon: LucideIcon; label: string }
> = {
  draft: { variant: "gray", icon: FileEdit, label: "Draft" },
  manager_review: { variant: "kuning", icon: Eye, label: "Manager Review" },
  needs_revision: { variant: "oranye", icon: CircleDot, label: "Needs Revision" },
  approved: { variant: "biru", icon: CheckCircle2, label: "Approved" },
  sent: { variant: "ungu", icon: Send, label: "Sent" },
  accepted: { variant: "hijau", icon: CheckCircle2, label: "Accepted" },
  rejected: { variant: "merah", icon: ThumbsDown, label: "Rejected" },
  expired: { variant: "gray", icon: TimerOff, label: "Expired" },
};

export default function QuotationStatusLabel({
  status,
}: {
  status: QuotationStatus;
}) {
  const { variant, icon: Icon, label } = statusStyles[status];

  return (
    <Label variant={variant}>
      <Icon size={12} />
      {label}
    </Label>
  );
}
