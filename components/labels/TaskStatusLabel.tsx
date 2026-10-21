import Label, { LabelVariant } from "@/components/labels/Label";
import type { TaskStatus } from "@/apis/tasks";
import {
  Archive,
  CheckCircle2,
  CircleDot,
  Eye,
  Inbox,
  ListTodo,
  LucideIcon,
} from "lucide-react";

const statusStyles: Record<
  TaskStatus,
  { variant: LabelVariant; icon: LucideIcon; label: string }
> = {
  to_do: { variant: "gray", icon: ListTodo, label: "To Do" },
  backlog: { variant: "ungu", icon: Inbox, label: "Backlog" },
  in_progress: { variant: "biru", icon: CircleDot, label: "In Progress" },
  review: { variant: "kuning", icon: Eye, label: "Review" },
  done: { variant: "hijau", icon: CheckCircle2, label: "Done" },
  archived: { variant: "gray", icon: Archive, label: "Archived" },
};

export default function TaskStatusLabel({
  status,
  className,
}: {
  status: TaskStatus;
  className?: string;
}) {
  const { variant, icon: Icon, label } = statusStyles[status];

  return (
    <Label variant={variant} className={className}>
      <Icon size={12} className="shrink-0" />
      <span className="truncate">{label}</span>
    </Label>
  );
}
