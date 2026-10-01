import Label, { LabelVariant } from "@/components/labels/Label";
import type { SignalStatus } from "@/apis/signals";

const statusStyles: Record<SignalStatus, { variant: LabelVariant; label: string }> = {
  new: { variant: "biru", label: "New" },
  reviewed: { variant: "kuning", label: "Reviewed" },
  converted: { variant: "hijau", label: "Converted" },
  discarded: { variant: "gray", label: "Discarded" },
};

export default function SignalStatusLabel({ status }: { status: SignalStatus }) {
  const { variant, label } = statusStyles[status];

  return <Label variant={variant}>{label}</Label>;
}
