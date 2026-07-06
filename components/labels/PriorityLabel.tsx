import Label, { LabelVariant } from "@/components/labels/Label";
import type { B2BActionPriorityEnum } from "@prisma/client";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUp,
  Equal,
  LucideIcon,
} from "lucide-react";

const priorityStyles: Record<
  B2BActionPriorityEnum,
  { variant: LabelVariant; icon: LucideIcon; label: string }
> = {
  LOW: { variant: "gray", icon: ChevronDown, label: "Low" },
  MEDIUM: { variant: "biru", icon: Equal, label: "Medium" },
  HIGH: { variant: "oranye", icon: ChevronUp, label: "High" },
  URGENT: { variant: "merah", icon: ChevronsUp, label: "Urgent" },
};

export default function PriorityLabel({
  priority,
}: {
  priority: B2BActionPriorityEnum;
}) {
  const { variant, icon: Icon } = priorityStyles[priority];

  return (
    <Label variant={variant}>
      <Icon size={11} />
    </Label>
  );
}
