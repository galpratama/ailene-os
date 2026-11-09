import Label from "@/components/labels/Label";
import { PENDING_LABEL } from "@/lib/revenue";
import { Hourglass } from "lucide-react";

// Marks a figure the dashboard already lays out but the API cannot serve yet.
export default function PendingLabelOS({ className }: { className?: string }) {
  return (
    <Label variant="kuning" className={className}>
      <Hourglass size={11} aria-hidden="true" />
      {PENDING_LABEL}
    </Label>
  );
}
