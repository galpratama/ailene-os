import Label from "@/components/labels/Label";
import { PENDING_LABEL, type PendingBlocker } from "@/lib/revenue";
import { Hourglass, Unplug } from "lucide-react";

// Marks a figure the dashboard already lays out but the API cannot serve yet.
export default function PendingLabelOS({ className, blocker = "backend" }: { className?: string; blocker?: PendingBlocker }) {
  if (blocker === "whatsapp") {
    return (
      <Label variant="gray" className={className}>
        <Unplug size={11} aria-hidden="true" />
        Need WhatsApp Integration
      </Label>
    );
  }
  return (
    <Label variant="kuning" className={className}>
      <Hourglass size={11} aria-hidden="true" />
      {PENDING_LABEL}
    </Label>
  );
}
