import Label, { LabelVariant } from "@/components/labels/Label";
import type { TaskPriority } from "@/apis/tasks";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUp,
  Equal,
  LucideIcon,
} from "lucide-react";

const priorityStyles: Record<
  TaskPriority,
  { variant: LabelVariant; icon: LucideIcon; label: string }
> = {
  low: { variant: "gray", icon: ChevronDown, label: "Low" },
  medium: { variant: "biru", icon: Equal, label: "Medium" },
  high: { variant: "oranye", icon: ChevronUp, label: "High" },
  urgent: { variant: "merah", icon: ChevronsUp, label: "Urgent" },
};

export default function PriorityLabel({
  priority,
}: {
  priority: TaskPriority;
}) {
  const { variant, icon: Icon } = priorityStyles[priority];

  return (
    <Label variant={variant}>
      <Icon size={11} />
    </Label>
  );
}
