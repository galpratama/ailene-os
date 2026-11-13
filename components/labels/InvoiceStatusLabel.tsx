import type { InvoiceStatus } from "@/apis/invoices";
import Label, { type LabelVariant } from "@/components/labels/Label";
import { invoiceStatusLabels } from "@/lib/invoices";
import { AlarmClock, CheckCircle2, CircleDashed, FileEdit, Send, type LucideIcon } from "lucide-react";

const statusStyles: Record<InvoiceStatus, { variant: LabelVariant; icon: LucideIcon }> = {
  draft: { variant: "gray", icon: FileEdit },
  issued: { variant: "biru", icon: Send },
  partially_paid: { variant: "kuning", icon: CircleDashed },
  overdue: { variant: "merah", icon: AlarmClock },
  paid: { variant: "hijau", icon: CheckCircle2 },
};

export default function InvoiceStatusLabel({ status }: { status: InvoiceStatus }) {
  const { variant, icon: Icon } = statusStyles[status];
  return (
    <Label variant={variant}>
      <Icon size={12} />
      {invoiceStatusLabels[status]}
    </Label>
  );
}
