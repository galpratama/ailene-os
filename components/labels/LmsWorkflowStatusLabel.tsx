import type { LmsWorkflowStatus } from "@/apis/lms-workflows";
import Label from "@/components/labels/Label";

const statuses = {
  submitted: { label: "Needs review", variant: "kuning" },
  reviewed: { label: "Reviewed", variant: "hijau" },
} as const;

export default function LmsWorkflowStatusLabel({ status }: { status: LmsWorkflowStatus }) {
  const config = statuses[status];
  return <Label variant={config.variant}>{config.label}</Label>;
}
