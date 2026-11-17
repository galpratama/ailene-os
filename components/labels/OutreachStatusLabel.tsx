import type { OutreachStatus } from "@/apis/outreach";
import Label from "@/components/labels/Label";
import { outreachStatusStyles } from "@/lib/outreach";

export default function OutreachStatusLabel({ status }: { status: OutreachStatus }) {
  const style = outreachStatusStyles[status] ?? { variant: "gray" as const, label: status };
  return <Label variant={style.variant}>{style.label}</Label>;
}
