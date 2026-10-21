import Label, { LabelVariant } from "@/components/labels/Label";
import type { TaskStatus } from "@/apis/tasks";
import { CheckCircle2, CircleDot, Eye, ListTodo, LucideIcon } from "lucide-react";

const statusStyles: Record<
  TaskStatus,
  { variant: LabelVariant; icon: LucideIcon; label: string }
> = {
  to_do: { variant: "gray", icon: ListTodo, label: "To Do" },
  in_progress: { variant: "biru", icon: CircleDot, label: "In Progress" },
  review: { variant: "kuning", icon: Eye, label: "Review" },
  done: { variant: "hijau", icon: CheckCircle2, label: "Done" },
};

export default function ActionStatusLabel({
  status,
}: {
  status: TaskStatus;
}) {
  const { variant, icon: Icon, label } = statusStyles[status];

  return (
    <Label variant={variant}>
      <Icon size={12} />
      {label}
    </Label>
  );
}
