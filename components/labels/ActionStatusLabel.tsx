import Label, { LabelVariant } from "@/components/labels/Label";
import type { B2BActionStatusEnum } from "@prisma/client";
import { CheckCircle2, CircleDot, Eye, ListTodo, LucideIcon } from "lucide-react";

const statusStyles: Record<
  B2BActionStatusEnum,
  { variant: LabelVariant; icon: LucideIcon; label: string }
> = {
  TO_DO: { variant: "gray", icon: ListTodo, label: "To Do" },
  IN_PROGRESS: { variant: "biru", icon: CircleDot, label: "In Progress" },
  REVIEW: { variant: "kuning", icon: Eye, label: "Review" },
  DONE: { variant: "hijau", icon: CheckCircle2, label: "Done" },
};

export default function ActionStatusLabel({
  status,
}: {
  status: B2BActionStatusEnum;
}) {
  const { variant, icon: Icon, label } = statusStyles[status];

  return (
    <Label variant={variant}>
      <Icon size={12} />
      {label}
    </Label>
  );
}
