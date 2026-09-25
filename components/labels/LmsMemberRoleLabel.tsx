import Label, { LabelVariant } from "@/components/labels/Label";
import type { LmsMemberRole } from "@/apis/lms";

export const lmsMemberRoleStyles: Record<
  LmsMemberRole,
  { label: string; variant: LabelVariant }
> = {
  champion: { label: "Champion", variant: "ungu" },
  student: { label: "Student", variant: "biru" },
  sponsor: { label: "Sponsor", variant: "oranye" },
};

export default function LmsMemberRoleLabel({ role }: { role: LmsMemberRole }) {
  const { label, variant } = lmsMemberRoleStyles[role];

  return <Label variant={variant}>{label}</Label>;
}
